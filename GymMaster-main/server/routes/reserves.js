const express = require("express");
const pool = require("../db");
const { requireAuth, requireAdmin } = require("../middleware/auth");

const router = express.Router();

router.get("/", requireAuth, requireAdmin, async (req, res) => {
  try {
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

    res.json({ reserves: rows });
  } catch (error) {
    console.error("Error llistant reserves:", error);
    res.status(500).json({ error: "Error intern del servidor" });
  }
});

router.get("/me", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await pool.execute(
      `SELECT r.id_reserva, r.id_soci, r.id_classe, r.data_reserva, r.data_classe, r.assistit, r.activa,
              c.nom AS classe_nom, c.hora_inici
       FROM reserva r
       INNER JOIN classe c ON c.id_classe = r.id_classe
       WHERE r.id_soci = ? AND r.activa = 1
       ORDER BY r.data_classe DESC, c.hora_inici DESC`,
      [userId]
    );

    res.json({ ok: true, data: rows });
  } catch (error) {
    console.error("Error obtenint reserves de l'usuari:", error);
    res.status(500).json({ ok: false, error: "Error intern del servidor" });
  }
});

router.post("/", requireAuth, async (req, res) => {
  try {
    let { id_soci, id_classe, data_classe, assistit } = req.body;

    // Si no s'especifica id_soci (habitual en socis), usem el de l'usuari loguejat
    if (!id_soci) {
      id_soci = req.user.id;
    } else if (!req.user.isAdmin && id_soci !== req.user.id) {
      // Un soci no pot reservar per un altre
      return res.status(403).json({ ok: false, error: "No tens permisos per reservar per un altre soci" });
    }

    if (!id_soci || !id_classe || !data_classe) {
      return res.status(400).json({ error: "Soci, classe i data són obligatoris" });
    }

    const [[soci]] = await pool.execute(
      "SELECT id_soci FROM soci WHERE id_soci = ? AND actiu = 1",
      [id_soci]
    );

    if (!soci) {
      return res.status(400).json({ error: "El soci seleccionat no existeix o està inactiu" });
    }

    const [[classe]] = await pool.execute(
      "SELECT id_classe, aforament_max, places_ocupades, activa FROM classe WHERE id_classe = ?",
      [id_classe]
    );

    if (!classe || classe.activa !== 1) {
      return res.status(400).json({ error: "La classe seleccionada no existeix o està inactiva" });
    }

    if (Number(classe.places_ocupades) >= Number(classe.aforament_max)) {
      return res.status(409).json({ error: "No queden places disponibles per aquesta classe" });
    }

    const [existing] = await pool.execute(
      `SELECT id_reserva FROM reserva
       WHERE id_soci = ? AND id_classe = ? AND data_classe = ? AND activa = 1`,
      [id_soci, id_classe, data_classe]
    );

    if (existing.length > 0) {
      return res.status(409).json({ error: "Ja existeix una reserva activa per aquest soci i classe" });
    }

    await pool.execute(
      `INSERT INTO reserva (id_soci, id_classe, data_reserva, data_classe, assistit, activa)
       VALUES (?, ?, NOW(), ?, ?, 1)`,
      [id_soci, id_classe, data_classe, assistit ? 1 : 0]
    );

    await pool.execute(
      "UPDATE classe SET places_ocupades = places_ocupades + 1 WHERE id_classe = ?",
      [id_classe]
    );

    res.status(201).json({ ok: true, message: "Reserva creada correctament" });
  } catch (error) {
    console.error("Error creant reserva:", error);
    res.status(500).json({ ok: false, error: "Error intern del servidor" });
  }
});

router.put("/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { assistit } = req.body;

    const [result] = await pool.execute(
      "UPDATE reserva SET assistit = ? WHERE id_reserva = ? AND activa = 1",
      [assistit ? 1 : 0, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Reserva no trobada" });
    }

    res.json({ message: "Reserva actualitzada correctament" });
  } catch (error) {
    console.error("Error actualitzant reserva:", error);
    res.status(500).json({ error: "Error intern del servidor" });
  }
});

router.delete("/:id", requireAuth, requireAdmin, async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const id = Number(req.params.id);

    await connection.beginTransaction();

    const [rows] = await connection.execute(
      "SELECT id_classe FROM reserva WHERE id_reserva = ? AND activa = 1 FOR UPDATE",
      [id]
    );

    if (rows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: "Reserva no trobada" });
    }

    const classeId = rows[0].id_classe;

    await connection.execute(
      "UPDATE reserva SET activa = 0, data_cancelacio = NOW() WHERE id_reserva = ?",
      [id]
    );

    await connection.execute(
      `UPDATE classe
       SET places_ocupades = CASE
         WHEN places_ocupades > 0 THEN places_ocupades - 1
         ELSE 0
       END
       WHERE id_classe = ?`,
      [classeId]
    );

    await connection.commit();

    res.json({ message: "Reserva cancel·lada correctament" });
  } catch (error) {
    await connection.rollback();
    console.error("Error cancel·lant reserva:", error);
    res.status(500).json({ error: "Error intern del servidor" });
  } finally {
    connection.release();
  }
});

module.exports = router;
