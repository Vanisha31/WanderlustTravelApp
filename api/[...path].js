import { handleApiRequest } from '../server/backend.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  const url = new URL(req.url, `https://${req.headers.host || 'voyara.vercel.app'}`);
  const path = url.pathname.replace(/^\/api/, '') || '/';

  try {
    const result = await handleApiRequest({
      method: req.method,
      path,
      body: req.body || {},
      headers: req.headers,
    });

    for (const [key, value] of Object.entries(result.headers || {})) {
      res.setHeader(key, value);
    }

    if (Buffer.isBuffer(result.body)) {
      res.status(result.status).send(result.body);
      return;
    }

    res.status(result.status).json(result.body);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || 'Internal server error' });
  }
}
