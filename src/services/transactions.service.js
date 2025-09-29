import pool from '../config/database.js';

export const createTransactionService = async (data, userId) => {
  console.log("🔧 SERVICE - Datos recibidos:", JSON.stringify(data, null, 2));
  console.log("🔧 SERVICE - User ID:", userId);

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
    currency,           // $1
    amount,            // $2
    description,       // $3
    full_name,         // $4
    document_type,     // $5
    numero_documento,  // $6
    card_number,       // $7
    cvv,              // $8
    expiration_date,   // $9
    userId,           // $10
    type,             // $11
    category,         // $12
    status,           // $13
    reference,        // $14
    metadata ? JSON.stringify(metadata) : null  // $15
  ];

  console.log("🔧 SERVICE - Query:", query);
  console.log("🔧 SERVICE - Values:", values);

  try {
    const { rows } = await pool.query(query, values);
    console.log("✅ SERVICE - Transacción insertada:", rows[0]);
    return rows[0];
  } catch (error) {
    console.error("🚨 SERVICE - Error en query:", error);
    console.error("🚨 SERVICE - Error code:", error.code);
    console.error("🚨 SERVICE - Error detail:", error.detail);
    console.error("🚨 SERVICE - Error message:", error.message);
    throw error;
  }
};

// ==================== SERVICIO: OBTENER TRANSACCIONES ====================
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
    console.error("🚨 Error en getTransactionsByUserService:", error);
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