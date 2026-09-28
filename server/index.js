import { createServer } from 'node:http';
import { handleApiRequest } from './backend.js';

const port = Number(process.env.PORT || 4000);

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

function send(res, result) {
  res.writeHead(result.status, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    ...result.headers,
  });

  if (Buffer.isBuffer(result.body)) {
    res.end(result.body);
    return;
  }

  res.end(JSON.stringify(result.body));
}

const server = createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    send(res, { status: 204, headers: { 'Content-Type': 'application/json' }, body: {} });
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const path = url.pathname.replace(/^\/api/, '') || '/';

  try {
    const result = await handleApiRequest({
      method: req.method,
      path,
      body: req.method === 'GET' ? {} : await readBody(req),
      headers: req.headers,
      query: Object.fromEntries(url.searchParams),
    });
    send(res, result);
  } catch (error) {
    send(res, {
      status: error.status || 500,
      headers: { 'Content-Type': 'application/json' },
      body: { error: error.message || 'Internal server error' },
    });
  }
});

server.listen(port, () => {
  console.log(`Voyara API running on http://localhost:${port}`);
});
