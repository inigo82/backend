// db.js
import pkg from "pg";
const { Pool } = pkg;

export const pool = new Pool({
  connectionString: "postgresql://backend:PFuoPTTpkeNsT7SWm7KWyL0JvZy5YRUF@dpg-d6s9b7ua2pns73834hu0-a.oregon-postgres.render.com/backend_iawc",
  ssl: { rejectUnauthorized: false },
});