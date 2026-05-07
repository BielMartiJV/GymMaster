import { Router } from 'express';
import nodemailer from 'nodemailer';
import pool from '../db.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

async function sendTrainerContactEmail({
  to,
  trainerName,
  clientName,
  clientEmail,
  clientPhone,
  message,
}) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !SMTP_FROM) {
    return { ok: false, code: 'SMTP_NOT_CONFIGURED' };
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  const subject = `Nova sol.licitud de servei - ${clientName}`;
  const text = [
    `Entrenador: ${trainerName}`,
    `Nom client: ${clientName}`,
    `Email client: ${clientEmail}`,
    `Telefon client: ${clientPhone || 'No informat'}`,
    '',
    'Missatge:',
    message,
  ].join('\n');

  await transporter.sendMail({
    from: SMTP_FROM,
    to,
    subject,
    text,
  });

  return { ok: true };
}

router.get('/', async (req, res, next) => {
  try {
    const [rows] = await pool.execute(
      `SELECT id_entrenador, nom, cognoms, CONCAT(nom, ' ', cognoms) AS nom_complet,
              email, telefon, especialitats, biografia, foto, data_alta, actiu
       FROM entrenador
       WHERE actiu = 1
       ORDER BY nom`
    );

    res.json({ ok: true, data: rows, entrenadors: rows });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const [entrenadors] = await pool.execute(
      `SELECT id_entrenador, nom, cognoms, CONCAT(nom, ' ', cognoms) AS nom_complet,
              email, telefon, especialitats, biografia, foto, data_alta
       FROM entrenador
       WHERE id_entrenador = ? AND actiu = 1`,
      [req.params.id]
    );

    if (entrenadors.length === 0) {
      return next({ status: 404, message: 'Entrenador no trobat.' });
    }

    const [classes] = await pool.execute(
      `SELECT id_classe, nom, dia_setmana, hora_inici, data_classe, durada, aforament_max,
              (aforament_max - places_ocupades) AS places_lliures, sala
       FROM classe
       WHERE id_entrenador = ? AND activa = 1
       ORDER BY data_classe ASC, dia_setmana ASC, hora_inici ASC`,
      [req.params.id]
    );

    const data = { ...entrenadors[0], classes };
    res.json({ ok: true, data, entrenador: data });
  } catch (err) {
    next(err);
  }
});

router.post('/', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { nom, cognoms, email, telefon, especialitats, biografia, foto } = req.body;

    if (!nom || !cognoms) {
      return next({ status: 400, message: 'Nom i cognoms son obligatoris.' });
    }

    const [result] = await pool.execute(
      `INSERT INTO entrenador (nom, cognoms, email, telefon, especialitats, biografia, foto, data_alta, actiu)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), 1)`,
      [
        nom.trim(),
        cognoms.trim(),
        email || null,
        telefon || null,
        especialitats || null,
        biografia || null,
        foto || null,
      ]
    );

    const [rows] = await pool.execute('SELECT * FROM entrenador WHERE id_entrenador = ?', [result.insertId]);
    res.status(201).json({ ok: true, id_entrenador: result.insertId, entrenador: rows[0], data: rows[0] });
  } catch (err) {
    next(err);
  }
});

router.put('/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { nom, cognoms, email, telefon, especialitats, biografia, foto } = req.body;

    if (!nom || !cognoms) {
      return next({ status: 400, message: 'Nom i cognoms son obligatoris.' });
    }

    const [result] = await pool.execute(
      `UPDATE entrenador
       SET nom = ?, cognoms = ?, email = ?, telefon = ?, especialitats = ?, biografia = ?, foto = ?
       WHERE id_entrenador = ?`,
      [nom.trim(), cognoms.trim(), email || null, telefon || null, especialitats || null, biografia || null, foto || null, req.params.id]
    );

    if (result.affectedRows === 0) {
      return next({ status: 404, message: 'Entrenador no trobat.' });
    }

    const [rows] = await pool.execute('SELECT * FROM entrenador WHERE id_entrenador = ?', [req.params.id]);
    res.json({ ok: true, message: "Dades de l'entrenador actualitzades.", entrenador: rows[0], data: rows[0] });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const [result] = await pool.execute(
      'UPDATE entrenador SET actiu = 0, data_baixa = NOW() WHERE id_entrenador = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return next({ status: 404, message: 'Entrenador no trobat.' });
    }

    res.json({ ok: true, message: 'Entrenador eliminat correctament.' });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/contacte', async (req, res, next) => {
  try {
    const { nom, email, telefon, missatge } = req.body;

    if (!nom || !email || !missatge) {
      return next({ status: 400, message: 'Nom, email i missatge son obligatoris.' });
    }

    const [rows] = await pool.execute(
      'SELECT id_entrenador, nom, cognoms, email, actiu FROM entrenador WHERE id_entrenador = ?',
      [req.params.id]
    );

    if (rows.length === 0 || rows[0].actiu !== 1) {
      return next({ status: 404, message: 'Entrenador no trobat.' });
    }

    const trainer = rows[0];
    if (!trainer.email) {
      return next({ status: 400, message: 'Aquest entrenador no te email de contacte.' });
    }

    const sendResult = await sendTrainerContactEmail({
      to: trainer.email,
      trainerName: `${trainer.nom} ${trainer.cognoms}`,
      clientName: nom.trim(),
      clientEmail: email.trim().toLowerCase(),
      clientPhone: telefon ? telefon.trim() : '',
      message: missatge.trim(),
    });

    if (!sendResult.ok && sendResult.code === 'SMTP_NOT_CONFIGURED') {
      return res.json({
        ok: true,
        message: "Missatge enviat correctament. L'entrenador rebra la teva sol.licitud.",
        simulated: true,
      });
    }

    res.json({ ok: true, message: "Missatge enviat correctament. L'entrenador rebra la teva sol.licitud." });
  } catch (err) {
    next(err);
  }
});

export default router;
