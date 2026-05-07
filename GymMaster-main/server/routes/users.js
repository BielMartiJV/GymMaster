const express = require("express");
const bcrypt = require("bcryptjs");
const pool = require("../db");
const { requireAuth, requireAdmin } = require("../middleware/auth");

const router = express.Router();

/**
 * GET /api/users
 * Llista tots els usuaris
 */
router.get("/", requireAuth, requireAdmin, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT id_soci as id, nom as name, cognoms, email, telefon, data_naixement, dni, data_alta as created_at FROM soci WHERE actiu = 1 ORDER BY data_alta DESC"
    );
    res.json({ users: rows });
  } catch (error) {
    console.error("Error llistant usuaris:", error);
    res.status(500).json({ error: "Error intern del servidor" });
  }
});

/**
 * GET /api/users/:id
 * Detall d'un usuari
 */
router.get("/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT id_soci as id, nom as name, cognoms, email, telefon, data_naixement, dni, data_alta as created_at FROM soci WHERE id_soci = ?",
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Usuari no trobat" });
    }

    res.json({ user: rows[0] });
  } catch (error) {
    console.error("Error obtenint usuari:", error);
    res.status(500).json({ error: "Error intern del servidor" });
  }
});

/**
 * PUT /api/users/:id
 * Actualitzar perfil 
 * Només el propi usuari pot editar el seu perfil
 */
router.put("/:id", requireAuth, async (req, res) => {
  try {
    if (req.user.userType === "admin") {
      return res.status(403).json({ error: "Els administradors no es gestionen des d'aquest endpoint" });
    }

    const userId = parseInt(req.params.id, 10);

    // Comprovar que l'usuari edita el seu propi perfil
    if (req.user.id !== userId) {
      return res.status(403).json({ error: "No tens permís per editar aquest perfil" });
    }

    const { nom, cognoms, email, telefon, password } = req.body;

    if (!nom || !cognoms || !email || !telefon) {
      return res.status(400).json({ error: "Tots els camps bàsics són obligatoris" });
    }

    // Comprovar si el nou email ja existeix (d'un altre usuari)
    const [existing] = await pool.execute(
      "SELECT id_soci FROM soci WHERE email = ? AND id_soci != ?",
      [email.trim().toLowerCase(), userId]
    );

    if (existing.length > 0) {
      return res.status(409).json({ error: "Aquest email ja està en ús per un altre usuari" });
    }

    // Actualitzar amb o sense nova contrasenya
    if (password && password.length >= 6) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await pool.execute(
        "UPDATE soci SET nom = ?, cognoms = ?, email = ?, telefon = ?, password_hash = ? WHERE id_soci = ?",
        [nom.trim(), cognoms.trim(), email.trim().toLowerCase(), telefon.trim(), hashedPassword, userId]
      );
    } else {
      await pool.execute(
        "UPDATE soci SET nom = ?, cognoms = ?, email = ?, telefon = ? WHERE id_soci = ?",
        [nom.trim(), cognoms.trim(), email.trim().toLowerCase(), telefon.trim(), userId]
      );
    }

    // Retornar l'usuari actualitzat
    const [rows] = await pool.execute(
      "SELECT id_soci as id, nom as name, cognoms, email, telefon, data_naixement, dni, data_alta as created_at FROM soci WHERE id_soci = ?",
      [userId]
    );

    const user = rows[0];
    res.json({
      user: {
        id: user.id,
        name: user.name,
        cognoms: user.cognoms,
        email: user.email,
        telefon: user.telefon,
        data_naixement: user.data_naixement,
        dni: user.dni,
        created_at: user.created_at,
        isAdmin: false,
        userType: "soci",
      },
      message: "Perfil actualitzat correctament",
    });
  } catch (error) {
    console.error("Error actualitzant usuari:", error);
    res.status(500).json({ error: "Error intern del servidor" });
  }
});

/**
 * DELETE /api/users/:id
 * Eliminar compte. Fem Soft Delete (actiu = 0, data_baixa = NOW)
 */
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    if (req.user.userType === "admin") {
      return res.status(403).json({ error: "Els administradors no es gestionen des d'aquest endpoint" });
    }

    const userId = parseInt(req.params.id, 10);

    // Comprovar que l'usuari elimina el seu propi compte
    if (req.user.id !== userId) {
      return res.status(403).json({ error: "No tens permís per eliminar aquest compte" });
    }

    const dataBaixa = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const [result] = await pool.execute(
      "UPDATE soci SET actiu = 0, data_baixa = ? WHERE id_soci = ?", 
      [dataBaixa, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Usuari no trobat" });
    }

    res.json({ message: "Compte donat de baixa correctament" });
  } catch (error) {
    console.error("Error eliminant usuari:", error);
    res.status(500).json({ error: "Error intern del servidor" });
  }
});

module.exports = router;
