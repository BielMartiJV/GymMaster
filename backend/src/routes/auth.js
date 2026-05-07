import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

function signToken(user) {
  return jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '7d' });
}

router.post('/register', async (req, res, next) => {
  try {
    const { nom, cognoms, email, password, telefon, data_naixement, dni } = req.body;

    if (!nom || !cognoms || !email || !password || !data_naixement) {
      return next({ status: 400, message: 'Tots els camps obligatoris han estat informats incorrectament.' });
    }

    if (password.length < 6) {
      return next({ status: 400, message: 'La contrasenya ha de tenir minim 6 caracters.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedDni = (dni || 'PENDENT').trim().toUpperCase();

    const [existingEmail] = await pool.execute('SELECT id_soci FROM soci WHERE email = ?', [normalizedEmail]);
    if (existingEmail.length > 0) {
      return next({ status: 409, message: 'Aquest email ja esta registrat.' });
    }

    if (normalizedDni && normalizedDni !== 'PENDENT') {
      const [existingDni] = await pool.execute('SELECT id_soci FROM soci WHERE dni = ?', [normalizedDni]);
      if (existingDni.length > 0) {
        return next({ status: 409, message: 'Aquest DNI ja esta registrat.' });
      }
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const [result] = await pool.execute(
      `INSERT INTO soci
       (nom, cognoms, email, password_hash, telefon, data_naixement, dni, data_alta, actiu)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), 1)`,
      [nom.trim(), cognoms.trim(), normalizedEmail, passwordHash, (telefon || '').trim(), data_naixement, normalizedDni]
    );

    const tokenPayload = {
      id: result.insertId,
      email: normalizedEmail,
      rol: 'soci',
      userType: 'soci',
      isAdmin: false,
    };

    res.status(201).json({
      ok: true,
      token: signToken(tokenPayload),
      user: {
        ...tokenPayload,
        nom: nom.trim(),
        name: nom.trim(),
        cognoms: cognoms.trim(),
        telefon: (telefon || '').trim(),
        dni: normalizedDni,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next({ status: 400, message: 'Cal proporcionar email i contrasenya.' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const [admins] = await pool.execute(
      'SELECT id_admin AS id, nom, cognoms, email, telefon, password_hash, rol, actiu FROM administrador WHERE email = ? LIMIT 1',
      [normalizedEmail]
    );

    if (admins.length > 0) {
      const admin = admins[0];
      if (!admin.actiu) {
        return next({ status: 403, message: "El compte d'administrador esta desactivat." });
      }

      const valid = await bcrypt.compare(password, admin.password_hash);
      if (valid) {
        const tokenPayload = {
          id: admin.id,
          email: admin.email,
          rol: admin.rol || 'admin',
          userType: 'admin',
          isAdmin: true,
        };

        return res.json({
          ok: true,
          token: signToken(tokenPayload),
          user: {
            ...tokenPayload,
            nom: admin.nom,
            name: admin.nom,
            cognoms: admin.cognoms,
            telefon: admin.telefon,
          },
        });
      }
    }

    const [socis] = await pool.execute(
      'SELECT id_soci AS id, nom, cognoms, email, telefon, dni, password_hash, actiu FROM soci WHERE email = ? LIMIT 1',
      [normalizedEmail]
    );

    if (socis.length === 0) {
      return next({ status: 401, message: 'Credencials incorrectes.' });
    }

    const soci = socis[0];
    if (!soci.actiu) {
      return next({ status: 403, message: 'El compte de soci esta desactivat.' });
    }

    const valid = await bcrypt.compare(password, soci.password_hash);
    if (!valid) {
      return next({ status: 401, message: 'Credencials incorrectes.' });
    }

    const tokenPayload = {
      id: soci.id,
      email: soci.email,
      rol: 'soci',
      userType: 'soci',
      isAdmin: false,
    };

    res.json({
      ok: true,
      token: signToken(tokenPayload),
      user: {
        ...tokenPayload,
        nom: soci.nom,
        name: soci.nom,
        cognoms: soci.cognoms,
        telefon: soci.telefon,
        dni: soci.dni,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const isAdmin = req.user.rol === 'admin' || req.user.userType === 'admin' || req.user.isAdmin === true;

    if (isAdmin) {
      const [rows] = await pool.execute(
        'SELECT id_admin AS id, nom, cognoms, email, telefon, rol, data_alta AS created_at, actiu FROM administrador WHERE id_admin = ?',
        [req.user.id]
      );

      if (rows.length === 0) {
        return next({ status: 404, message: 'Usuari no trobat.' });
      }

      const admin = rows[0];
      if (!admin.actiu) {
        return next({ status: 403, message: "El compte d'administrador esta desactivat." });
      }

      return res.json({
        ok: true,
        user: {
          ...admin,
          name: admin.nom,
          rol: admin.rol || 'admin',
          userType: 'admin',
          isAdmin: true,
        },
      });
    }

    const [rows] = await pool.execute(
      `SELECT id_soci AS id, nom, cognoms, email, telefon, data_naixement, dni, data_alta AS created_at
       FROM soci
       WHERE id_soci = ? AND actiu = 1`,
      [req.user.id]
    );

    if (rows.length === 0) {
      return next({ status: 404, message: 'Soci no trobat.' });
    }

    const soci = rows[0];
    res.json({
      ok: true,
      user: {
        ...soci,
        name: soci.nom,
        rol: 'soci',
        userType: 'soci',
        isAdmin: false,
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
