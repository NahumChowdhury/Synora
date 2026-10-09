import express from "express";
import {
  getAnonymousWorkerProfile,
  getMyProfile,
  getPublicProfile,
  updateMyProfile,
} from "../controllers/profileController";
import { authenticateToken } from "../middleware/authMiddleware";
import { writeLimiter } from "../middleware/rateLimits";

const router = express.Router();
router.use(authenticateToken);

router.get("/me", getMyProfile);
router.put("/me", writeLimiter, updateMyProfile);
router.get("/anonymous/:id", getAnonymousWorkerProfile);
router.get("/public/:id", getPublicProfile);

export default router;
