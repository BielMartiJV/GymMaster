import { Router } from 'express';
import pool from '../db.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

// ─────────────────────────────────────────────
// GET /api/reserves — Reserves actives del soci autenticat
// ─────────────────────────────────────────────
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const { id, rol } = req.user;
    if (rol !== 'soci') {
      return next({ status: 403, message: 'Només els socis poden consultar les seves reserves.' });
    }

    const [rows] = await pool.query(`
      SELECT
        r.id_reserva,
        r.data_classe,
        r.data_reserva,
        r.activa,
        c.id_classe,
        c.nom AS nom_classe,
        c.hora_inici,
        c.durada,
        c.sala,
        c.dia_setmana,
        CONCAT(e.nom, ' ', e.cognoms) AS entrenador
      FROM reserva r
      INNER JOIN classe c ON r.id_classe = c.id_classe
      INNER JOIN entrenador e ON c.id_entrenador = e.id_entrenador
      WHERE r.id_soci = ? AND r.activa = 1
      ORDER BY r.data_classe ASC, c.hora_inici ASC
    `, [id]);

    res.json({ ok: true, data: rows });
  } catch (err) {
    next(err);
  }
});

// ──────────────────────────────────────────────────────────────
// GET /api/reserves/classe/:classeId — Reserves d'una classe (Admin)
// ──────────────────────────────────────────────────────────────
router.get('/classe/:classeId', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { data_classe } = req.query;
    let query = `
      SELECT
        r.id_reserva,
        r.data_classe,
        r.data_reserva,
        r.assistit,
        r.activa,
        s.id_soci,
        CONCAT(s.nom, ' ', s.cognoms) AS soci,
        s.email AS soci_email
      FROM reserva r
      INNER JOIN soci s ON r.id_soci = s.id_soci
      WHERE r.id_classe = ?
    `;
    const params = [req.params.classeId];

    if (data_classe) {
      query += ' AND r.data_classe = ?';
      params.push(data_classe);
    }

    query += ' ORDER BY r.data_classe ASC, s.cognoms ASC';

    const [rows] = await pool.query(query, params);
    res.json({ ok: true, data: rows });
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────
// POST /api/reserves — Crear reserva amb control d'aforament
// Body: { id_classe, data_classe } — data_classe format YYYY-MM-DD
// ─────────────────────────────────────────────
router.post('/', requireAuth, async (req, res, next) => {
  const { id, rol } = req.user;
  if (rol !== 'soci') {
    return next({ status: 403, message: 'Només els socis poden fer reserves.' });
  }

  const { id_classe, data_classe } = req.body;
  if (!id_classe || !data_classe) {
    return next({ status: 400, message: 'Cal proporcionar id_classe i data_classe (YYYY-MM-DD).' });
  }

  // Validar format data
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data_classe)) {
    return next({ status: 400, message: 'El format de data_classe ha de ser YYYY-MM-DD.' });
  }

  // Comprovar que la data no és pasada
  const avui = new Date().toISOString().slice(0, 10);
  if (data_classe < avui) {
    return next({ status: 400, message: 'No es pot reservar una classe en una data passada.' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // 1. Bloquejar la fila de la classe per evitar race conditions
    const [classes] = await conn.query(
      'SELECT id_classe, aforament_max, places_ocupades, activa FROM classe WHERE id_classe = ? FOR UPDATE',
      [id_classe]
    );

    if (classes.length === 0 || !classes[0].activa) {
      await conn.rollback();
      return next({ status: 404, message: 'Classe no trobada o inactiva.' });
    }

    const classe = classes[0];

    // 2. Control d'aforament
    if (classe.places_ocupades >= classe.aforament_max) {
      await conn.rollback();
      return next({ status: 409, message: 'La classe està completa. No hi ha places disponibles.' });
    }

    // 3. Inserir reserva (la constraint UNIQUE a BD ja prevé duplicats)
    const [result] = await conn.query(
      `INSERT INTO reserva (id_soci, id_classe, data_classe, activa)
       VALUES (?, ?, ?, 1)`,
      [id, id_classe, data_classe]
    );

    // 4. Actualitzar places_ocupades
    await conn.query(
      'UPDATE classe SET places_ocupades = places_ocupades + 1 WHERE id_classe = ?',
      [id_classe]
    );

    await conn.commit();

    res.status(201).json({
      ok: true,
      message: 'Reserva creada correctament.',
      id_reserva: result.insertId,
      places_lliures: classe.aforament_max - classe.places_ocupades - 1,
    });
  } catch (err) {
    await conn.rollback();
    // Constraint UNIQUE violada → reserva duplicada
    if (err.code === 'ER_DUP_ENTRY') {
      return next({ status: 409, message: 'Ja tens una reserva per aquesta classe en aquesta data.' });
    }
    next(err);
  } finally {
    conn.release();
  }
});

// ─────────────────────────────────────────────
// DELETE /api/reserves/:id — Cancel·lar reserva del soci
// ─────────────────────────────────────────────
router.delete('/:id', requireAuth, async (req, res, next) => {
  const { id, rol } = req.user;
  if (rol !== 'soci') {
    return next({ status: 403, message: 'Només els socis poden cancel·lar reserves.' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Verificar que la reserva pertany al soci autenticat
    const [reserves] = await conn.query(
      'SELECT id_reserva, id_classe, activa FROM reserva WHERE id_reserva = ? AND id_soci = ? FOR UPDATE',
      [req.params.id, id]
    );

    if (reserves.length === 0) {
      await conn.rollback();
      return next({ status: 404, message: 'Reserva no trobada.' });
    }

    if (!reserves[0].activa) {
      await conn.rollback();
      return next({ status: 409, message: 'Aquesta reserva ja ha estat cancel·lada.' });
    }

    // Marcar com a cancel·lada
    await conn.query(
      'UPDATE reserva SET activa = 0, data_cancelacio = NOW() WHERE id_reserva = ?',
      [req.params.id]
    );

    // Alliberar la plaça
    await conn.query(
      'UPDATE classe SET places_ocupades = GREATEST(places_ocupades - 1, 0) WHERE id_classe = ?',
      [reserves[0].id_classe]
    );

    await conn.commit();
    res.json({ ok: true, message: 'Reserva cancel·lada correctament.' });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
});

export default router;
