import express from "express";
import { pool } from "../db.js";

const router = express.Router(); 

router.post("/", async (req, res) => {
  const { name, nodes, edges, result, profesor_id } = req.body;

  try {
    const query = `
      INSERT INTO circuits 
      (name, data, result, profesor_id, status, created_at)
      VALUES ($1, $2, $3, $4, 'borrador', NOW())
      RETURNING id
    `;

    const resultDB=await pool.query(query, [
      name,
      JSON.stringify({ nodes, edges }),
      JSON.stringify(result),
      profesor_id
    ]);
    res.json({ id: resultDB.rows[0].id });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error guardando circuito" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM circuits WHERE id=$1",
      [req.params.id]
    );

    res.json(result.rows[0]);

  } catch (err) {
    res.status(500).json({ error: "Error obteniendo circuito" });
  }
});

router.get("/profesor/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM circuits WHERE profesor_id = $1 ORDER BY created_at DESC",
      [req.params.id]
    );

    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error obteniendo circuitos" });
  }
});


router.delete("/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM circuits WHERE id=$1", [req.params.id]);
    res.json({ message: "Eliminado" });
  } catch (err) {
    res.status(500).json({ error: "Error eliminando" });
  }
});

router.put("/publish/:id", async (req, res) => {
  const { due_date } = req.body;

  try {
    await pool.query(
      `UPDATE circuits
       SET status='publicado',
           published_at=NOW(),
           due_date=$1
       WHERE id=$2`,
      [due_date, req.params.id]
    );

    res.json({ message: "Publicado" });

  } catch (err) {
    res.status(500).json({ error: "Error publicando" });
  }
});

router.put("/finish/:id", async (req, res) => {
  try {
    await pool.query(
      `UPDATE circuits
       SET status='cerrado'
       WHERE id=$1`,
      [req.params.id]
    );

    res.json({ message: "Finalizado" });

  } catch (err) {
    res.status(500).json({ error: "Error cerrando" });
  }
});

router.get("/student/:id", async (req, res) => {
  const studentId = req.params.id;

  try {
    const result = await pool.query(`
      SELECT 
        c.id,
        c.name,
        c.status,
        c.created_at,
        c.published_at,
        c.due_date,
        s.grade,
        s.id AS submission_id
      FROM circuits c
      JOIN teacher_students ts 
        ON ts.teacher_id = c.profesor_id
      LEFT JOIN submissions s 
        ON s.circuit_id = c.id 
        AND s.student_id = $1
      WHERE ts.student_id = $1
        AND c.status IN ('publicado', 'cerrado')
      ORDER BY c.published_at DESC
    `, [studentId]);

    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error obteniendo circuitos del alumno" });
  }
});

router.get("/:id/submissions", async (req, res) => {
  const circuitId = req.params.id;

  try {
    //  Obtener resultados correctos
    const circuitResult = await pool.query(
      "SELECT data, result FROM circuits WHERE id = $1",
      [circuitId]
    );

    const correct = circuitResult.rows[0]?.result;
    const nodes = circuitResult.rows[0].data.nodes;

    // Obtener submissions
    const submissionsResult = await pool.query(`
      SELECT 
        u.usuario,
        s.grade,
        s.solution
      FROM submissions s
      JOIN users u ON u.id = s.student_id
      WHERE s.circuit_id = $1
      ORDER BY s.submitted_at DESC
    `, [circuitId]);

    

    res.json({
      correct,
      nodes, 
      submissions: submissionsResult.rows
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error obteniendo notas" });
  }
});

export default router;