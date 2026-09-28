import { handleApiRequest } from './backend.js';

export function createVercelHandler(pathFromRequest) {
  return async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
      res.status(204).end();
      return;
    }

    try {
      const url = new URL(req.url, `https://${req.headers.host || 'voyara.vercel.app'}`);
      const result = await handleApiRequest({
        method: req.method,
        path: pathFromRequest(req),
        body: req.body || {},
        headers: req.headers,
        query: Object.fromEntries(url.searchParams),
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
  };
}
