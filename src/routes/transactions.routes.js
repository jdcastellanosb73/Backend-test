import { Router } from "express";
import {
  createTransactionController,
  getTransactionsController,
  getTransactionByIdController,
  getSummaryController,
  getStatsController
} from "../controllers/transactions.controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/", authMiddleware, createTransactionController);
router.get("/", authMiddleware, getTransactionsController);
router.get("/summary", authMiddleware, getSummaryController);
router.get("/stats", authMiddleware, getStatsController);
router.get("/:id", authMiddleware, getTransactionByIdController);

export default router;