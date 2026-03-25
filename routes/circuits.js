import express from "express";
import { pool } from "../db.js";

const router = express.Router(); 

router.post("/", async (req, res) => {
  const { nodes, edges, profesor_id } = req.body;

  try {
    const query = `
      INSERT INTO circuits 
      (data, profesor_id, status, created_at)
      VALUES ($1, $2, 'borrador', NOW())
      RETURNING id
    `;

    const result = await pool.query(query, [
      JSON.stringify({ nodes, edges }),
      profesor_id
    ]);

    res.json({ id: result.rows[0].id });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error guardando circuito" });
  }
});

export default router;