import { Router } from 'express';
import pool from '../db.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

function isAdmin(user) {
  return user?.rol === 'admin' || user?.userType === 'admin' || user?.isAdmin === true;
}

async function getUserReservations(userId) {
  const [rows] = await pool.execute(
    `SELECT r.id_reserva, r.id_soci, r.id_classe, r.data_reserva, r.data_classe, r.assistit, r.activa,
            c.nom AS classe_nom, c.nom AS nom_classe, c.hora_inici, c.durada, c.sala, c.dia_setmana,
            CONCAT(e.nom, ' ', e.cognoms) AS entrenador
     FROM reserva r
     INNER JOIN classe c ON c.id_classe = r.id_classe
     LEFT JOIN entrenador e ON e.id_entrenador = c.id_entrenador
     WHERE r.id_soci = ? AND r.activa = 1
     ORDER BY r.data_classe DESC, c.hora_inici DESC`,
    [userId]
  );

  return rows;
}

router.get('/', requireAuth, async (req, res, next) => {
  try {
    if (isAdmin(req.user)) {
      const [rows] = await pool.execute(
        `SELECT r.id_reserva, r.id_soci, r.id_classe, r.data_reserva, r.data_classe, r.assistit, r.activa,
                s.nom AS soci_nom, s.cognoms AS soci_cognoms, s.email AS soci_email,
                c.nom AS classe_nom, c.hora_inici
         FROM reserva r
         INNER JOIN soci s ON s.id_soci = r.id_soci
         INNER JOIN classe c ON c.id_classe = r.id_classe
         WHERE r.activa = 1
         ORDER BY r.data_classe ASC, c.hora_inici ASC`
      );

      return res.json({ ok: true, data: rows, reserves: rows });
    }

    const rows = await getUserReservations(req.user.id);
    res.json({ ok: true, data: rows, reserves: rows });
  } catch (err) {
    next(err);
  }
});

router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const rows = await getUserReservations(req.user.id);
    res.json({ ok: true, data: rows, reserves: rows });
  } catch (err) {
    next(err);
  }
});

router.get('/classe/:classeId', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { data_classe } = req.query;
    const params = [req.params.classeId];
    let query = `
      SELECT r.id_reserva, r.data_classe, r.data_reserva, r.assistit, r.activa,
             s.id_soci, CONCAT(s.nom, ' ', s.cognoms) AS soci, s.email AS soci_email
      FROM reserva r
      INNER JOIN soci s ON r.id_soci = s.id_soci
      WHERE r.id_classe = ?
    `;

    if (data_classe) {
      query += ' AND r.data_classe = ?';
      params.push(data_classe);
    }

    query += ' ORDER BY r.data_classe ASC, s.cognoms ASC';
    const [rows] = await pool.execute(query, params);
    res.json({ ok: true, data: rows, reserves: rows });
  } catch (err) {
    next(err);
  }
});

router.post('/', requireAuth, async (req, res, next) => {
  const connection = await pool.getConnection();

  try {
    let { id_soci, id_classe, data_classe, assistit } = req.body;

    if (!id_soci) {
      id_soci = req.user.id;
    } else if (!isAdmin(req.user) && Number(id_soci) !== Number(req.user.id)) {
      connection.release();
      return next({ status: 403, message: 'No tens permisos per reservar per un altre soci.' });
    }

    if (!id_soci || !id_classe || !data_classe) {
      connection.release();
      return next({ status: 400, message: 'Soci, classe i data son obligatoris.' });
    }

    await connection.beginTransaction();

    const [[soci]] = await connection.execute(
      'SELECT id_soci FROM soci WHERE id_soci = ? AND actiu = 1',
      [id_soci]
    );
    if (!soci) {
      await connection.rollback();
      connection.release();
      return next({ status: 400, message: 'El soci seleccionat no existeix o esta inactiu.' });
    }

    const [[classe]] = await connection.execute(
      'SELECT id_classe, aforament_max, places_ocupades, activa FROM classe WHERE id_classe = ? FOR UPDATE',
      [id_classe]
    );
    if (!classe || classe.activa !== 1) {
      await connection.rollback();
      connection.release();
      return next({ status: 400, message: 'La classe seleccionada no existeix o esta inactiva.' });
    }

    if (Number(classe.places_ocupades) >= Number(classe.aforament_max)) {
      await connection.rollback();
      connection.release();
      return next({ status: 409, message: 'No queden places disponibles per aquesta classe.' });
    }

    const [existing] = await connection.execute(
      `SELECT id_reserva FROM reserva
       WHERE id_soci = ? AND id_classe = ? AND data_classe = ? AND activa = 1`,
      [id_soci, id_classe, data_classe]
    );
    if (existing.length > 0) {
      await connection.rollback();
      connection.release();
      return next({ status: 409, message: 'Ja existeix una reserva activa per aquest soci i classe.' });
    }

    const [result] = await connection.execute(
      `INSERT INTO reserva (id_soci, id_classe, data_reserva, data_classe, assistit, activa)
       VALUES (?, ?, NOW(), ?, ?, 1)`,
      [id_soci, id_classe, data_classe, assistit ? 1 : 0]
    );

    await connection.execute(
      'UPDATE classe SET places_ocupades = places_ocupades + 1 WHERE id_classe = ?',
      [id_classe]
    );

    await connection.commit();
    connection.release();

    res.status(201).json({
      ok: true,
      id_reserva: result.insertId,
      message: 'Reserva creada correctament.',
      places_lliures: Number(classe.aforament_max) - Number(classe.places_ocupades) - 1,
    });
  } catch (err) {
    await connection.rollback();
    connection.release();
    next(err);
  }
});

router.put('/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const [result] = await pool.execute(
      'UPDATE reserva SET assistit = ? WHERE id_reserva = ? AND activa = 1',
      [req.body.assistit ? 1 : 0, req.params.id]
    );

    if (result.affectedRows === 0) {
      return next({ status: 404, message: 'Reserva no trobada.' });
    }

    res.json({ ok: true, message: 'Reserva actualitzada correctament.' });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', requireAuth, async (req, res, next) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const params = isAdmin(req.user) ? [req.params.id] : [req.params.id, req.user.id];
    const ownerClause = isAdmin(req.user) ? '' : ' AND id_soci = ?';
    const [rows] = await connection.execute(
      `SELECT id_reserva, id_classe FROM reserva WHERE id_reserva = ?${ownerClause} AND activa = 1 FOR UPDATE`,
      params
    );

    if (rows.length === 0) {
      await connection.rollback();
      connection.release();
      return next({ status: 404, message: 'Reserva no trobada.' });
    }

    await connection.execute(
      'UPDATE reserva SET activa = 0, data_cancelacio = NOW() WHERE id_reserva = ?',
      [req.params.id]
    );

    await connection.execute(
      'UPDATE classe SET places_ocupades = GREATEST(places_ocupades - 1, 0) WHERE id_classe = ?',
      [rows[0].id_classe]
    );

    await connection.commit();
    connection.release();

    res.json({ ok: true, message: 'Reserva cancel.lada correctament.' });
  } catch (err) {
    await connection.rollback();
    connection.release();
    next(err);
  }
});

export default router;
