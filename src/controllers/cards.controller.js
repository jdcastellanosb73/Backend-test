import { 
    createCardService,
    getCardsByUserService,
    deleteCardService 
} from "../services/cards.service.js";

export const createCardController = async (req, res) => {
  try {
    const userId = req.user.id; 
    
    const { 
      card_number, 
      cardholder_name, 
      expiration_date, 
      cvv,
      type  
    } = req.body;

    // Validación
    if (!card_number || !cardholder_name || !expiration_date || !cvv || !type) {
      return res.status(400).json({ 
        message: "Faltan campos obligatorios: card_number, cardholder_name, expiration_date, cvv, type" 
      });
    }

    const validTypes = ['visa', 'mastercard', 'amex', 'diners', 'discover', 'unknown'];
    if (!validTypes.includes(type.toLowerCase())) {
      return res.status(400).json({ 
        message: `Tipo de tarjeta inválido. Tipos permitidos: ${validTypes.join(', ')}` 
      });
    }

    const card = await createCardService(
      userId,
      card_number,
      cardholder_name,
      expiration_date,
      cvv,
      type.toLowerCase() 
    );

    res.status(201).json({ message: "Tarjeta creada exitosamente", card });
  } catch (error) {
    console.error("Error en createCardController:", error);
    res.status(500).json({ message: error.message || "Error interno al crear tarjeta" });
  }
};

export const getCardsController = async (req, res) => {
  try {
    const userId = req.user.id;
    const cards = await getCardsByUserService(userId);
    res.json(cards);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteCardController = async (req, res) => {
  try {
    const userId = req.user.id;
    const { cardId } = req.params;

    const deleted = await deleteCardService(cardId, userId);
    if (!deleted) return res.status(404).json({ message: "Tarjeta no encontrada" });

    res.json({ message: "Tarjeta eliminada correctamente" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};