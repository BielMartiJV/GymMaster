import { Router } from 'express';
import pool from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// ─────────────────────────────────────────────
// GET /api/subscripcions — Llistar plans actius
// ─────────────────────────────────────────────
router.get('/', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT id_subscripcio, nom, descripcio, preu, durada_dies FROM subscripcio WHERE activa = 1 ORDER BY preu ASC'
    );
    res.json({ ok: true, data: rows });
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────
// GET /api/subscripcions/meva — Subscripció activa del soci
// ─────────────────────────────────────────────
router.get('/meva', requireAuth, async (req, res, next) => {
  try {
    const { id, rol } = req.user;
    if (rol !== 'soci') {
      return next({ status: 403, message: 'Només els socis poden consultar la seva subscripció.' });
    }

    const [rows] = await pool.query(`
      SELECT
        ss.id_soci_sub,
        ss.data_inici,
        ss.data_fi,
        ss.activa,
        ss.renovacio_automatica,
        sub.id_subscripcio,
        sub.nom AS nom_pla,
        sub.descripcio AS descripcio_pla,
        sub.preu,
        sub.durada_dies,
        DATEDIFF(ss.data_fi, CURDATE()) AS dies_restants
      FROM soci_subscripcio ss
      INNER JOIN subscripcio sub ON ss.id_subscripcio = sub.id_subscripcio
      WHERE ss.id_soci = ? AND ss.activa = 1 AND ss.data_fi >= CURDATE()
      ORDER BY ss.data_fi DESC
      LIMIT 1
    `, [id]);

    if (rows.length === 0) {
      return res.json({ ok: true, data: null, message: 'No tens cap subscripció activa.' });
    }
    res.json({ ok: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────
// POST /api/subscripcions/subscriure — Subscriure's a un pla
// Body: { id_subscripcio }
// ─────────────────────────────────────────────
router.post('/subscriure', requireAuth, async (req, res, next) => {
  try {
    const { id, rol } = req.user;
    if (rol !== 'soci') {
      return next({ status: 403, message: 'Només els socis poden subscriure\'s a un pla.' });
    }

    const { id_subscripcio } = req.body;
    if (!id_subscripcio) {
      return next({ status: 400, message: 'Cal proporcionar id_subscripcio.' });
    }

    // Verificar que el pla existeix
    const [plans] = await pool.query(
      'SELECT id_subscripcio, nom, preu, durada_dies FROM subscripcio WHERE id_subscripcio = ? AND activa = 1',
      [id_subscripcio]
    );
    if (plans.length === 0) {
      return next({ status: 404, message: 'Pla de subscripció no trobat.' });
    }

    const pla = plans[0];

    // Desactivar qualsevol subscripció activa anterior
    await pool.query(
      'UPDATE soci_subscripcio SET activa = 0 WHERE id_soci = ? AND activa = 1',
      [id]
    );

    // Calcular dates
    const dataInici = new Date().toISOString().slice(0, 10);
    const dataFiDate = new Date();
    dataFiDate.setDate(dataFiDate.getDate() + pla.durada_dies);
    const dataFi = dataFiDate.toISOString().slice(0, 10);

    // Crear nova subscripció
    const [resultSub] = await pool.query(
      `INSERT INTO soci_subscripcio (id_soci, id_subscripcio, data_inici, data_fi, activa)
       VALUES (?, ?, ?, ?, 1)`,
      [id, id_subscripcio, dataInici, dataFi]
    );

    // Crear registre de pagament pendent
    await pool.query(
      `INSERT INTO pagament (id_soci_sub, import, data_pagament, metode, estat)
       VALUES (?, ?, CURDATE(), 'pendent', 'pendent')`,
      [resultSub.insertId, pla.preu]
    );

    res.status(201).json({
      ok: true,
      message: `Subscripció al pla "${pla.nom}" creada correctament.`,
      data_inici: dataInici,
      data_fi: dataFi,
      preu: pla.preu,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
