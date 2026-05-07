import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// ─────────────────────────────────────────────
// POST /api/auth/register — Registrar nou soci
// ─────────────────────────────────────────────
router.post('/register', async (req, res, next) => {
  try {
    const { nom, cognoms, email, password, data_naixement } = req.body;

    // Validació bàsica
    if (!nom || !cognoms || !email || !password || !data_naixement) {
      return next({ status: 400, message: 'Tots els camps són obligatoris: nom, cognoms, email, password, data_naixement.' });
    }
    if (password.length < 6) {
      return next({ status: 400, message: 'La contrasenya ha de tenir mínim 6 caràcters.' });
    }

    // Comprovar si l'email ja existeix
    const [existing] = await pool.query(
      'SELECT id_soci FROM soci WHERE email = ?',
      [email.trim().toLowerCase()]
    );
    if (existing.length > 0) {
      return next({ status: 409, message: 'Aquest email ja està registrat.' });
    }

    // Hash de la contrasenya
    const password_hash = await bcrypt.hash(password, 10);

    // Inserir nou soci
    const [result] = await pool.query(
      `INSERT INTO soci (nom, cognoms, email, password_hash, data_naixement, data_alta, actiu)
       VALUES (?, ?, ?, ?, ?, CURDATE(), 1)`,
      [nom.trim(), cognoms.trim(), email.trim().toLowerCase(), password_hash, data_naixement]
    );

    const id_soci = result.insertId;

    // Generar JWT
    const token = jwt.sign(
      { id: id_soci, email: email.trim().toLowerCase(), rol: 'soci' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      ok: true,
      token,
      user: { id: id_soci, nom, cognoms, email: email.trim().toLowerCase(), rol: 'soci' },
    });
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────
// POST /api/auth/login — Login soci o admin
// ─────────────────────────────────────────────
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next({ status: 400, message: 'Cal proporcionar email i contrasenya.' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Buscar primer a SOCI
    const [socis] = await pool.query(
      'SELECT id_soci AS id, nom, cognoms, email, password_hash, actiu FROM soci WHERE email = ?',
      [normalizedEmail]
    );

    if (socis.length > 0) {
      const soci = socis[0];
      if (!soci.actiu) {
        return next({ status: 403, message: 'El compte de soci està desactivat.' });
      }
      const valid = await bcrypt.compare(password, soci.password_hash);
      if (!valid) {
        return next({ status: 401, message: 'Credencials incorrectes.' });
      }
      const token = jwt.sign(
        { id: soci.id, email: soci.email, rol: 'soci' },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );
      return res.json({
        ok: true,
        token,
        user: { id: soci.id, nom: soci.nom, cognoms: soci.cognoms, email: soci.email, rol: 'soci' },
      });
    }

    // Si no és soci, buscar a ADMINISTRADOR
    const [admins] = await pool.query(
      'SELECT id_admin AS id, nom, cognoms, email, password_hash, actiu FROM administrador WHERE email = ?',
      [normalizedEmail]
    );

    if (admins.length > 0) {
      const admin = admins[0];
      if (!admin.actiu) {
        return next({ status: 403, message: 'El compte d\'administrador està desactivat.' });
      }
      const valid = await bcrypt.compare(password, admin.password_hash);
      if (!valid) {
        return next({ status: 401, message: 'Credencials incorrectes.' });
      }
      const token = jwt.sign(
        { id: admin.id, email: admin.email, rol: 'admin' },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );
      return res.json({
        ok: true,
        token,
        user: { id: admin.id, nom: admin.nom, cognoms: admin.cognoms, email: admin.email, rol: 'admin' },
      });
    }

    // No existeix cap usuari amb aquest email
    return next({ status: 401, message: 'Credencials incorrectes.' });
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────
// GET /api/auth/me — Dades de la sessió actual
// ─────────────────────────────────────────────
router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const { id, rol } = req.user;

    if (rol === 'admin') {
      const [rows] = await pool.query(
        'SELECT id_admin AS id, nom, cognoms, email, rol, data_alta FROM administrador WHERE id_admin = ?',
        [id]
      );
      if (rows.length === 0) return next({ status: 404, message: 'Usuari no trobat.' });
      return res.json({ ok: true, user: { ...rows[0], rol: 'admin' } });
    }

    const [rows] = await pool.query(
      'SELECT id_soci AS id, nom, cognoms, email, telefon, data_naixement, data_alta FROM soci WHERE id_soci = ? AND actiu = 1',
      [id]
    );
    if (rows.length === 0) return next({ status: 404, message: 'Soci no trobat.' });
    res.json({ ok: true, user: { ...rows[0], rol: 'soci' } });
  } catch (err) {
    next(err);
  }
});

export default router;
