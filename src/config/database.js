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

if (process.env.PG_HOST !== 'localhost' && process.env.PG_HOST !== '127.0.0.1') {
  config.ssl = {
    rejectUnauthorized: false
  };
}

const pool = new Pool(config);

pool.on('connect', () => {
  console.log('✅ Conectado a PostgreSQL');
  console.log('   Host:', process.env.PG_HOST);
  console.log('   Database:', process.env.PG_DATABASE);
  console.log('   SSL:', config.ssl ? 'Habilitado' : 'Deshabilitado');
});

pool.on('error', (err) => {
  console.error('❌ Error en la conexión a PostgreSQL:', err);
  process.exit(-1);
});

export default pool;
