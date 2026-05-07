import { Router } from 'express';
import bcrypt from 'bcryptjs';
import pool from '../db.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

const userSelect = `
  SELECT id_soci AS id, nom AS name, cognoms, email, telefon, data_naixement, dni, data_alta AS created_at
  FROM soci
`;

router.get('/', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const [rows] = await pool.execute(`${userSelect} WHERE actiu = 1 ORDER BY data_alta DESC`);
    res.json({ users: rows, ok: true, data: rows });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const [rows] = await pool.execute(`${userSelect} WHERE id_soci = ?`, [req.params.id]);

    if (rows.length === 0) {
      return next({ status: 404, message: 'Usuari no trobat.' });
    }

    res.json({ user: rows[0], ok: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
});

router.put('/:id', requireAuth, async (req, res, next) => {
  try {
    const isAdmin = req.user.rol === 'admin' || req.user.userType === 'admin' || req.user.isAdmin === true;
    if (isAdmin) {
      return next({ status: 403, message: "Els administradors no es gestionen des d'aquest endpoint." });
    }

    const userId = Number(req.params.id);
    if (req.user.id !== userId) {
      return next({ status: 403, message: 'No tens permis per editar aquest perfil.' });
    }

    const { nom, cognoms, email, telefon, password } = req.body;
    if (!nom || !cognoms || !email || !telefon) {
      return next({ status: 400, message: 'Tots els camps basics son obligatoris.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const [existing] = await pool.execute(
      'SELECT id_soci FROM soci WHERE email = ? AND id_soci != ?',
      [normalizedEmail, userId]
    );
    if (existing.length > 0) {
      return next({ status: 409, message: 'Aquest email ja esta en us per un altre usuari.' });
    }

    if (password) {
      if (password.length < 6) {
        return next({ status: 400, message: 'La contrasenya nova ha de tenir almenys 6 caracters.' });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      await pool.execute(
        'UPDATE soci SET nom = ?, cognoms = ?, email = ?, telefon = ?, password_hash = ? WHERE id_soci = ?',
        [nom.trim(), cognoms.trim(), normalizedEmail, telefon.trim(), passwordHash, userId]
      );
    } else {
      await pool.execute(
        'UPDATE soci SET nom = ?, cognoms = ?, email = ?, telefon = ? WHERE id_soci = ?',
        [nom.trim(), cognoms.trim(), normalizedEmail, telefon.trim(), userId]
      );
    }

    const [rows] = await pool.execute(`${userSelect} WHERE id_soci = ?`, [userId]);
    const user = rows[0];

    res.json({
      user: {
        ...user,
        isAdmin: false,
        userType: 'soci',
        rol: 'soci',
      },
      ok: true,
      message: 'Perfil actualitzat correctament.',
    });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const isAdmin = req.user.rol === 'admin' || req.user.userType === 'admin' || req.user.isAdmin === true;
    if (isAdmin) {
      return next({ status: 403, message: "Els administradors no es gestionen des d'aquest endpoint." });
    }

    const userId = Number(req.params.id);
    if (req.user.id !== userId) {
      return next({ status: 403, message: 'No tens permis per eliminar aquest compte.' });
    }

    const [result] = await pool.execute(
      'UPDATE soci SET actiu = 0, data_baixa = NOW() WHERE id_soci = ?',
      [userId]
    );

    if (result.affectedRows === 0) {
      return next({ status: 404, message: 'Usuari no trobat.' });
    }

    res.json({ ok: true, message: 'Compte donat de baixa correctament.' });
  } catch (err) {
    next(err);
  }
});

export default router;
