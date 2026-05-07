const express = require("express");
const pool = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// ─────────────────────────────────────────────
// POST /api/notificacions — Enviar notificació (Admin)
// ─────────────────────────────────────────────
router.post("/", requireAuth, async (req, res) => {
  try {
    const { id_soci, titol, missatge, tipus } = req.body;
    const adminId = req.user.id;

    // Només admin pot enviar (el middleware hauria de ser requireAdmin però usem requireAuth + check manual si no tenim requireAdmin definit)
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: "Accés denegat" });
    }

    if (!id_soci || !titol || !missatge) {
      return res.status(400).json({ error: "Falten camps obligatoris" });
    }

    const [result] = await pool.execute(
      "INSERT INTO notificacio (id_soci, id_admin, titol, missatge, tipus, data_enviament, llegida) VALUES (?, ?, ?, ?, ?, NOW(), 0)",
      [id_soci, adminId, titol, missatge, tipus || "informativa"]
    );

    res.status(201).json({ ok: true, id: result.insertId });
  } catch (error) {
    console.error("Error enviant notificació:", error);
    res.status(500).json({ error: "Error intern del servidor" });
  }
});

// ─────────────────────────────────────────────
// GET /api/notificacions — Obtenir notificacions de l'usuari
// ─────────────────────────────────────────────
router.get("/", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await pool.execute(
      "SELECT * FROM notificacio WHERE id_soci = ? ORDER BY data_enviament DESC",
      [userId]
    );

    res.json({ ok: true, data: rows });
  } catch (error) {
    console.error("Error obtenint notificacions:", error);
    res.status(500).json({ error: "Error intern del servidor" });
  }
});

// ─────────────────────────────────────────────
// PATCH /api/notificacions/:id/read — Marcar com a llegida
// ─────────────────────────────────────────────
router.patch("/:id/read", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const notifId = req.params.id;

    await pool.execute(
      "UPDATE notificacio SET llegida = 1 WHERE id_notificacio = ? AND id_soci = ?",
      [notifId, userId]
    );

    res.json({ ok: true });
  } catch (error) {
    console.error("Error marcant notificació com a llegida:", error);
    res.status(500).json({ error: "Error intern del servidor" });
  }
});

// ─────────────────────────────────────────────
// PATCH /api/notificacions/read-all — Marcar totes com a llegides
// ─────────────────────────────────────────────
router.patch("/read-all", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    await pool.execute(
      "UPDATE notificacio SET llegida = 1 WHERE id_soci = ? AND llegida = 0",
      [userId]
    );

    res.json({ ok: true });
  } catch (error) {
    console.error("Error marcant totes les notificacions:", error);
    res.status(500).json({ error: "Error intern del servidor" });
  }
});

// ─────────────────────────────────────────────
// DELETE /api/notificacions/:id — Eliminar notificació
// ─────────────────────────────────────────────
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const notifId = req.params.id;

    await pool.execute(
      "DELETE FROM notificacio WHERE id_notificacio = ? AND id_soci = ?",
      [notifId, userId]
    );

    res.json({ ok: true });
  } catch (error) {
    console.error("Error eliminant notificació:", error);
    res.status(500).json({ error: "Error intern del servidor" });
  }
});

module.exports = router;
