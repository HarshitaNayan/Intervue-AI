import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import interviewRoutes from './routes/interview.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/interview', interviewRoutes);

app.get('/api/health', (_req, res) => res.json({ ok: true }));

// Serve the built React client (client/dist) so the whole app runs as one
// service with one URL — build the client first with `npm run build` in
// client/. Any non-API route falls back to index.html for the SPA router.
const clientDist = path.join(__dirname, '../client/dist');
app.use(express.static(clientDist));
app.get(/^\/(?!api).*/, (_req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'));
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  // BYOK: each visitor sends their own Gemini API key per-request
  // (x-gemini-key header), so there's no server-side key to check here.
  console.log(`InterVue AI server running on http://localhost:${PORT}`);
});
