import pool from "../config/database.js";
import bcrypt from 'bcrypt';
import { generateToken } from "../utils/jwt.js";

export const registerUserService = async (username, email, full_name, password) => {
  const hashedPassword = await bcrypt.hash(password, 10);

  const query = `
    INSERT INTO users (username, email, full_name, password_hash)
    VALUES ($1, $2, $3, $4)
    RETURNING id, username, email, full_name, created_at;
  `;
  const { rows } = await pool.query(query, [username, email, full_name, hashedPassword]);

  if (rows.length === 0) {
    throw new Error("No se pudo crear el usuario");
  }

  return rows[0];
};

export const loginUserService = async (username, password) => {
  const query = `
    SELECT id, username, password_hash 
    FROM users 
    WHERE username = $1
  `;
  const { rows } = await pool.query(query, [username]);

  if (rows.length === 0) throw new Error("Usuario no encontrado");

  const user = rows[0];
  const validPassword = await bcrypt.compare(password, user.password_hash);

  if (!validPassword) throw new Error("Contraseña incorrecta");

  const token = generateToken(user);
  return { 
    user: { 
      id: user.id, 
      username: user.username 
    }, 
    token 
  };
};