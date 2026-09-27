import crypto from 'node:crypto';
import { readFileSync } from 'node:fs';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import pg from 'pg';
import { travelData, packagesData } from '../src/mockData.js';

function loadLocalEnv() {
  if (process.env.VERCEL) return;

  try {
    const envFile = readFileSync(join(process.cwd(), '.env'), 'utf8');
    for (const line of envFile.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;
      const [key, ...valueParts] = trimmed.split('=');
      const normalizedKey = key.trim();
      if (!process.env[normalizedKey]) process.env[normalizedKey] = valueParts.join('=').trim();
    }
  } catch {
    // .env is optional; JSON fallback keeps local development simple.
  }
}

loadLocalEnv();

const { Pool } = pg;
const dbPath = process.env.VERCEL
  ? join(tmpdir(), 'voyara-db.json')
  : join(process.cwd(), 'server', 'data', 'db.json');
const jwtSecret = process.env.JWT_SECRET || 'voyara-local-development-secret';
const adminEmail = process.env.ADMIN_EMAIL || 'vanisha@example.com';
const adminPassword = process.env.ADMIN_PASSWORD || 'vanisha123';
let pool;
let schemaReady = false;
let schemaPromise;

function hasPostgres() {
  return Boolean(process.env.DATABASE_URL);
}

function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL?.includes('localhost') ? false : { rejectUnauthorized: false },
    });
  }

  return pool;
}

async function ensureSchema() {
  if (schemaReady) return;
  if (schemaPromise) {
    await schemaPromise;
    return;
  }

  schemaPromise = prepareSchema().catch((error) => {
    schemaPromise = undefined;
    throw error;
  });
  await schemaPromise;
}

async function prepareSchema() {
  if (schemaReady) return;

  if (!hasPostgres()) {
    await createDefaultAdmin();
    schemaReady = true;
    return;
  }

  await getPool().query(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS packages (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      region TEXT NOT NULL,
      budget TEXT NOT NULL,
      transport JSONB NOT NULL,
      destinations JSONB NOT NULL,
      duration TEXT NOT NULL,
      price_raw INTEGER NOT NULL,
      price TEXT NOT NULL,
      img TEXT NOT NULL,
      trending BOOLEAN NOT NULL DEFAULT FALSE,
      features JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
      status TEXT NOT NULL,
      payment_status TEXT NOT NULL,
      vehicle_name TEXT NOT NULL,
      vehicle_type TEXT,
      route TEXT NOT NULL,
      transport_type TEXT NOT NULL,
      seats JSONB NOT NULL,
      amount INTEGER NOT NULL,
      search JSONB,
      preferences JSONB,
      traveler JSONB NOT NULL,
      destination TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await createDefaultAdmin();
  schemaReady = true;
}

async function readDb() {
  try {
    const raw = await readFile(dbPath, 'utf8');
    const data = JSON.parse(raw);
    return {
      users: data.users || [],
      bookings: data.bookings || [],
      packages: data.packages || [],
    };
  } catch {
    return { users: [], bookings: [], packages: [] };
  }
}

async function writeDb(data) {
  await mkdir(dirname(dbPath), { recursive: true });
  await writeFile(dbPath, JSON.stringify(data, null, 2));
}

function publicUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role || 'user',
  };
}

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, storedHash) {
  const [salt, hash] = String(storedHash || '').split(':');
  if (!salt || !hash) return false;
  const comparison = crypto.scryptSync(password, salt, 64);
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), comparison);
}

function base64Url(value) {
  return Buffer.from(JSON.stringify(value)).toString('base64url');
}

function signToken(user) {
  const header = base64Url({ alg: 'HS256', typ: 'JWT' });
  const payload = base64Url({
    sub: user.id,
    email: user.email,
    role: user.role || 'user',
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
  });
  const signature = crypto.createHmac('sha256', jwtSecret).update(`${header}.${payload}`).digest('base64url');
  return `${header}.${payload}.${signature}`;
}

function verifyToken(token) {
  const [header, payload, signature] = String(token || '').split('.');
  if (!header || !payload || !signature) return null;

  const expected = crypto.createHmac('sha256', jwtSecret).update(`${header}.${payload}`).digest('base64url');
  if (signature.length !== expected.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;

  const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
  if (data.exp && data.exp < Math.floor(Date.now() / 1000)) return null;
  return data;
}

function getBearerToken(headers = {}) {
  const authorization = headers.authorization || headers.Authorization || '';
  return authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
}

async function findUserByEmail(email) {
  await ensureSchema();
  const normalizedEmail = String(email || '').trim().toLowerCase();

  if (hasPostgres()) {
    const result = await getPool().query('SELECT * FROM users WHERE email = $1', [normalizedEmail]);
    return result.rows[0] || null;
  }

  const db = await readDb();
  return db.users.find((user) => user.email === normalizedEmail) || null;
}

async function findUserById(id) {
  await ensureSchema();
  if (!id) return null;

  if (hasPostgres()) {
    const result = await getPool().query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  const db = await readDb();
  return db.users.find((user) => user.id === id) || null;
}

async function createUser({ name, email, password, role = 'user' }) {
  await ensureSchema();
  const user = {
    id: `usr_${crypto.randomUUID()}`,
    name: String(name || '').trim(),
    email: String(email || '').trim().toLowerCase(),
    password_hash: hashPassword(password),
    role,
    created_at: new Date().toISOString(),
  };

  if (hasPostgres()) {
    const result = await getPool().query(
      'INSERT INTO users (id, name, email, password_hash, role) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [user.id, user.name, user.email, user.password_hash, user.role],
    );
    return result.rows[0];
  }

  const db = await readDb();
  if (db.users.some((savedUser) => savedUser.email === user.email)) {
    const error = new Error('Account already exists for this email');
    error.status = 409;
    throw error;
  }
  db.users.push(user);
  await writeDb(db);
  return user;
}

async function createDefaultAdmin() {
  const existing = await findUserByEmailWithoutSchema(adminEmail);
  if (existing) return;
  await createUserWithoutSchema({
    name: 'Vanisha Singh',
    email: adminEmail,
    password: adminPassword,
    role: 'admin',
  });
}

async function findUserByEmailWithoutSchema(email) {
  const normalizedEmail = String(email || '').trim().toLowerCase();
  if (hasPostgres()) {
    const result = await getPool().query('SELECT * FROM users WHERE email = $1', [normalizedEmail]);
    return result.rows[0] || null;
  }

  const db = await readDb();
  return db.users.find((user) => user.email === normalizedEmail) || null;
}

async function createUserWithoutSchema(userInput) {
  const user = {
    id: `usr_${crypto.randomUUID()}`,
    name: String(userInput.name || '').trim(),
    email: String(userInput.email || '').trim().toLowerCase(),
    password_hash: hashPassword(userInput.password),
    role: userInput.role || 'user',
    created_at: new Date().toISOString(),
  };

  if (hasPostgres()) {
    await getPool().query(
      'INSERT INTO users (id, name, email, password_hash, role) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (email) DO NOTHING',
      [user.id, user.name, user.email, user.password_hash, user.role],
    );
    return user;
  }

  const db = await readDb();
  if (db.users.some((savedUser) => savedUser.email === user.email)) {
    return db.users.find((savedUser) => savedUser.email === user.email);
  }
  db.users.push(user);
  await writeDb(db);
  return user;
}

async function getCurrentUser(headers) {
  const token = getBearerToken(headers);
  const payload = verifyToken(token);
  if (!payload) return null;
  return findUserById(payload.sub);
}

function validateAuth(body) {
  if (!body.name && body.mode === 'register') return 'Full name is required';
  if (!body.email || !/^\S+@\S+\.\S+$/.test(body.email)) return 'Valid email is required';
  if (!body.password || String(body.password).length < 6) return 'Password must be at least 6 characters';
  return null;
}

function validatePackage(body) {
  if (!body.title || !body.region || !body.destinations || !body.priceRaw) {
    return 'Package title, region, destinations, and price are required';
  }
  if (!Number.isFinite(Number(body.priceRaw)) || Number(body.priceRaw) <= 0) return 'Package price must be valid';
  return null;
}

function validateBooking(body) {
  const required = ['vehicleName', 'route', 'transportType', 'seats', 'amount', 'traveler', 'destination'];
  const missing = required.filter((key) => body[key] === undefined || body[key] === null || body[key] === '');
  if (missing.length) return `Missing fields: ${missing.join(', ')}`;
  if (!Array.isArray(body.seats) || body.seats.length === 0) return 'At least one seat or room is required';
  if (!Number.isFinite(Number(body.amount)) || Number(body.amount) <= 0) return 'Booking amount must be valid';
  if (!body.traveler.name || !body.traveler.email || !body.traveler.phone) return 'Traveler name, email, and phone are required';
  if (!/^\S+@\S+\.\S+$/.test(body.traveler.email)) return 'Traveler email is invalid';
  return null;
}

function normalizePackage(body) {
  const priceRaw = Number(body.priceRaw);
  return {
    id: body.id || `pkg_${Date.now()}`,
    title: body.title,
    region: body.region,
    budget: body.budget || 'Middle Class',
    transport: body.transport || ['Flight', 'Hotel'],
    destinations: Array.isArray(body.destinations)
      ? body.destinations
      : String(body.destinations).split(',').map((item) => item.trim()).filter(Boolean),
    duration: body.duration || '4N / 5D',
    priceRaw,
    price: `Rs. ${priceRaw.toLocaleString('en-IN')}`,
    img: body.img || 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=600&auto=format&fit=crop',
    trending: Boolean(body.trending),
    features: body.features || ['Custom Package', 'Verified Stay', 'Flexible Booking'],
  };
}

function toPackage(row) {
  return {
    id: row.id,
    title: row.title,
    region: row.region,
    budget: row.budget,
    transport: row.transport,
    destinations: row.destinations,
    duration: row.duration,
    priceRaw: row.price_raw,
    price: row.price,
    img: row.img,
    trending: row.trending,
    features: row.features,
  };
}

function normalizeBooking(body, user) {
  return {
    id: `VYA-${Date.now().toString().slice(-6)}`,
    userId: user?.id || null,
    status: 'CONFIRMED',
    paymentStatus: 'PAID',
    createdAt: new Date().toISOString(),
    ...body,
  };
}

function toBooking(row) {
  return {
    id: row.id,
    userId: row.user_id,
    status: row.status,
    paymentStatus: row.payment_status,
    createdAt: row.created_at,
    vehicleName: row.vehicle_name,
    vehicleType: row.vehicle_type,
    route: row.route,
    transportType: row.transport_type,
    seats: row.seats,
    amount: row.amount,
    search: row.search,
    preferences: row.preferences,
    traveler: row.traveler,
    destination: row.destination,
  };
}

async function listPackages() {
  await ensureSchema();
  if (hasPostgres()) {
    const result = await getPool().query('SELECT * FROM packages ORDER BY created_at DESC');
    return [...result.rows.map(toPackage), ...packagesData];
  }

  const db = await readDb();
  return [...db.packages, ...packagesData];
}

async function savePackage(body) {
  await ensureSchema();
  const pkg = normalizePackage(body);

  if (hasPostgres()) {
    const result = await getPool().query(
      `INSERT INTO packages
        (id, title, region, budget, transport, destinations, duration, price_raw, price, img, trending, features)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [
        pkg.id,
        pkg.title,
        pkg.region,
        pkg.budget,
        JSON.stringify(pkg.transport),
        JSON.stringify(pkg.destinations),
        pkg.duration,
        pkg.priceRaw,
        pkg.price,
        pkg.img,
        pkg.trending,
        JSON.stringify(pkg.features),
      ],
    );
    return toPackage(result.rows[0]);
  }

  const db = await readDb();
  db.packages.unshift(pkg);
  await writeDb(db);
  return pkg;
}

async function listBookings(user) {
  await ensureSchema();
  if (hasPostgres()) {
    const params = user?.role === 'admin' ? [] : [user?.id || 'anonymous'];
    const sql = user?.role === 'admin'
      ? 'SELECT * FROM bookings ORDER BY created_at DESC'
      : 'SELECT * FROM bookings WHERE user_id = $1 OR user_id IS NULL ORDER BY created_at DESC';
    const result = await getPool().query(sql, params);
    return result.rows.map(toBooking);
  }

  const db = await readDb();
  const bookings = user?.role === 'admin'
    ? db.bookings
    : db.bookings.filter((booking) => !booking.userId || booking.userId === user?.id);
  return bookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

async function saveBooking(body, user) {
  await ensureSchema();
  const booking = normalizeBooking(body, user);

  if (hasPostgres()) {
    const result = await getPool().query(
      `INSERT INTO bookings
        (id, user_id, status, payment_status, vehicle_name, vehicle_type, route, transport_type, seats, amount, search, preferences, traveler, destination)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       RETURNING *`,
      [
        booking.id,
        booking.userId,
        booking.status,
        booking.paymentStatus,
        booking.vehicleName,
        booking.vehicleType,
        booking.route,
        booking.transportType,
        JSON.stringify(booking.seats),
        Number(booking.amount),
        JSON.stringify(booking.search || {}),
        JSON.stringify(booking.preferences || {}),
        JSON.stringify(booking.traveler),
        booking.destination,
      ],
    );
    return toBooking(result.rows[0]);
  }

  const db = await readDb();
  db.bookings.unshift(booking);
  await writeDb(db);
  return booking;
}

async function findBooking(id, user) {
  const bookings = await listBookings(user);
  return bookings.find((booking) => booking.id === id);
}

async function findBookingById(id) {
  await ensureSchema();

  if (hasPostgres()) {
    const result = await getPool().query('SELECT * FROM bookings WHERE id = $1', [id]);
    return result.rows[0] ? toBooking(result.rows[0]) : null;
  }

  const db = await readDb();
  return db.bookings.find((booking) => booking.id === id) || null;
}

async function adminStats() {
  await ensureSchema();
  if (hasPostgres()) {
    const result = await getPool().query(`
      SELECT
        (SELECT COUNT(*)::int FROM bookings) AS bookings,
        (SELECT COUNT(*)::int FROM packages) AS custom_packages,
        (SELECT COUNT(*)::int FROM users) AS users,
        COALESCE((SELECT SUM(amount)::int FROM bookings), 0) AS revenue,
        (SELECT COUNT(DISTINCT destination)::int FROM bookings) AS destinations
    `);
    const row = result.rows[0];
    return {
      bookings: row.bookings,
      customPackages: row.custom_packages,
      users: row.users,
      revenue: row.revenue,
      destinations: row.destinations,
      database: 'PostgreSQL',
    };
  }

  const db = await readDb();
  return {
    bookings: db.bookings.length,
    customPackages: db.packages.length,
    users: db.users.length,
    revenue: db.bookings.reduce((sum, booking) => sum + Number(booking.amount || 0), 0),
    destinations: new Set(db.bookings.map((booking) => booking.destination)).size,
    database: 'JSON fallback',
  };
}

function escapePdfText(value) {
  return String(value || '')
    .replaceAll('\\', '\\\\')
    .replaceAll('(', '\\(')
    .replaceAll(')', '\\)');
}

export function createTicketPdf(booking) {
  const lines = [
    'VOYARA TRAVEL',
    'Confirmed Travel Ticket',
    '',
    `Booking ID: ${booking.id}`,
    `Passenger: ${booking.traveler?.name || 'Traveler'}`,
    `Route: ${booking.route}`,
    `Service: ${booking.vehicleName}`,
    `Type: ${booking.vehicleType}`,
    `Seats/Room: ${(booking.seats || []).join(', ')}`,
    `Amount: Rs. ${Number(booking.amount || 0).toLocaleString('en-IN')}`,
    `Payment: ${booking.paymentStatus}`,
    `Status: ${booking.status}`,
    `Booked On: ${new Date(booking.createdAt).toLocaleString('en-IN')}`,
    '',
    'Please carry a valid government ID during travel.',
    'Generated securely by Voyara Travel.',
  ];

  const text = lines
    .map((line, index) => `BT /F1 ${index < 2 ? 20 : 12} Tf 72 ${760 - index * 28} Td (${escapePdfText(line)}) Tj ET`)
    .join('\n');
  const stream = `<< /Length ${Buffer.byteLength(text)} >>\nstream\n${text}\nendstream`;
  const objects = [
    '1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj',
    '2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj',
    '3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj',
    '4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >> endobj',
    `5 0 obj ${stream} endobj`,
  ];
  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  for (const object of objects) {
    offsets.push(Buffer.byteLength(pdf));
    pdf += `${object}\n`;
  }
  const xrefStart = Buffer.byteLength(pdf);
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i < offsets.length; i += 1) {
    pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;
  return Buffer.from(pdf);
}

function createAiPlan(body = {}) {
  const destination = body.destination || 'Dubai';
  const days = Math.max(1, Math.min(Number(body.days || 4), 10));
  const budget = Number(body.budget || 60000);
  const style = body.style || 'Balanced';
  const pace = budget > 150000 ? 'premium' : budget > 60000 ? 'comfort' : 'smart budget';
  const dayIdeas = [
    'arrival, hotel check-in, nearby food street, and evening viewpoint',
    'landmark sightseeing, local market, and guided cultural experience',
    'adventure or nature activity with a relaxed cafe break',
    'premium experience, sunset spot, and shopping district',
    'hidden gems, photo stops, and local food crawl',
    'museum or heritage walk with leisure time',
    'free morning, souvenir shopping, and departure planning',
  ];

  return {
    title: `${days}-day ${destination} ${style.toLowerCase()} plan`,
    summary: `A ${pace} itinerary for ${destination} built around ${days} days, Rs. ${budget.toLocaleString('en-IN')} budget, and ${style.toLowerCase()} travel style.`,
    estimatedBudget: budget,
    days: Array.from({ length: days }, (_, index) => ({
      day: index + 1,
      title: `Day ${index + 1}: ${destination} ${index === 0 ? 'arrival and essentials' : 'experience route'}`,
      plan: dayIdeas[index % dayIdeas.length],
      tip: index === 0 ? 'Keep the first evening light after travel.' : 'Pre-book popular attractions to avoid queues.',
    })),
    packing: ['Valid ID/passport', 'Comfortable walking shoes', 'Power bank', 'Weather-ready outfit', 'Digital ticket copies'],
    safety: ['Share hotel and route with family', 'Keep emergency contacts offline', 'Use verified transport providers'],
  };
}

function json(status, body) {
  return {
    status,
    headers: { 'Content-Type': 'application/json' },
    body,
  };
}

function requireAdmin(user) {
  if (user?.role === 'admin') return null;
  return json(403, { error: 'Admin access required' });
}

export async function handleApiRequest({ method, path, body = {}, headers = {} }) {
  await ensureSchema();
  const user = await getCurrentUser(headers);

  if (method === 'GET' && path === '/health') {
    return json(200, {
      ok: true,
      service: 'voyara-api',
      database: hasPostgres() ? 'PostgreSQL connected' : 'JSON fallback',
    });
  }

  if (method === 'POST' && path === '/auth/register') {
    const error = validateAuth({ ...body, mode: 'register' });
    if (error) return json(400, { error });
    if (await findUserByEmail(body.email)) return json(409, { error: 'Account already exists for this email' });
    const createdUser = await createUser(body);
    return json(201, { user: publicUser(createdUser), token: signToken(createdUser) });
  }

  if (method === 'POST' && path === '/auth/login') {
    const error = validateAuth(body);
    if (error) return json(400, { error });
    const foundUser = await findUserByEmail(body.email);
    if (!foundUser || !verifyPassword(body.password, foundUser.password_hash)) {
      return json(401, { error: 'Invalid email or password' });
    }
    return json(200, { user: publicUser(foundUser), token: signToken(foundUser) });
  }

  if (method === 'GET' && path === '/auth/me') {
    return json(200, { user: publicUser(user) });
  }

  if (method === 'GET' && path === '/destinations') return json(200, travelData);
  if (method === 'GET' && path === '/packages') return json(200, await listPackages());

  if (method === 'POST' && path === '/packages') {
    const denied = requireAdmin(user);
    if (denied) return denied;
    const error = validatePackage(body);
    if (error) return json(400, { error });
    return json(201, await savePackage(body));
  }

  if (method === 'GET' && path === '/bookings') {
    if (!user) return json(401, { error: 'Please sign in to view your bookings' });
    return json(200, await listBookings(user));
  }

  if (method === 'POST' && path === '/bookings') {
    if (!user) return json(401, { error: 'Please sign in before confirming a booking' });
    const error = validateBooking(body);
    if (error) return json(400, { error });
    return json(201, await saveBooking(body, user));
  }

  if (method === 'GET' && path === '/admin/stats') {
    const denied = requireAdmin(user);
    if (denied) return denied;
    return json(200, await adminStats());
  }

  const ticketMatch = path.match(/^\/bookings\/([^/]+)\/ticket\.pdf$/);
  if (method === 'GET' && ticketMatch) {
    const booking = user ? await findBooking(ticketMatch[1], user) : await findBookingById(ticketMatch[1]);
    if (!booking) return json(404, { error: 'Booking not found' });
    return {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${booking.id}-ticket.pdf"`,
      },
      body: createTicketPdf(booking),
    };
  }

  if (method === 'POST' && path === '/ai/plan') return json(200, createAiPlan(body));

  return json(404, { error: 'Route not found' });
}
