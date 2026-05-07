const express = require("express");
const pool = require("../db");
const { requireAuth, requireAdmin } = require("../middleware/auth");

const router = express.Router();

router.get("/dashboard", requireAuth, requireAdmin, async (req, res) => {
  try {
    const [[socisRow]] = await pool.execute(
      "SELECT COUNT(*) AS total FROM soci WHERE actiu = 1"
    );
    const [[entrenadorsRow]] = await pool.execute(
      "SELECT COUNT(*) AS total FROM entrenador WHERE actiu = 1"
    );
    const [[classesRow]] = await pool.execute(
      "SELECT COUNT(*) AS total FROM classe WHERE activa = 1"
    );
    const [[reservesRow]] = await pool.execute(
      "SELECT COUNT(*) AS total FROM reserva WHERE activa = 1"
    );

    const [upcomingClasses] = await pool.execute(
      `SELECT c.id_classe, c.nom, c.data_classe, c.hora_inici, c.places_ocupades, c.aforament_max,
              e.nom AS entrenador_nom, e.cognoms AS entrenador_cognoms
       FROM classe c
       LEFT JOIN entrenador e ON e.id_entrenador = c.id_entrenador
       WHERE c.activa = 1 AND c.data_classe IS NOT NULL AND c.data_classe >= CURDATE()
       ORDER BY c.data_classe ASC, c.hora_inici ASC
       LIMIT 5`
    );

    const [recentSocis] = await pool.execute(
      `SELECT id_soci, nom, cognoms, email, data_alta
       FROM soci
       WHERE actiu = 1
       ORDER BY data_alta DESC
       LIMIT 5`
    );

    res.json({
      metrics: {
        socisActius: socisRow.total,
        entrenadorsActius: entrenadorsRow.total,
        classesActives: classesRow.total,
        reservesActives: reservesRow.total,
      },
      upcomingClasses,
      recentSocis,
    });
  } catch (error) {
    console.error("Error carregant dashboard admin:", error);
    res.status(500).json({ error: "Error intern del servidor" });
  }
});

module.exports = router;
