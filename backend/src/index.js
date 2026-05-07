import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import authRouter from './routes/auth.js';
import usersRouter from './routes/users.js';
import socisRouter from './routes/socis.js';
import classesRouter from './routes/classes.js';
import trainersRouter from './routes/trainers.js';
import reservationsRouter from './routes/reservations.js';
import subscriptionsRouter from './routes/subscriptions.js';
import adminRouter from './routes/admin.js';
import notificacionsRouter from './routes/notificacions.js';
import { errorHandler } from './middleware/errorHandler.js';
import { ensureSchema } from './schema.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:4173', 'http://127.0.0.1:5173'],
  credentials: true,
}));
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/socis', socisRouter);
app.use('/api/classes', classesRouter);
app.use('/api/entrenadors', trainersRouter);
app.use('/api/reserves', reservationsRouter);
app.use('/api/subscripcions', subscriptionsRouter);
app.use('/api/admin', adminRouter);
app.use('/api/notificacions', notificacionsRouter);

app.get('/api', (req, res) => {
  res.json({ ok: true, message: 'API GymMaster en marxa', versio: '1.0.0' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', ok: true, message: 'GymMaster API funcionant correctament' });
});

app.use((req, res, next) => {
  next({ status: 404, message: `Ruta no trobada: ${req.method} ${req.originalUrl}` });
});

app.use(errorHandler);

async function start() {
  try {
    await ensureSchema();
    app.listen(PORT, () => {
      console.log(`\nAPI GymMaster arrancada`);
      console.log(`   -> http://localhost:${PORT}/api\n`);
    });
  } catch (err) {
    console.error('Error iniciant servidor:', err);
    process.exit(1);
  }
}

start();
