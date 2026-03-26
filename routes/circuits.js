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

    await pool.query(query, [
      name,
      JSON.stringify({ nodes, edges }),
      JSON.stringify(result),
      profesor_id
    ]);

    res.json({ id: result.rows[0].id });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error guardando circuito" });
  }
});

export default router;