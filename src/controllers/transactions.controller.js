import {
  createTransactionService,
  getTransactionsService,
  getTransactionByIdService,
  getSummaryService,
  getStatsService
} from "../services/transactions.service.js";

export const createTransactionController = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Usuario no autenticado" });
    }

    const {
      currency,
      amount,
      description,
      full_name,
      document_type,
      Numero_documento,  
      card_number,
      cvv,
      expiration_date,
      type,
      category
    } = req.body;

    if (
      !currency || 
      amount == null || 
      !description || 
      !full_name || 
      !document_type || 
      !Numero_documento ||  
      !card_number || 
      !cvv || 
      !expiration_date || 
      !type || 
      !category
    ) {
      return res.status(400).json({
        message: "Faltan campos obligatorios en la transacción"
      });
    }

    const transaction = await createTransactionService(req.body, userId);
    res.status(201).json({
      message: "Transacción creada con éxito",
      data: transaction
    });
  } catch (error) {
    console.error("Error creando transacción:", error);
    res.status(500).json({ message: "Error al crear transacción" });
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