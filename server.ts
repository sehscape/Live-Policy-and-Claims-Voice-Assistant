import express from 'express';
import http from 'http';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { analyzePolicyClaim, createLiveEphemeralToken } from './api/_shared/gemini';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

app.use(express.json({ limit: '50mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

// Deep Policy Clause Analysis & Structured FNOL Generation
app.post('/api/policy/analyze', async (req, res) => {
  try {
    const result = await analyzePolicyClaim(req.body || {});
    res.json(result);
  } catch (error: any) {
    console.error('Policy analysis error:', error);
    res.status(500).json({
      error: 'Failed to analyze policy claim',
      details: error.message || String(error),
    });
  }
});

// Mints a short-lived Gemini Live API token so the browser can connect
// directly to Google's Live WebSocket endpoint (see api/live-token.ts for
// why this replaced the old server-side WebSocket proxy).
app.post('/api/live-token', async (req, res) => {
  try {
    const result = await createLiveEphemeralToken();
    res.json(result);
  } catch (error: any) {
    console.error('Live token minting error:', error);
    res.status(500).json({
      error: 'Failed to create live session token',
      details: error.message || String(error),
    });
  }
});

// Start Express server and mount Vite
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';
  const port = 3000;

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  server.listen(port, '0.0.0.0', () => {
    console.log(`NSOffice BFSI Voice Assistant running at http://localhost:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
