import { Router } from 'express';
import pool from '../db.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/dashboard', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const [[socisRow]] = await pool.execute('SELECT COUNT(*) AS total FROM soci WHERE actiu = 1');
    const [[entrenadorsRow]] = await pool.execute('SELECT COUNT(*) AS total FROM entrenador WHERE actiu = 1');
    const [[classesRow]] = await pool.execute('SELECT COUNT(*) AS total FROM classe WHERE activa = 1');
    const [[reservesRow]] = await pool.execute('SELECT COUNT(*) AS total FROM reserva WHERE activa = 1');

    const [upcomingClasses] = await pool.execute(
      `SELECT c.id_classe, c.nom, c.data_classe, c.hora_inici, c.places_ocupades, c.aforament_max,
              e.nom AS entrenador_nom, e.cognoms AS entrenador_cognoms
       FROM classe c
       LEFT JOIN entrenador e ON e.id_entrenador = c.id_entrenador
       WHERE c.activa = 1 AND c.data_classe IS NOT NULL AND c.data_classe >= CURDATE()
       ORDER BY c.data_classe ASC, c.hora_inici ASC
       LIMIT 5`
    );

    const [recentSocis] = await pool.execute(
      `SELECT id_soci, nom, cognoms, email, data_alta
       FROM soci
       WHERE actiu = 1
       ORDER BY data_alta DESC
       LIMIT 5`
    );

    res.json({
      metrics: {
        socisActius: socisRow.total,
        entrenadorsActius: entrenadorsRow.total,
        classesActives: classesRow.total,
        reservesActives: reservesRow.total,
      },
      upcomingClasses,
      recentSocis,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
