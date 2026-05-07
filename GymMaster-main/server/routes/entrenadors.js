const express = require("express");
const pool = require("../db");
const { requireAuth, requireAdmin } = require("../middleware/auth");

const router = express.Router();

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
    return {
      ok: false,
      code: "SMTP_NOT_CONFIGURED",
    };
  }

  let nodemailer;
  try {
    nodemailer = require("nodemailer");
  } catch (error) {
    return {
      ok: false,
      code: "NODEMAILER_MISSING",
    };
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
    `Telefon client: ${clientPhone || "No informat"}`,
    "",
    "Missatge:",
    message,
  ].join("\n");

  await transporter.sendMail({
    from: SMTP_FROM,
    to,
    subject,
    text,
  });

  return { ok: true };
}

/**
 * GET /api/entrenadors
 * Llista tots els entrenadors
 */
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT * FROM entrenador WHERE actiu = 1"
    );
    res.json({ entrenadors: rows });
  } catch (error) {
    console.error("Error llistant entrenadors:", error);
    res.status(500).json({ error: "Error intern del servidor" });
  }
});

/**
 * POST /api/entrenadors
 * Crea un nou entrenador
 */
router.post("/", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { nom, cognoms, email, telefon, especialitats, biografia, foto } = req.body;

    if (!nom || !cognoms) {
      return res.status(400).json({ error: "Nom i cognoms obligatoris" });
    }

    const dataAlta = new Date().toISOString().slice(0, 19).replace('T', ' ');

    const [result] = await pool.execute(
      "INSERT INTO entrenador (nom, cognoms, email, telefon, especialitats, biografia, foto, data_alta, actiu) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)",
      [
        nom.trim(), 
        cognoms.trim(),
        email || null,
        telefon || null,
        especialitats || null, 
        biografia || null,
        foto || null,
        dataAlta
      ]
    );

    const [rows] = await pool.execute("SELECT * FROM entrenador WHERE id_entrenador = ?", [result.insertId]);

    res.status(201).json({ entrenador: rows[0] });
  } catch (error) {
    console.error("Error creant entrenador:", error);
    res.status(500).json({ error: "Error intern del servidor" });
  }
});

/**
 * PUT /api/entrenadors/:id
 * Actualitza un entrenador
 */
router.put("/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { nom, cognoms, email, telefon, especialitats, biografia, foto } = req.body;

    if (!nom || !cognoms) {
      return res.status(400).json({ error: "Nom i cognoms obligatoris" });
    }

    const [result] = await pool.execute(
      `UPDATE entrenador 
       SET nom = ?, cognoms = ?, email = ?, telefon = ?, especialitats = ?, biografia = ?, foto = ? 
       WHERE id_entrenador = ?`,
      [nom.trim(), cognoms.trim(), email || null, telefon || null, especialitats || null, biografia || null, foto || null, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Entrenador no trobat" });
    }

    const [rows] = await pool.execute("SELECT * FROM entrenador WHERE id_entrenador = ?", [id]);
    res.json({ entrenador: rows[0] });
  } catch (error) {
    console.error("Error actualitzant entrenador:", error);
    res.status(500).json({ error: "Error intern del servidor" });
  }
});

/**
 * DELETE /api/entrenadors/:id
 * Elimina un entrenador (Soft delete)
 */
router.delete("/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const dataBaixa = new Date().toISOString().slice(0, 19).replace("T", " ");

    const [result] = await pool.execute(
      "UPDATE entrenador SET actiu = 0, data_baixa = ? WHERE id_entrenador = ?",
      [dataBaixa, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Entrenador no trobat" });
    }

    res.json({ message: "Entrenador eliminat correctament" });
  } catch (error) {
    console.error("Error eliminant entrenador:", error);
    res.status(500).json({ error: "Error intern del servidor" });
  }
});

/**
 * POST /api/entrenadors/:id/contacte
 * Formulari web per contactar amb un entrenador
 */
router.post("/:id/contacte", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { nom, email, telefon, missatge } = req.body;

    if (!nom || !email || !missatge) {
      return res.status(400).json({ error: "Nom, email i missatge son obligatoris" });
    }

    const [rows] = await pool.execute(
      "SELECT id_entrenador, nom, cognoms, email, actiu FROM entrenador WHERE id_entrenador = ?",
      [id]
    );

    if (rows.length === 0 || rows[0].actiu !== 1) {
      return res.status(404).json({ error: "Entrenador no trobat" });
    }

    const trainer = rows[0];

    if (!trainer.email) {
      return res.status(400).json({ error: "Aquest entrenador no te email de contacte" });
    }

    const sendResult = await sendTrainerContactEmail({
      to: trainer.email,
      trainerName: `${trainer.nom} ${trainer.cognoms}`,
      clientName: nom.trim(),
      clientEmail: email.trim().toLowerCase(),
      clientPhone: telefon ? telefon.trim() : "",
      message: missatge.trim(),
    });

    if (!sendResult.ok) {
      if (sendResult.code === "SMTP_NOT_CONFIGURED" || sendResult.code === "NODEMAILER_MISSING") {
        return res.json({
          message: "Missatge enviat correctament. L'entrenador rebra la teva sol·licitud.",
          simulated: true,
        });
      }

      return res.status(500).json({ error: "No s'ha pogut enviar la sol·licitud" });
    }

    return res.json({ message: "Missatge enviat correctament. L'entrenador rebra la teva sol·licitud." });
  } catch (error) {
    console.error("Error enviant contacte a entrenador:", error);
    return res.status(500).json({ error: "Error intern del servidor" });
  }
});

module.exports = router;
