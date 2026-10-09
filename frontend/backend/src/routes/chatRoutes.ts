import express from "express";
import {
  blockOtherParticipant,
  getConversationMessages,
  getMyConversations,
  reportMessage,
  sendMessage,
  unblockOtherParticipant,
} from "../controllers/chatController";
import { authenticateToken } from "../middleware/authMiddleware";
import { messageLimiter, writeLimiter } from "../middleware/rateLimits";

const router = express.Router();
router.use(authenticateToken);

router.get("/conversations", getMyConversations);
router.get("/conversations/:id/messages", getConversationMessages);
router.post("/conversations/:id/messages", messageLimiter, sendMessage);
router.post("/conversations/:id/block", writeLimiter, blockOtherParticipant);
router.delete("/conversations/:id/block", writeLimiter, unblockOtherParticipant);
router.post("/messages/:messageId/report", writeLimiter, reportMessage);

export default router;
