import {
  createTransactionService,
  getTransactionsService,
  getTransactionByIdService,
  getSummaryService,
  getStatsService
} from "../services/transactions.service.js";
import pool from '../config/database.js';

export const createTransactionController = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Usuario no autenticado" });
    }

    const userCheck = await pool.query("SELECT id FROM users WHERE id = $1", [userId]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

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
      metadata   
    } = req.body;

    const requiredFields = [
      'currency', 'amount', 'description', 'full_name',
      'document_type', 'card_number', 'cvv', 'expiration_date', 
      'type', 'category'
    ];

    for (const field of requiredFields) {
      if (req.body[field] === undefined || req.body[field] === null || req.body[field] === '') {
        return res.status(400).json({
          message: `El campo '${field}' es obligatorio`
        });
      }
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      return res.status(400).json({ message: "El monto debe ser un número positivo" });
    }

    const validCurrencies = ['USD', 'COP'];
    if (!validCurrencies.includes(currency)) {
      return res.status(400).json({ 
        message: "La moneda debe ser USD o COP" 
      });
    }

    const validDocumentTypes = ['CC', 'PP', 'DNI'];
    if (!validDocumentTypes.includes(document_type)) {
      return res.status(400).json({ 
        message: "El tipo de documento debe ser CC, PP o DNI" 
      });
    }

    const validTransactionTypes = ['withdrawal', 'payment'];
    if (!validTransactionTypes.includes(type)) {
      return res.status(400).json({ 
        message: "El tipo de transacción debe ser 'withdrawal' o 'payment'" 
      });
    }

    const expirationRegex = /^(\d{2}\/\d{2}|\d{4}-\d{2}-\d{2})$/;
    if (!expirationRegex.test(expiration_date)) {
      return res.status(400).json({ 
        message: "La fecha de expiración debe tener formato MM/YY o YYYY-MM-DD" 
      });
    }

    const transactionData = {
      currency,
      amount: amountNum,
      description,
      full_name,
      document_type,
      numero_documento: numero_documento || null, 
      card_number,
      cvv,
      expiration_date,
      type,
      category,
      reference: reference || null,
      metadata: metadata || null
    };

    const transaction = await createTransactionService(transactionData, userId);

    return res.status(201).json({
      message: "Transacción creada con éxito",
      data: transaction
    });
  } catch (error) {
    console.error("🚨 Error DETALLADO creando transacción:", error);
    
    if (error.code === '23505') {
      return res.status(409).json({ 
        message: "Ya existe una transacción con esos datos" 
      });
    }
    
    if (error.code === '23503') {
      return res.status(400).json({ 
        message: "Error de referencia en la base de datos" 
      });
    }
    
    return res.status(500).json({ 
      message: "Error interno al crear la transacción",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};


export const getTransactionsController = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Usuario no autenticado" });
    }

    const transactions = await getTransactionsService(req.query, userId);

    res.status(200).json({
      message: "Transacciones obtenidas con éxito",
      data: transactions
    });
  } catch (error) {
    console.error("❌ Error obteniendo transacciones:", error);
    res.status(500).json({ message: "Error al obtener transacciones" });
  }
};

export const getTransactionByIdController = async (req, res) => {
  try {
    const result = await getTransactionByIdService(req.params.id, req.user.id);
    if (!result) return res.status(404).json({ message: "No encontrada" });
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getSummaryController = async (req, res) => {
  try {
    const summary = await getSummaryService(req.user.id);
    res.json(summary);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getStatsController = async (req, res) => {
  try {
    const stats = await getStatsService(req.user.id);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};