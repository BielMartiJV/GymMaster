import { Router } from 'express';
import bcrypt from 'bcryptjs';
import pool from '../db.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

const sociFields = `
  id_soci,
  nom,
  cognoms,
  email,
  telefon,
  data_naixement,
  dni,
  data_alta,
  actiu
`;

router.get('/', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const [rows] = await pool.execute(
      `SELECT ${sociFields}
       FROM soci
       WHERE actiu = 1
       ORDER BY data_alta DESC`
    );

    res.json({ socis: rows, ok: true, data: rows });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const [rows] = await pool.execute(
      `SELECT ${sociFields} FROM soci WHERE id_soci = ?`,
      [req.params.id]
    );

    if (rows.length === 0) {
      return next({ status: 404, message: 'Soci no trobat.' });
    }

    res.json({ soci: rows[0], ok: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
});

router.post('/', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { nom, cognoms, email, telefon, data_naixement, dni, password } = req.body;

    if (!nom || !cognoms || !email || !telefon || !data_naixement || !dni || !password) {
      return next({ status: 400, message: 'Tots els camps son obligatoris.' });
    }

    if (password.length < 6) {
      return next({ status: 400, message: 'La contrasenya ha de tenir almenys 6 caracters.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedDni = dni.trim().toUpperCase();

    const [existingEmail] = await pool.execute('SELECT id_soci FROM soci WHERE email = ?', [normalizedEmail]);
    if (existingEmail.length > 0) {
      return next({ status: 409, message: 'Aquest email ja esta registrat.' });
    }

    const [existingDni] = await pool.execute('SELECT id_soci FROM soci WHERE dni = ?', [normalizedDni]);
    if (existingDni.length > 0) {
      return next({ status: 409, message: 'Aquest DNI ja esta registrat.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const [result] = await pool.execute(
      `INSERT INTO soci
       (nom, cognoms, email, password_hash, telefon, data_naixement, dni, data_alta, actiu)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), 1)`,
      [nom.trim(), cognoms.trim(), normalizedEmail, passwordHash, telefon.trim(), data_naixement, normalizedDni]
    );

    const [rows] = await pool.execute(`SELECT ${sociFields} FROM soci WHERE id_soci = ?`, [result.insertId]);

    res.status(201).json({ soci: rows[0], ok: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
});

router.put('/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { nom, cognoms, email, telefon, data_naixement, dni, password } = req.body;

    if (!nom || !cognoms || !email || !telefon || !data_naixement || !dni) {
      return next({ status: 400, message: 'Nom, cognoms, email, telefon, data de naixement i DNI son obligatoris.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedDni = dni.trim().toUpperCase();

    const [existingEmail] = await pool.execute(
      'SELECT id_soci FROM soci WHERE email = ? AND id_soci != ?',
      [normalizedEmail, req.params.id]
    );
    if (existingEmail.length > 0) {
      return next({ status: 409, message: 'Aquest email ja esta registrat.' });
    }

    const [existingDni] = await pool.execute(
      'SELECT id_soci FROM soci WHERE dni = ? AND id_soci != ?',
      [normalizedDni, req.params.id]
    );
    if (existingDni.length > 0) {
      return next({ status: 409, message: 'Aquest DNI ja esta registrat.' });
    }

    let result;
    if (password) {
      if (password.length < 6) {
        return next({ status: 400, message: 'La contrasenya ha de tenir almenys 6 caracters.' });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      [result] = await pool.execute(
        `UPDATE soci
         SET nom = ?, cognoms = ?, email = ?, telefon = ?, data_naixement = ?, dni = ?, password_hash = ?
         WHERE id_soci = ?`,
        [nom.trim(), cognoms.trim(), normalizedEmail, telefon.trim(), data_naixement, normalizedDni, passwordHash, req.params.id]
      );
    } else {
      [result] = await pool.execute(
        `UPDATE soci
         SET nom = ?, cognoms = ?, email = ?, telefon = ?, data_naixement = ?, dni = ?
         WHERE id_soci = ?`,
        [nom.trim(), cognoms.trim(), normalizedEmail, telefon.trim(), data_naixement, normalizedDni, req.params.id]
      );
    }

    if (result.affectedRows === 0) {
      return next({ status: 404, message: 'Soci no trobat.' });
    }

    const [rows] = await pool.execute(`SELECT ${sociFields} FROM soci WHERE id_soci = ?`, [req.params.id]);

    res.json({ soci: rows[0], ok: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const [result] = await pool.execute(
      'UPDATE soci SET actiu = 0, data_baixa = NOW() WHERE id_soci = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return next({ status: 404, message: 'Soci no trobat.' });
    }

    res.json({ message: 'Soci donat de baixa correctament.', ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
