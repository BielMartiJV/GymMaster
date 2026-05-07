import { Router } from 'express';
import pool from '../db.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

const classSelect = `
  SELECT c.id_classe, c.nom, c.descripcio, c.id_entrenador, c.dia_setmana, c.hora_inici,
         c.data_classe, c.durada, c.aforament_max, c.places_ocupades, c.sala, c.activa,
         (c.aforament_max - c.places_ocupades) AS places_lliures,
         e.nom AS entrenador_nom, e.cognoms AS entrenador_cognoms,
         CONCAT(e.nom, ' ', e.cognoms) AS entrenador,
         e.especialitats AS entrenador_especialitats
  FROM classe c
  LEFT JOIN entrenador e ON e.id_entrenador = c.id_entrenador
`;

router.get('/', async (req, res, next) => {
  try {
    const [rows] = await pool.execute(
      `${classSelect}
       WHERE c.activa = 1
       ORDER BY c.data_classe ASC, c.dia_setmana ASC, c.hora_inici ASC`
    );

    res.json({ ok: true, data: rows, classes: rows });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const [rows] = await pool.execute(
      `${classSelect}
       WHERE c.id_classe = ?`,
      [req.params.id]
    );

    if (rows.length === 0) {
      return next({ status: 404, message: 'Classe no trobada.' });
    }

    res.json({ ok: true, data: rows[0], classe: rows[0] });
  } catch (err) {
    next(err);
  }
});

router.post('/', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const {
      nom,
      descripcio,
      id_entrenador,
      dia_setmana,
      hora_inici,
      data_classe,
      durada,
      aforament_max,
      places_ocupades,
      sala,
    } = req.body;

    if (!nom || !id_entrenador || !dia_setmana || !hora_inici || !durada || !aforament_max || !sala) {
      return next({ status: 400, message: 'Falten camps obligatoris per crear la classe.' });
    }

    const duration = Number(durada);
    const maxCapacity = Number(aforament_max);
    const occupied = Number(places_ocupades || 0);

    if (duration <= 0 || maxCapacity <= 0 || occupied < 0 || occupied > maxCapacity) {
      return next({ status: 400, message: 'Valors de durada o aforament no valids.' });
    }

    const [trainerRows] = await pool.execute(
      'SELECT id_entrenador FROM entrenador WHERE id_entrenador = ? AND actiu = 1',
      [id_entrenador]
    );
    if (trainerRows.length === 0) {
      return next({ status: 400, message: "L'entrenador seleccionat no existeix o esta inactiu." });
    }

    const [result] = await pool.execute(
      `INSERT INTO classe
       (nom, descripcio, id_entrenador, dia_setmana, hora_inici, data_classe, durada, aforament_max, places_ocupades, sala, activa)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [
        nom.trim(),
        descripcio?.trim() || null,
        id_entrenador,
        dia_setmana.trim(),
        hora_inici,
        data_classe || null,
        duration,
        maxCapacity,
        occupied,
        sala.trim(),
      ]
    );

    const [rows] = await pool.execute(`${classSelect} WHERE c.id_classe = ?`, [result.insertId]);
    res.status(201).json({ ok: true, id_classe: result.insertId, classe: rows[0], data: rows[0] });
  } catch (err) {
    next(err);
  }
});

router.put('/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const {
      nom,
      descripcio,
      id_entrenador,
      dia_setmana,
      hora_inici,
      data_classe,
      durada,
      aforament_max,
      places_ocupades,
      sala,
    } = req.body;

    if (!nom || !id_entrenador || !dia_setmana || !hora_inici || !durada || !aforament_max || !sala) {
      return next({ status: 400, message: 'Falten camps obligatoris per actualitzar la classe.' });
    }

    const duration = Number(durada);
    const maxCapacity = Number(aforament_max);
    const occupied = Number(places_ocupades || 0);

    if (duration <= 0 || maxCapacity <= 0 || occupied < 0 || occupied > maxCapacity) {
      return next({ status: 400, message: 'Valors de durada o aforament no valids.' });
    }

    const [trainerRows] = await pool.execute(
      'SELECT id_entrenador FROM entrenador WHERE id_entrenador = ? AND actiu = 1',
      [id_entrenador]
    );
    if (trainerRows.length === 0) {
      return next({ status: 400, message: "L'entrenador seleccionat no existeix o esta inactiu." });
    }

    const [result] = await pool.execute(
      `UPDATE classe
       SET nom = ?, descripcio = ?, id_entrenador = ?, dia_setmana = ?, hora_inici = ?,
           data_classe = ?, durada = ?, aforament_max = ?, places_ocupades = ?, sala = ?
       WHERE id_classe = ? AND activa = 1`,
      [
        nom.trim(),
        descripcio?.trim() || null,
        id_entrenador,
        dia_setmana.trim(),
        hora_inici,
        data_classe || null,
        duration,
        maxCapacity,
        occupied,
        sala.trim(),
        req.params.id,
      ]
    );

    if (result.affectedRows === 0) {
      return next({ status: 404, message: 'Classe no trobada.' });
    }

    const [rows] = await pool.execute(`${classSelect} WHERE c.id_classe = ?`, [req.params.id]);
    res.json({ ok: true, message: 'Classe actualitzada correctament.', classe: rows[0], data: rows[0] });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const [result] = await pool.execute(
      'UPDATE classe SET activa = 0 WHERE id_classe = ? AND activa = 1',
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
