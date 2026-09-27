import { createVercelHandler } from '../server/vercel-handler.js';

export default createVercelHandler((req) => {
  const url = new URL(req.url, `https://${req.headers.host || 'voyara.vercel.app'}`);
  return url.pathname.replace(/^\/api/, '') || '/';
});
