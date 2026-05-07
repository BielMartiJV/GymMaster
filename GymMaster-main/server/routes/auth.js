const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../db");
const { requireAuth, JWT_SECRET } = require("../middleware/auth");

const router = express.Router();

/**
 * POST /api/auth/register
 * Registre d'un nou usuari a la taula `soci`
 */
router.post("/register", async (req, res) => {
  try {
    const { nom, cognoms, email, password, telefon, data_naixement, dni } = req.body;

    // Validacions
    const missing = [];
    if (!nom) missing.push('nom');
    if (!cognoms) missing.push('cognoms');
    if (!email) missing.push('email');
    if (!password) missing.push('password');
    if (!data_naixement) missing.push('data_naixement');

    if (missing.length > 0) {
      return res.status(400).json({ error: `Tots els camps són obligatoris. Falta: ${missing.join(', ')} [DEBUG-V2]` });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "La contrasenya ha de tenir almenys 6 caràcters" });
    }

    // Comprovar si l'email ja existeix
    const [existing] = await pool.execute(
      "SELECT id_soci FROM soci WHERE email = ?",
      [(email || "").trim().toLowerCase()]
    );

    if (existing.length > 0) {
      return res.status(409).json({ error: "Aquest email ja està registrat" });
    }

    // Comprovar si el DNI ja existeix (si se n'ha proporcionat un)
    const normalizedDni = (dni || "").trim().toUpperCase();
    if (normalizedDni && normalizedDni !== "PENDENT") {
      const [existingDni] = await pool.execute(
        "SELECT id_soci FROM soci WHERE dni = ?",
        [normalizedDni]
      );

      if (existingDni.length > 0) {
        return res.status(409).json({ error: "Aquest DNI ja està registrat" });
      }
    }

    // Hash de la contrasenya
    const hashedPassword = await bcrypt.hash(password, 10);
    const dataAlta = new Date().toISOString().slice(0, 19).replace('T', ' ');

    // Inserir l'usuari
    const [result] = await pool.execute(
      "INSERT INTO soci (nom, cognoms, email, password_hash, telefon, data_naixement, dni, data_alta, actiu) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)",
      [
        nom.trim(), 
        cognoms.trim(), 
        email.trim().toLowerCase(), 
        hashedPassword, 
        (telefon || "").trim(), 
        data_naixement, 
        (dni || "PENDENT").trim().toUpperCase(), 
        dataAlta
      ]
    );

    const userId = result.insertId;

    // Generar JWT
    const token = jwt.sign(
      {
        id: userId,
        email: (email || "").trim().toLowerCase(),
        name: (nom || "").trim(),
        cognoms: (cognoms || "").trim(),
        isAdmin: false,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    console.log('DEBUG VALUES before response:', { nom, cognoms, email, telefon, dni, data_naixement });
    res.status(201).json({
      token,
      user: {
        id: userId,
        name: (nom || "").trim(),
        cognoms: (cognoms || "").trim(),
        email: (email || "").trim().toLowerCase(),
        telefon: (telefon || "").trim(),
        dni: (dni || "PENDENT").trim().toUpperCase(),
        isAdmin: false,
      },
    });
  } catch (error) {
    console.error("Error al registre [V3]:", error);
    res.status(500).json({ error: "Error intern del servidor [VERSION-V3]: " + error.message });
  }
});

/**
 * POST /api/auth/login
 * Login d'un usuari existent
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email i contrasenya són obligatoris" });
    }

    // 1) Intent de login com administrador
    const [adminRows] = await pool.execute(
      "SELECT * FROM administrador WHERE email = ? LIMIT 1",
      [email.trim().toLowerCase()]
    );

    if (adminRows.length > 0) {
      const admin = adminRows[0];

      if (admin.actiu === 0) {
        return res.status(403).json({ error: "Compte d'administrador desactivat" });
      }

      const adminValid = await bcrypt.compare(password, admin.password_hash);
      if (adminValid) {
        const token = jwt.sign(
          {
            id: admin.id_admin,
            email: admin.email,
            name: admin.nom,
            cognoms: admin.cognoms,
            isAdmin: true,
            userType: "admin",
            rol: admin.rol || "admin",
          },
          JWT_SECRET,
          { expiresIn: "7d" }
        );

        return res.json({
          token,
          user: {
            id: admin.id_admin,
            name: admin.nom,
            cognoms: admin.cognoms,
            email: admin.email,
            telefon: admin.telefon,
            isAdmin: true,
            userType: "admin",
            rol: admin.rol || "admin",
          },
        });
      }
    }

    // 2) Login com soci
    const [rows] = await pool.execute(
      "SELECT * FROM soci WHERE email = ?",
      [email.trim().toLowerCase()]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: "Credencials incorrectes" });
    }

    const user = rows[0];

    // Verificar si està actiu (opcional, segons si fan soft delete o no)
    if (user.actiu === 0) {
      return res.status(403).json({ error: "Compte desactivat" });
    }

    // Verificar contrasenya
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: "Credencials incorrectes" });
    }

    // Generar JWT
    const token = jwt.sign(
      {
        id: user.id_soci,
        email: user.email,
        name: user.nom,
        cognoms: user.cognoms,
        isAdmin: false,
        userType: "soci",
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: { 
        id: user.id_soci, 
        name: user.nom, 
        cognoms: user.cognoms, 
        email: user.email,
        telefon: user.telefon,
        dni: user.dni,
        isAdmin: false,
        userType: "soci",
      },
    });
  } catch (error) {
    console.error("Error al login:", error);
    res.status(500).json({ error: "Error intern del servidor" });
  }
});

/**
 * GET /api/auth/me
 * Retorna el perfil de l'usuari autenticat
 */
router.get("/me", requireAuth, async (req, res) => {
  try {
    if (req.user.userType === "admin") {
      const [adminRows] = await pool.execute(
        "SELECT id_admin, nom, cognoms, email, telefon, rol, data_alta, actiu FROM administrador WHERE id_admin = ?",
        [req.user.id]
      );

      if (adminRows.length === 0) {
        return res.status(404).json({ error: "Administrador no trobat" });
      }

      const admin = adminRows[0];
      if (admin.actiu === 0) {
        return res.status(403).json({ error: "Compte d'administrador desactivat" });
      }

      return res.json({
        user: {
          id: admin.id_admin,
          name: admin.nom,
          cognoms: admin.cognoms,
          email: admin.email,
          telefon: admin.telefon,
          rol: admin.rol || "admin",
          created_at: admin.data_alta,
          isAdmin: true,
          userType: "admin",
        },
      });
    }

    const [rows] = await pool.execute(
      "SELECT id_soci as id, nom as name, cognoms, email, telefon, data_naixement, dni, data_alta as created_at FROM soci WHERE id_soci = ?",
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Usuari no trobat" });
    }

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
    });
  } catch (error) {
    console.error("Error obtenint perfil:", error);
    res.status(500).json({ error: "Error intern del servidor" });
  }
});

module.exports = router;
