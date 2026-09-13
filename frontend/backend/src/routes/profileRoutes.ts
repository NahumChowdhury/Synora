import express from "express";
import {
  getMyProfile,
  updateMyProfile,
  getAnonymousWorkerProfile,
  getPublicProfile,
} from "../controllers/profileController";
import { authenticateToken } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/me", authenticateToken, getMyProfile);
router.put("/me", authenticateToken, updateMyProfile);
router.get("/anonymous/:id", authenticateToken, getAnonymousWorkerProfile);
router.get("/public/:id", authenticateToken, getPublicProfile);

export default router;
