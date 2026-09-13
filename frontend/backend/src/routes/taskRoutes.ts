import express from "express";
import {
  createTask,
  getTasks,
  getTaskById,
  applyToTask,
  selectWorker,
  updateTaskStatus,
  rateTaskParticipant,
} from "../controllers/taskController";
import { authenticateToken } from "../middleware/authMiddleware";
import { checkFeature } from "../middleware/featureMiddleware";

const router = express.Router();

router.use(checkFeature("taskBoardEnabled"));

router.post("/", authenticateToken, createTask);
router.get("/", authenticateToken, getTasks);
router.get("/:id", authenticateToken, getTaskById);
router.post("/:id/apply", authenticateToken, applyToTask);
router.post("/:id/select-worker", authenticateToken, selectWorker);
router.patch("/:id/status", authenticateToken, updateTaskStatus);
router.post("/:id/rate", authenticateToken, rateTaskParticipant);

export default router;
