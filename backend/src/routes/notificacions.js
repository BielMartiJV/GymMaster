import { Router } from 'express';
import pool from '../db.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.post('/', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { id_soci, titol, missatge, tipus } = req.body;

    if (!id_soci || !titol || !missatge) {
      return next({ status: 400, message: 'Falten camps obligatoris: id_soci, titol i missatge.' });
    }

    const [result] = await pool.execute(
      `INSERT INTO notificacio (id_soci, id_admin, titol, missatge, tipus, data_enviament, llegida)
       VALUES (?, ?, ?, ?, ?, NOW(), 0)`,
      [id_soci, req.user.id, titol.trim(), missatge.trim(), tipus || 'informativa']
    );

    res.status(201).json({ ok: true, id: result.insertId });
  } catch (err) {
    next(err);
  }
});

router.get('/', requireAuth, async (req, res, next) => {
  try {
    if (req.user.rol === 'admin' || req.user.userType === 'admin' || req.user.isAdmin === true) {
      return res.json({ ok: true, data: [] });
    }

    const [rows] = await pool.execute(
      'SELECT * FROM notificacio WHERE id_soci = ? ORDER BY data_enviament DESC',
      [req.user.id]
    );

    res.json({ ok: true, data: rows });
  } catch (err) {
    next(err);
  }
});

router.patch('/read-all', requireAuth, async (req, res, next) => {
  try {
    await pool.execute(
      'UPDATE notificacio SET llegida = 1 WHERE id_soci = ? AND llegida = 0',
      [req.user.id]
    );

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

router.patch('/:id/read', requireAuth, async (req, res, next) => {
  try {
    await pool.execute(
      'UPDATE notificacio SET llegida = 1 WHERE id_notificacio = ? AND id_soci = ?',
      [req.params.id, req.user.id]
    );

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    await pool.execute(
      'DELETE FROM notificacio WHERE id_notificacio = ? AND id_soci = ?',
      [req.params.id, req.user.id]
    );

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
