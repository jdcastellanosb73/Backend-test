import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  getUserProfile,
  updateUserProfile,
  changePassword,
  deleteUser
} from "../controllers/user.controller.js";

const router = express.Router();


router.get("/profile", authMiddleware, getUserProfile);
router.put("/profile", authMiddleware, updateUserProfile);
router.put("/change-password", authMiddleware, changePassword);
router.delete("/delete", authMiddleware, deleteUser);

export default router;