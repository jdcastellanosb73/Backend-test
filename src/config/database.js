import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;

const config = {
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT ? parseInt(process.env.PG_PORT, 10) : 5432,
};

if (process.env.NODE_ENV === 'production') {
  config.ssl = {
    rejectUnauthorized: false
  };
}

const pool = new Pool(config);

pool.on('connect', () => {
  console.log('Conectado a PostgreSQL');
});

pool.on('error', (err) => {
  console.error('Error en la conexión a PostgreSQL:', err);
  process.exit(-1);
});

export default pool;
