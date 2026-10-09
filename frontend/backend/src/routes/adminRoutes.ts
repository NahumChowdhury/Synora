import express from "express";
import {
  getAllUsers,
  getFeatureSettings,
  getMessageReports,
  toggleBanUser,
  updateFeatureSettings,
  updateMessageReport,
} from "../controllers/adminController";
import { authenticateToken } from "../middleware/authMiddleware";
import { requireAdmin } from "../middleware/adminMiddleware";
import { writeLimiter } from "../middleware/rateLimits";

const router = express.Router();
router.use(authenticateToken, requireAdmin);

router.get("/users", getAllUsers);
router.patch("/users/:id/ban", writeLimiter, toggleBanUser);
router.get("/settings", getFeatureSettings);
router.put("/settings", writeLimiter, updateFeatureSettings);
router.get("/reports", getMessageReports);
router.patch("/reports/:id", writeLimiter, updateMessageReport);

export default router;
