import pool from "../config/database.js";
import bcrypt from 'bcrypt';
import { generateToken } from "../utils/jwt.js";

export const registerUserService = async (username, password) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  const query = `
    INSERT INTO users (username, password_hash, created_at)
    VALUES ($1, $2, NOW()) RETURNING id, username
  `;
  const { rows } = await pool.query(query, [username, hashedPassword]);
  return rows[0];
};

export const loginUserService = async (username, password) => {
  const query = `SELECT * FROM users WHERE username = $1`;
  const { rows } = await pool.query(query, [username]);

  if (rows.length === 0) throw new Error("Usuario no encontrado");

  const user = rows[0];
  const validPassword = await bcrypt.compare(password, user.password_hash);

  if (!validPassword) throw new Error("Contraseña incorrecta");

  const token = generateToken(user);
  return { user: { id: user.id, username: user.username }, token };
};