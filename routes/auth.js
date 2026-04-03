// auth.js
import express from "express";
import { pool } from "../db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const router = express.Router();

// POST /auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1️⃣ Buscar usuario en la base de datos
    const query = "SELECT * FROM users WHERE LOWER(usuario)=LOWER($1)";
    const result = await pool.query(query, [email]);


    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Usuario no encontrado" });
    }


    const user = result.rows[0];


    // 2️Comparar contraseña con bcrypt
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: "Contraseña incorrecta" });
    }

    // 3️Generar JWT
    const token = jwt.sign(
      { id: user.id, role: user.role },
      "visor", 
      { expiresIn: "2h" }
    );
    // 4️Devolver token y rol
    res.json({
      token,
      role: user.role,
      id: user.id,
      user: user.usuario
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

export default router;