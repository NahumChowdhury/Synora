import express from "express";
import { adminLogin, googleLogin, logout, verify } from "../controllers/authController";
import { authenticateToken } from "../middleware/authMiddleware";
import { authLimiter } from "../middleware/rateLimits";

const router = express.Router();

router.post("/google", authLimiter, googleLogin);
router.post("/admin-login", authLimiter, adminLogin);
router.post("/logout", logout);
router.get("/verify", authenticateToken, verify);

export default router;
