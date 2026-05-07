import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import authRouter from './routes/auth.js';
import classesRouter from './routes/classes.js';
import trainersRouter from './routes/trainers.js';
import reservationsRouter from './routes/reservations.js';
import subscriptionsRouter from './routes/subscriptions.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Middlewares globals ───────────────────────────────────────
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:4173', 'http://127.0.0.1:5173'],
  credentials: true,
}));
app.use(express.json());

// ─── Rutes de l'API ───────────────────────────────────────────
app.use('/api/auth', authRouter);
app.use('/api/classes', classesRouter);
app.use('/api/entrenadors', trainersRouter);
app.use('/api/reserves', reservationsRouter);
app.use('/api/subscripcions', subscriptionsRouter);

// ─── Ruta arrel (health check) ────────────────────────────────
app.get('/api', (req, res) => {
  res.json({ ok: true, message: 'API GymMaster en marxa 💪', versio: '1.0.0' });
});

// ─── Ruta 404 per a tot el que no existeix ────────────────────
app.use((req, res, next) => {
  next({ status: 404, message: `Ruta no trobada: ${req.method} ${req.originalUrl}` });
});

// ─── Gestió d'errors centralitzada (SEMPRE l'últim middleware) ─
app.use(errorHandler);

// ─── Arrancar servidor ────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🏋️  API GymMaster arrancada`);
  console.log(`   ➜  http://localhost:${PORT}/api\n`);
});
