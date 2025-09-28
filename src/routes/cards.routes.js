import express from "express";
import { 
    createCardController,
    getCardsController, 
    deleteCardController 
} from "../controllers/cards.controller.js";

import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, createCardController);       
router.get("/", authMiddleware, getCardsController);          
router.delete("/:cardId", authMiddleware, deleteCardController); 

export default router;