import { createLiveEphemeralToken } from './_shared/gemini';

/**
 * Mints a short-lived, single-use Gemini Live API token so the browser can
 * connect directly to Google's Live WebSocket endpoint. This exists because
 * Vercel serverless functions cannot host a persistent WebSocket relay, so
 * the previous server-side proxy approach (server.ts /live) does not work
 * once deployed here. The real GEMINI_API_KEY never leaves this function.
 */
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const result = await createLiveEphemeralToken();
    res.status(200).json(result);
  } catch (error: any) {
    console.error('Live token minting error:', error);
    res.status(500).json({
      error: 'Failed to create live session token',
      details: error.message || String(error),
    });
  }
}
