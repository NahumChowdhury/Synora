import express from "express";
import {
  getMyConversations,
  getConversationMessages,
  sendMessage,
} from "../controllers/chatController";
import { authenticateToken } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/conversations", authenticateToken, getMyConversations);
router.get("/conversations/:id/messages", authenticateToken, getConversationMessages);
router.post("/conversations/:id/messages", authenticateToken, sendMessage);

export default router;
