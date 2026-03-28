import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import { pool } from "./db.js";
import authRoutes from "./routes/auth.js";
import circuitsRoutes from "./routes/circuits.js";
import submissionsRoutes from "./routes/submissions.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/circuits", circuitsRoutes);
app.use("/submissions", submissionsRoutes);
app.get("/", (req,res)=>{
    res.send("API running");
});

app.get("/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM users");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error en la BD 1");
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, ()=>{
    console.log("Server running on port", PORT);
});
