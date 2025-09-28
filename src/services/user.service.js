import pool from "../config/database.js";
import bcrypt from "bcrypt";

export const getUserProfileService = async (userId) => {
  const query = `SELECT id, username, email, full_name, created_at, updated_at FROM users WHERE id = $1`;
  const { rows } = await pool.query(query, [userId]);
  return rows[0];
};

export const updateUserProfileService = async (userId, data) => {
  const { email, full_name, username } = data;

  const query = `
    UPDATE users
    SET email = COALESCE($1, email),
        full_name = COALESCE($2, full_name),
        username = COALESCE($3, username),
        updated_at = NOW()
    WHERE id = $4
    RETURNING id, username, email, full_name, updated_at
  `;
  const values = [email, full_name, username, userId];
  const { rows } = await pool.query(query, values);
  return rows[0];
};

export const changePasswordService = async (userId, oldPassword, newPassword) => {
  const findUser = `SELECT password_hash FROM users WHERE id = $1`;
  const { rows } = await pool.query(findUser, [userId]);

  if (rows.length === 0) throw new Error("Usuario no encontrado");

  const validPassword = await bcrypt.compare(oldPassword, rows[0].password_hash);
  if (!validPassword) throw new Error("Contraseña actual incorrecta");

  const newHashed = await bcrypt.hash(newPassword, 10);
  const updateQuery = `UPDATE users SET password_hash = $1 WHERE id = $2`;
  await pool.query(updateQuery, [newHashed, userId]);

  return { message: "Contraseña actualizada correctamente" };
};

export const deleteUserService = async (userId) => {
  const query = `DELETE FROM users WHERE id = $1 RETURNING id, username`;
  const { rows } = await pool.query(query, [userId]);
  return rows[0];
};