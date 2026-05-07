const express = require("express");
const pool = require("../db");
const { requireAuth, requireAdmin } = require("../middleware/auth");

const router = express.Router();

router.get("/", requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT c.id_classe, c.nom, c.descripcio, c.id_entrenador, c.dia_setmana, c.hora_inici,
              c.data_classe, c.durada, c.aforament_max, c.places_ocupades, c.sala, c.activa,
              e.nom AS entrenador_nom, e.cognoms AS entrenador_cognoms
       FROM classe c
       LEFT JOIN entrenador e ON e.id_entrenador = c.id_entrenador
       WHERE c.activa = 1
       ORDER BY c.data_classe ASC, c.hora_inici ASC`
    );

    res.json({ ok: true, data: rows });
  } catch (error) {
    console.error("Error llistant classes:", error);
    res.status(500).json({ ok: false, error: "Error intern del servidor" });
  }
});

router.post("/", requireAuth, requireAdmin, async (req, res) => {
  try {
    const {
      nom,
      descripcio,
      id_entrenador,
      dia_setmana,
      hora_inici,
      data_classe,
      durada,
      aforament_max,
      places_ocupades,
      sala,
    } = req.body;

    if (!nom || !id_entrenador || !dia_setmana || !hora_inici || !durada || !aforament_max || !sala) {
      return res.status(400).json({ error: "Falten camps obligatoris per crear la classe" });
    }

    const duration = Number(durada);
    const maxCapacity = Number(aforament_max);
    const occupied = Number(places_ocupades || 0);

    if (duration <= 0 || maxCapacity <= 0 || occupied < 0 || occupied > maxCapacity) {
      return res.status(400).json({ error: "Valors de durada o aforament no vàlids" });
    }

    const [trainerRows] = await pool.execute(
      "SELECT id_entrenador FROM entrenador WHERE id_entrenador = ? AND actiu = 1",
      [id_entrenador]
    );

    if (trainerRows.length === 0) {
      return res.status(400).json({ error: "L'entrenador seleccionat no existeix o està inactiu" });
    }

    const [result] = await pool.execute(
      `INSERT INTO classe
       (nom, descripcio, id_entrenador, dia_setmana, hora_inici, data_classe, durada, aforament_max, places_ocupades, sala, activa)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [
        nom.trim(),
        descripcio?.trim() || null,
        id_entrenador,
        dia_setmana.trim(),
        hora_inici,
        data_classe || null,
        duration,
        maxCapacity,
        occupied,
        sala.trim(),
      ]
    );

    const [rows] = await pool.execute(
      `SELECT c.id_classe, c.nom, c.descripcio, c.id_entrenador, c.dia_setmana, c.hora_inici,
              c.data_classe, c.durada, c.aforament_max, c.places_ocupades, c.sala, c.activa,
              e.nom AS entrenador_nom, e.cognoms AS entrenador_cognoms
       FROM classe c
       LEFT JOIN entrenador e ON e.id_entrenador = c.id_entrenador
       WHERE c.id_classe = ?`,
      [result.insertId]
    );

    res.status(201).json({ classe: rows[0] });
  } catch (error) {
    console.error("Error creant classe:", error);
    res.status(500).json({ error: "Error intern del servidor" });
  }
});

router.put("/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const {
      nom,
      descripcio,
      id_entrenador,
      dia_setmana,
      hora_inici,
      data_classe,
      durada,
      aforament_max,
      places_ocupades,
      sala,
    } = req.body;

    if (!nom || !id_entrenador || !dia_setmana || !hora_inici || !durada || !aforament_max || !sala) {
      return res.status(400).json({ error: "Falten camps obligatoris per actualitzar la classe" });
    }

    const duration = Number(durada);
    const maxCapacity = Number(aforament_max);
    const occupied = Number(places_ocupades || 0);

    if (duration <= 0 || maxCapacity <= 0 || occupied < 0 || occupied > maxCapacity) {
      return res.status(400).json({ error: "Valors de durada o aforament no vàlids" });
    }

    const [trainerRows] = await pool.execute(
      "SELECT id_entrenador FROM entrenador WHERE id_entrenador = ? AND actiu = 1",
      [id_entrenador]
    );

    if (trainerRows.length === 0) {
      return res.status(400).json({ error: "L'entrenador seleccionat no existeix o està inactiu" });
    }

    const [result] = await pool.execute(
      `UPDATE classe
       SET nom = ?, descripcio = ?, id_entrenador = ?, dia_setmana = ?, hora_inici = ?,
           data_classe = ?, durada = ?, aforament_max = ?, places_ocupades = ?, sala = ?
       WHERE id_classe = ? AND activa = 1`,
      [
        nom.trim(),
        descripcio?.trim() || null,
        id_entrenador,
        dia_setmana.trim(),
        hora_inici,
        data_classe || null,
        duration,
        maxCapacity,
        occupied,
        sala.trim(),
        id,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Classe no trobada" });
    }

    const [rows] = await pool.execute(
      `SELECT c.id_classe, c.nom, c.descripcio, c.id_entrenador, c.dia_setmana, c.hora_inici,
              c.data_classe, c.durada, c.aforament_max, c.places_ocupades, c.sala, c.activa,
              e.nom AS entrenador_nom, e.cognoms AS entrenador_cognoms
       FROM classe c
       LEFT JOIN entrenador e ON e.id_entrenador = c.id_entrenador
       WHERE c.id_classe = ?`,
      [id]
    );

    res.json({ classe: rows[0] });
  } catch (error) {
    console.error("Error actualitzant classe:", error);
    res.status(500).json({ error: "Error intern del servidor" });
  }
});

router.delete("/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [result] = await pool.execute(
      "UPDATE classe SET activa = 0 WHERE id_classe = ? AND activa = 1",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Classe no trobada" });
    }

    res.json({ message: "Classe desactivada correctament" });
  } catch (error) {
    console.error("Error desactivant classe:", error);
    res.status(500).json({ error: "Error intern del servidor" });
  }
});

module.exports = router;
