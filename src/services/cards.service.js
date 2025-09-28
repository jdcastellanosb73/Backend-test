import pool from "../config/database.js";

export const createCardService = async (userId, cardNumber, cardHolderName, expirationDate, cvv, type) => {
  const query = `
    INSERT INTO cards (user_id, card_number, card_holder_name, expiration_date, cvv, type)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id, user_id, card_number, card_holder_name, expiration_date, type, created_at;
  `;
  const { rows } = await pool.query(query, [userId, cardNumber, cardHolderName, expirationDate, cvv, type]);
  return rows[0];
};

export const getCardsByUserService = async (userId) => {
  const query = `SELECT id, card_holder_name, card_number, expiration_date, created_at FROM cards WHERE user_id = $1`;
  const { rows } = await pool.query(query, [userId]);
  return rows;
};

export const deleteCardService = async (cardId, userId) => {
  const query = `DELETE FROM cards WHERE id = $1 AND user_id = $2 RETURNING id`;
  const { rows } = await pool.query(query, [cardId, userId]);
  return rows[0];
};