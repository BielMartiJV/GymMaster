import { Router } from 'express';
import pool from '../db.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

// ─────────────────────────────────────────────
// GET /api/classes — Llistar totes les classes actives
// ─────────────────────────────────────────────
router.get('/', async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        c.id_classe,
        c.nom,
        c.descripcio,
        c.dia_setmana,
        c.hora_inici,
        c.durada,
        c.aforament_max,
        c.places_ocupades,
        (c.aforament_max - c.places_ocupades) AS places_lliures,
        c.sala,
        c.activa,
        e.id_entrenador,
        CONCAT(e.nom, ' ', e.cognoms) AS entrenador,
        e.especialitats AS entrenador_especialitats
      FROM classe c
      INNER JOIN entrenador e ON c.id_entrenador = e.id_entrenador
      WHERE c.activa = 1
      ORDER BY c.dia_setmana, c.hora_inici
    `);
    res.json({ ok: true, data: rows });
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────
// GET /api/classes/:id — Detall d'una classe
// ─────────────────────────────────────────────
router.get('/:id', async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        c.*,
        (c.aforament_max - c.places_ocupades) AS places_lliures,
        CONCAT(e.nom, ' ', e.cognoms) AS entrenador,
        e.email AS entrenador_email,
        e.especialitats AS entrenador_especialitats
      FROM classe c
      INNER JOIN entrenador e ON c.id_entrenador = e.id_entrenador
      WHERE c.id_classe = ?
    `, [req.params.id]);

    if (rows.length === 0) {
      return next({ status: 404, message: 'Classe no trobada.' });
    }
    res.json({ ok: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────
// POST /api/classes — Crear classe (Admin)
// ─────────────────────────────────────────────
router.post('/', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { nom, descripcio, id_entrenador, dia_setmana, hora_inici, durada, aforament_max, sala } = req.body;

    if (!nom || !id_entrenador || !dia_setmana || !hora_inici || !durada || !aforament_max) {
      return next({ status: 400, message: 'Camps obligatoris: nom, id_entrenador, dia_setmana, hora_inici, durada, aforament_max.' });
    }

    const [result] = await pool.query(
      `INSERT INTO classe (nom, descripcio, id_entrenador, dia_setmana, hora_inici, durada, aforament_max, sala, activa)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [nom, descripcio || null, id_entrenador, dia_setmana, hora_inici, durada, aforament_max, sala || null]
    );

    res.status(201).json({ ok: true, id_classe: result.insertId });
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────
// PUT /api/classes/:id — Editar classe (Admin)
// ─────────────────────────────────────────────
router.put('/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { nom, descripcio, id_entrenador, dia_setmana, hora_inici, durada, aforament_max, sala } = req.body;

    const [result] = await pool.query(
      `UPDATE classe SET
        nom = COALESCE(?, nom),
        descripcio = COALESCE(?, descripcio),
        id_entrenador = COALESCE(?, id_entrenador),
        dia_setmana = COALESCE(?, dia_setmana),
        hora_inici = COALESCE(?, hora_inici),
        durada = COALESCE(?, durada),
        aforament_max = COALESCE(?, aforament_max),
        sala = COALESCE(?, sala)
       WHERE id_classe = ?`,
      [nom, descripcio, id_entrenador, dia_setmana, hora_inici, durada, aforament_max, sala, req.params.id]
    );

    if (result.affectedRows === 0) {
      return next({ status: 404, message: 'Classe no trobada.' });
    }
    res.json({ ok: true, message: 'Classe actualitzada correctament.' });
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────
// DELETE /api/classes/:id — Desactivar classe (Admin)
// ─────────────────────────────────────────────
router.delete('/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const [result] = await pool.query(
      'UPDATE classe SET activa = 0 WHERE id_classe = ?',
      [req.params.id]
    );
    if (result.affectedRows === 0) {
      return next({ status: 404, message: 'Classe no trobada.' });
    }
    res.json({ ok: true, message: 'Classe desactivada correctament.' });
  } catch (err) {
    next(err);
  }
});

export default router;
