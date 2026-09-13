import express from "express";
import {
  createTeamPost,
  getTeamPosts,
  getTeamPostById,
  applyToTeamPost,
  updateTeamApplicationStatus,
  updateTeamPostStatus,
  deleteTeamPost,
} from "../controllers/teamController";
import { authenticateToken } from "../middleware/authMiddleware";
import { checkFeature } from "../middleware/featureMiddleware";

const router = express.Router();

router.use(checkFeature("teamMatchEnabled"));

router.post("/", authenticateToken, createTeamPost);
router.get("/", authenticateToken, getTeamPosts);
router.get("/:id", authenticateToken, getTeamPostById);
router.post("/:id/apply", authenticateToken, applyToTeamPost);
router.patch("/applications/:appId", authenticateToken, updateTeamApplicationStatus);
router.patch("/:id/status", authenticateToken, updateTeamPostStatus);
router.delete("/:id", authenticateToken, deleteTeamPost);

export default router;
