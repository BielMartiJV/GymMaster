import { Router } from 'express';
import pool from '../db.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

// ─────────────────────────────────────────────
// GET /api/entrenadors — Llistar tots els entrenadors actius
// ─────────────────────────────────────────────
router.get('/', async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        e.id_entrenador,
        e.nom,
        e.cognoms,
        CONCAT(e.nom, ' ', e.cognoms) AS nom_complet,
        e.email,
        e.especialitats,
        e.biografia,
        e.foto,
        e.data_alta
      FROM entrenador e
      WHERE e.actiu = 1
      ORDER BY e.nom
    `);
    res.json({ ok: true, data: rows });
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────
// GET /api/entrenadors/:id — Detall + classes de l'entrenador
// ─────────────────────────────────────────────
router.get('/:id', async (req, res, next) => {
  try {
    const [entrenadors] = await pool.query(
      `SELECT id_entrenador, nom, cognoms, CONCAT(nom, ' ', cognoms) AS nom_complet,
              email, especialitats, biografia, foto, data_alta
       FROM entrenador WHERE id_entrenador = ? AND actiu = 1`,
      [req.params.id]
    );

    if (entrenadors.length === 0) {
      return next({ status: 404, message: 'Entrenador no trobat.' });
    }

    // Classes actives d'aquest entrenador
    const [classes] = await pool.query(
      `SELECT id_classe, nom, dia_setmana, hora_inici, durada, aforament_max,
              (aforament_max - places_ocupades) AS places_lliures, sala
       FROM classe
       WHERE id_entrenador = ? AND activa = 1
       ORDER BY dia_setmana, hora_inici`,
      [req.params.id]
    );

    res.json({
      ok: true,
      data: { ...entrenadors[0], classes },
    });
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────
// POST /api/entrenadors — Crear entrenador (Admin)
// ─────────────────────────────────────────────
router.post('/', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { nom, cognoms, email, especialitats, biografia, foto } = req.body;

    if (!nom || !cognoms || !email) {
      return next({ status: 400, message: 'Camps obligatoris: nom, cognoms, email.' });
    }

    const [result] = await pool.query(
      `INSERT INTO entrenador (nom, cognoms, email, especialitats, biografia, foto, data_alta, actiu)
       VALUES (?, ?, ?, ?, ?, ?, CURDATE(), 1)`,
      [nom, cognoms, email, especialitats || null, biografia || null, foto || null]
    );

    res.status(201).json({ ok: true, id_entrenador: result.insertId });
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────
// PUT /api/entrenadors/:id — Editar entrenador (Admin)
// ─────────────────────────────────────────────
router.put('/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { nom, cognoms, email, especialitats, biografia, foto } = req.body;

    const [result] = await pool.query(
      `UPDATE entrenador SET
        nom = COALESCE(?, nom),
        cognoms = COALESCE(?, cognoms),
        email = COALESCE(?, email),
        especialitats = COALESCE(?, especialitats),
        biografia = COALESCE(?, biografia),
        foto = COALESCE(?, foto)
       WHERE id_entrenador = ?`,
      [nom, cognoms, email, especialitats, biografia, foto, req.params.id]
    );

    if (result.affectedRows === 0) {
      return next({ status: 404, message: 'Entrenador no trobat.' });
    }
    res.json({ ok: true, message: 'Dades de l\'entrenador actualitzades.' });
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────
// DELETE /api/entrenadors/:id — Desactivar entrenador (Admin)
// ─────────────────────────────────────────────
router.delete('/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const [result] = await pool.query(
      'UPDATE entrenador SET actiu = 0 WHERE id_entrenador = ?',
      [req.params.id]
    );
    if (result.affectedRows === 0) {
      return next({ status: 404, message: 'Entrenador no trobat.' });
    }
    res.json({ ok: true, message: 'Entrenador desactivat correctament.' });
  } catch (err) {
    next(err);
  }
});

export default router;
