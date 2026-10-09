import express from "express";
import {
  applyToTask,
  createTask,
  getTaskById,
  getTasks,
  rateTaskParticipant,
  selectWorker,
  updateTaskStatus,
} from "../controllers/taskController";
import { authenticateToken } from "../middleware/authMiddleware";
import { checkFeature } from "../middleware/featureMiddleware";
import { writeLimiter } from "../middleware/rateLimits";

const router = express.Router();
router.use(authenticateToken, checkFeature("taskBoardEnabled"));

router.post("/", writeLimiter, createTask);
router.get("/", getTasks);
router.get("/:id", getTaskById);
router.post("/:id/apply", writeLimiter, applyToTask);
router.post("/:id/select-worker", writeLimiter, selectWorker);
router.patch("/:id/status", writeLimiter, updateTaskStatus);
router.post("/:id/rate", writeLimiter, rateTaskParticipant);

export default router;
