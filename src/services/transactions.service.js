import pool from '../config/database.js';

export const createTransactionService = async (data, userId) => {

  const {
    currency,
    amount,
    description,
    full_name,
    document_type,
    numero_documento,
    card_number,
    cvv,
    expiration_date,
    type,
    category,
    reference,
    metadata,
    status = "done"
  } = data;

  const query = `
    INSERT INTO transactions (
      currency, amount, description, full_name, document_type, 
      numero_documento, card_number, cvv, expiration_date, 
      user_id, type, category, status, reference, metadata, created_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW())
    RETURNING *;
  `;

  const values = [
    currency,          
    amount,            
    description,       
    full_name,         
    document_type,     
    numero_documento,  
    card_number,       
    cvv,              
    expiration_date,   
    userId,           
    type,             
    category,         
    status,           
    reference,        
    metadata ? JSON.stringify(metadata) : null  
  ];

  try {
    const { rows } = await pool.query(query, values);
    return rows[0];
  } catch (error) {
    throw error;
  }
};

export const getTransactionsByUserService = async (userId, filters = {}) => {
  let query = `
    SELECT * FROM transactions 
    WHERE user_id = $1
  `;
  const values = [userId];
  let paramCount = 1;

  if (filters.currency) {
    paramCount++;
    query += ` AND currency = $${paramCount}`;
    values.push(filters.currency);
  }

  if (filters.type) {
    paramCount++;
    query += ` AND type = $${paramCount}`;
    values.push(filters.type);
  }

  if (filters.category) {
    paramCount++;
    query += ` AND category = $${paramCount}`;
    values.push(filters.category);
  }

  if (filters.status) {
    paramCount++;
    query += ` AND status = $${paramCount}`;
    values.push(filters.status);
  }

  if (filters.startDate) {
    paramCount++;
    query += ` AND created_at >= $${paramCount}`;
    values.push(filters.startDate);
  }

  if (filters.endDate) {
    paramCount++;
    query += ` AND created_at <= $${paramCount}`;
    values.push(filters.endDate);
  }

  query += ` ORDER BY created_at DESC`;

  if (filters.limit) {
    paramCount++;
    query += ` LIMIT $${paramCount}`;
    values.push(filters.limit);
  }

  if (filters.offset) {
    paramCount++;
    query += ` OFFSET $${paramCount}`;
    values.push(filters.offset);
  }

  try {
    const { rows } = await pool.query(query, values);
    return rows;
  } catch (error) {
    throw error;
  }
};


export const getTransactionsService = async (queryParams, userId) => {
  const {
    from,
    to,
    type,
    category,
    sort = "created_at_desc",
    page = 1,
    limit = 10
  } = queryParams || {};

  const safeLimit = Math.min(parseInt(limit) || 10, 100); // máximo 100
  const safePage = Math.max(parseInt(page) || 1, 1);
  const offset = (safePage - 1) * safeLimit;

  let baseQuery = `SELECT * FROM transactions WHERE user_id = $1`;
  let values = [userId];
  let index = 2;

  if (from) {
    baseQuery += ` AND created_at >= $${index++}`;
    values.push(from);
  }
  if (to) {
    baseQuery += ` AND created_at <= $${index++}`;
    values.push(to);
  }
  if (type) {
    baseQuery += ` AND type = $${index++}`;
    values.push(type);
  }
  if (category) {
    baseQuery += ` AND category ILIKE $${index++}`;
    values.push(`%${category}%`);
  }

  const validFields = ["created_at", "amount", "type", "category"];
  const [field, direction] = sort.split("_");
  const safeField = validFields.includes(field) ? field : "created_at";
  const safeDirection = direction?.toUpperCase() === "DESC" ? "DESC" : "ASC";

  baseQuery += ` ORDER BY ${safeField} ${safeDirection} LIMIT $${index} OFFSET $${index + 1}`;
  values.push(safeLimit, offset);

  const { rows } = await pool.query(baseQuery, values);
  return rows;
};

export const getTransactionByIdService = async (id, userId) => {
  const query = `SELECT * FROM transactions WHERE id = $1 AND user_id = $2`;
  const { rows } = await pool.query(query, [id, userId]);
  return rows[0];
};

export const getSummaryService = async (userId) => {
  const query = `
    SELECT
      SUM(CASE WHEN type = 'deposit' THEN amount ELSE 0 END) AS total_deposits,
      SUM(CASE WHEN type = 'withdrawal' THEN amount ELSE 0 END) AS total_withdrawals,
      SUM(CASE WHEN type = 'deposit' THEN amount ELSE -amount END) AS balance
    FROM transactions
    WHERE user_id = $1
  `;
  const { rows } = await pool.query(query, [userId]);
  return rows[0];
};

export const getStatsService = async (userId) => {
  const monthlyQuery = `
    SELECT TO_CHAR(created_at, 'Month') AS month, SUM(amount) AS total
    FROM transactions
    WHERE user_id = $1
    GROUP BY month
    ORDER BY MIN(created_at);
  `;

  const categoryQuery = `
    SELECT category, SUM(amount) AS total
    FROM transactions
    WHERE user_id = $1
    GROUP BY category
    ORDER BY total DESC
    LIMIT 5;
  `;

  const monthly = await pool.query(monthlyQuery, [userId]);
  const categories = await pool.query(categoryQuery, [userId]);

  return {
    monthlySpending: monthly.rows,
    topCategories: categories.rows
  };
};