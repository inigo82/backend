import express from "express";
import { pool } from "../db.js";

const router = express.Router(); 

router.post("/submit", async (req, res) => {
  const { student_id, circuit_id, solution, grade } = req.body;

  try {
    await pool.query(`
      INSERT INTO submissions (student_id, circuit_id, solution, grade)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (student_id, circuit_id)
      DO UPDATE SET 
        solution = $3,
        grade = $4,
        submitted_at = NOW()
    `, [student_id, circuit_id, JSON.stringify(solution), grade]);

    res.json({ message: "Entrega guardada" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error guardando entrega" });
  }
});

router.get("/:id/submissions", async (req, res) => {
  const circuitId = req.params.id;

  try {
    const result = await pool.query(`
      SELECT 
        u.usuario,
        s.grade,
        s.submitted_at
      FROM submissions s
      JOIN users u ON u.id = s.student_id
      WHERE s.circuit_id = $1
      ORDER BY s.submitted_at DESC
    `, [circuitId]);

    res.json(result.rows);

  } catch (err) {
    res.status(500).json({ error: "Error obteniendo notas" });
  }
});

router.get("/student/:studentId/circuit/:circuitId", async (req, res) => {
  const { studentId, circuitId } = req.params;

  try {
    const result = await pool.query(`
      SELECT solution, grade
      FROM submissions
      WHERE student_id = $1 AND circuit_id = $2
    `, [studentId, circuitId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "No submission found" });
    }

    res.json(result.rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error obteniendo submission" });
  }
});

export default router;