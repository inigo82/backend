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
export default router;