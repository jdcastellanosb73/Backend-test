import pkg from 'pg';
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pkg;

const sslConfig = process.env.NODE_ENV === 'production' 
  ? { ssl: { rejectUnauthorized: false } } 
  : {};

const pool = new Pool({
  user: String(process.env.PG_USER),
  host: String(process.env.PG_HOST),
  database: String(process.env.PG_DATABASE),
  password: String(process.env.PG_PASSWORD),
  port: Number(process.env.PG_PORT),
  ...sslConfig
});

if (process.env.NODE_ENV === 'production') {
  config.ssl = {
    rejectUnauthorized: false 
  };
}

pool.on("connect", () => {
  console.log("Conectado a PostgreSQL");
});

pool.on("error", (err) => {
  console.error("Error en la conexión a PostgreSQL:", err);
  process.exit(-1);
});

export default pool;
