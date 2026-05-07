const express = require("express");
const bcrypt = require("bcryptjs");
const pool = require("../db");
const { requireAuth, requireAdmin } = require("../middleware/auth");

const router = express.Router();

/**
 * GET /api/socis
 * Llista tots els socis actius
 */
router.get("/", requireAuth, requireAdmin, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT
        id_soci,
        nom,
        cognoms,
        email,
        telefon,
        data_naixement,
        dni,
        data_alta,
        actiu
      FROM soci
      WHERE actiu = 1
      ORDER BY data_alta DESC`
    );

    res.json({ socis: rows });
  } catch (error) {
    console.error("Error llistant socis:", error);
    res.status(500).json({ error: "Error intern del servidor" });
  }
});

/**
 * GET /api/socis/:id
 * Detall d'un soci
 */
router.get("/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const [rows] = await pool.execute(
      `SELECT
        id_soci,
        nom,
        cognoms,
        email,
        telefon,
        data_naixement,
        dni,
        data_alta,
        actiu
      FROM soci
      WHERE id_soci = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Soci no trobat" });
    }

    res.json({ soci: rows[0] });
  } catch (error) {
    console.error("Error obtenint soci:", error);
    res.status(500).json({ error: "Error intern del servidor" });
  }
});

/**
 * POST /api/socis
 * Crea un nou soci
 */
router.post("/", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { nom, cognoms, email, telefon, data_naixement, dni, password } = req.body;

    if (!nom || !cognoms || !email || !telefon || !data_naixement || !dni || !password) {
      return res.status(400).json({ error: "Tots els camps són obligatoris" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "La contrasenya ha de tenir almenys 6 caràcters" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedDni = dni.trim().toUpperCase();

    const [existingEmail] = await pool.execute(
      "SELECT id_soci FROM soci WHERE email = ?",
      [normalizedEmail]
    );
    if (existingEmail.length > 0) {
      return res.status(409).json({ error: "Aquest email ja està registrat" });
    }

    const [existingDni] = await pool.execute(
      "SELECT id_soci FROM soci WHERE dni = ?",
      [normalizedDni]
    );
    if (existingDni.length > 0) {
      return res.status(409).json({ error: "Aquest DNI ja està registrat" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const dataAlta = new Date().toISOString().slice(0, 19).replace("T", " ");

    const [result] = await pool.execute(
      `INSERT INTO soci
       (nom, cognoms, email, password_hash, telefon, data_naixement, dni, data_alta, actiu)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [
        nom.trim(),
        cognoms.trim(),
        normalizedEmail,
        passwordHash,
        telefon.trim(),
        data_naixement,
        normalizedDni,
        dataAlta,
      ]
    );

    const [rows] = await pool.execute(
      `SELECT
        id_soci,
        nom,
        cognoms,
        email,
        telefon,
        data_naixement,
        dni,
        data_alta,
        actiu
      FROM soci
      WHERE id_soci = ?`,
      [result.insertId]
    );

    res.status(201).json({ soci: rows[0] });
  } catch (error) {
    console.error("Error creant soci:", error);
    res.status(500).json({ error: "Error intern del servidor" });
  }
});

/**
 * PUT /api/socis/:id
 * Actualitza un soci
 */
router.put("/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { nom, cognoms, email, telefon, data_naixement, dni, password } = req.body;

    if (!nom || !cognoms || !email || !telefon || !data_naixement || !dni) {
      return res.status(400).json({ error: "Nom, cognoms, email, telèfon, data de naixement i DNI són obligatoris" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedDni = dni.trim().toUpperCase();

    const [existingEmail] = await pool.execute(
      "SELECT id_soci FROM soci WHERE email = ? AND id_soci != ?",
      [normalizedEmail, id]
    );
    if (existingEmail.length > 0) {
      return res.status(409).json({ error: "Aquest email ja està registrat" });
    }

    const [existingDni] = await pool.execute(
      "SELECT id_soci FROM soci WHERE dni = ? AND id_soci != ?",
      [normalizedDni, id]
    );
    if (existingDni.length > 0) {
      return res.status(409).json({ error: "Aquest DNI ja està registrat" });
    }

    if (password && password.length > 0) {
      if (password.length < 6) {
        return res.status(400).json({ error: "La contrasenya ha de tenir almenys 6 caràcters" });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const [result] = await pool.execute(
        `UPDATE soci
         SET nom = ?, cognoms = ?, email = ?, telefon = ?, data_naixement = ?, dni = ?, password_hash = ?
         WHERE id_soci = ?`,
        [
          nom.trim(),
          cognoms.trim(),
          normalizedEmail,
          telefon.trim(),
          data_naixement,
          normalizedDni,
          passwordHash,
          id,
        ]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Soci no trobat" });
      }
    } else {
      const [result] = await pool.execute(
        `UPDATE soci
         SET nom = ?, cognoms = ?, email = ?, telefon = ?, data_naixement = ?, dni = ?
         WHERE id_soci = ?`,
        [
          nom.trim(),
          cognoms.trim(),
          normalizedEmail,
          telefon.trim(),
          data_naixement,
          normalizedDni,
          id,
        ]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Soci no trobat" });
      }
    }

    const [rows] = await pool.execute(
      `SELECT
        id_soci,
        nom,
        cognoms,
        email,
        telefon,
        data_naixement,
        dni,
        data_alta,
        actiu
      FROM soci
      WHERE id_soci = ?`,
      [id]
    );

    res.json({ soci: rows[0] });
  } catch (error) {
    console.error("Error actualitzant soci:", error);
    res.status(500).json({ error: "Error intern del servidor" });
  }
});

/**
 * DELETE /api/socis/:id
 * Dona de baixa un soci (soft delete)
 */
router.delete("/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const dataBaixa = new Date().toISOString().slice(0, 19).replace("T", " ");

    const [result] = await pool.execute(
      "UPDATE soci SET actiu = 0, data_baixa = ? WHERE id_soci = ?",
      [dataBaixa, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Soci no trobat" });
    }

    res.json({ message: "Soci donat de baixa correctament" });
  } catch (error) {
    console.error("Error donant de baixa soci:", error);
    res.status(500).json({ error: "Error intern del servidor" });
  }
});

module.exports = router;
