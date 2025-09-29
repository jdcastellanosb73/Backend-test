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
    
    console.log("🔍 DEBUG - User ID del token:", userId);
    
    if (!userId) {
      return res.status(401).json({ message: "Usuario no autenticado" });
    }

    const userCheck = await pool.query("SELECT id FROM users WHERE id = $1", [userId]);
    console.log("🔍 DEBUG - Usuario encontrado:", userCheck.rows);
    
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    console.log("🔍 DEBUG - Body recibido:", JSON.stringify(req.body, null, 2));

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

    // Campos obligatorios (numero_documento NO es obligatorio)
    const requiredFields = {
      currency,
      amount,
      description,
      full_name,
      document_type,
      card_number,
      cvv,
      expiration_date,
      type,
      category
    };

    console.log("🔍 DEBUG - Campos requeridos:", requiredFields);

    // Validación de campos obligatorios
    for (const [field, value] of Object.entries(requiredFields)) {
      if (value === undefined || value === null || value === '') {
        console.log(`❌ Campo faltante: ${field} = ${value}`);
        return res.status(400).json({
          message: `El campo '${field}' es obligatorio`
        });
      }
    }

    // Validación del monto
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      console.log("❌ Monto inválido:", amount);
      return res.status(400).json({ message: "El monto debe ser un número positivo" });
    }

    // Validación de currency
    const validCurrencies = ['USD', 'COP'];
    if (!validCurrencies.includes(currency)) {
      console.log("❌ Currency inválida:", currency);
      return res.status(400).json({ 
        message: "La moneda debe ser USD o COP" 
      });
    }

    // Validación de tipo de documento
    const validDocumentTypes = ['CC', 'PP', 'DNI'];
    if (!validDocumentTypes.includes(document_type)) {
      console.log("❌ Document type inválido:", document_type);
      return res.status(400).json({ 
        message: "El tipo de documento debe ser CC, PP o DNI" 
      });
    }

    // Validación de tipo de transacción
    const validTransactionTypes = ['withdrawal', 'payment'];
    if (!validTransactionTypes.includes(type)) {
      console.log("❌ Type inválido:", type);
      return res.status(400).json({ 
        message: "El tipo de transacción debe ser 'withdrawal' o 'payment'" 
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

    console.log("✅ Datos validados, enviando al servicio:", JSON.stringify(transactionData, null, 2));

    const transaction = await createTransactionService(transactionData, userId);

    console.log("✅ Transacción creada:", transaction);

    return res.status(201).json({
      message: "Transacción creada con éxito",
      data: transaction
    });
  } catch (error) {
    console.error("🚨 Error DETALLADO creando transacción:", error);
    console.error("🚨 Stack trace:", error.stack);
    console.error("🚨 Error code:", error.code);
    console.error("🚨 Error message:", error.message);
    
    // Manejo específico de errores de PostgreSQL
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

    if (error.code === '23502') {
      return res.status(400).json({ 
        message: "Faltan campos obligatorios en la transacción",
        detail: error.message
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