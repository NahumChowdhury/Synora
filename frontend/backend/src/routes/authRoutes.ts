import express from "express";
import {
  register,
  login,
  verify,
} from "../controllers/authController";
import { authenticateToken } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/verify", authenticateToken, verify);

export default router;
