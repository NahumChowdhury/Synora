import express from "express";
import {
  getAllUsers,
  toggleBanUser,
  getFeatureSettings,
  updateFeatureSettings,
} from "../controllers/adminController";
import { authenticateToken } from "../middleware/authMiddleware";
import { requireAdmin } from "../middleware/adminMiddleware";

const router = express.Router();

router.use(authenticateToken, requireAdmin);

router.get("/users", getAllUsers);
router.patch("/users/:id/ban", toggleBanUser);
router.get("/settings", getFeatureSettings);
router.put("/settings", updateFeatureSettings);

export default router;
