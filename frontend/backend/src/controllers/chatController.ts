import { Response } from "express";
import { AuthenticatedRequest } from "../types/auth";
import prisma from "../lib/prisma";
import { checkMessageSafety } from "../utils/contentSafety";
import { cleanText, parsePositiveInt } from "../utils/validation";

async function getBlockState(userId: number, otherUserId: number) {
  const rows = await prisma.userBlock.findMany({
    where: {
      OR: [
        { blockerId: userId, blockedId: otherUserId },
        { blockerId: otherUserId, blockedId: userId },
      ],
    },
    select: { blockerId: true, blockedId: true },
  });

  return {
    blockedByMe: rows.some((row) => row.blockerId === userId && row.blockedId === otherUserId),
    blockedMe: rows.some((row) => row.blockerId === otherUserId && row.blockedId === userId),
  };
}

function otherUserForConversation(conv: any, userId: number) {
  return conv.user1Id === userId ? conv.user2 : conv.user1;
}

function formatTaskIdentity(conv: any, viewerUserId: number) {
  const viewerIsRequester = conv.task?.requesterId === viewerUserId;
  return {
    contextType: "TASK",
    contextTitle: conv.task?.title || "Task conversation",
    otherUser: {
      fullName: viewerIsRequester ? "Selected Worker" : "Requester",
      email: null,
    },
  };
}

export const getMyConversations = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const conversations = await prisma.conversation.findMany({
      where: {
        taskId: { not: null },
        OR: [{ user1Id: userId }, { user2Id: userId }],
      },
      orderBy: { createdAt: "desc" },
      include: {
        task: { select: { id: true, title: true, status: true, requesterId: true } },
        user1: { select: { id: true } },
        user2: { select: { id: true } },
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    });

    const formatted = await Promise.all(
      conversations.map(async (conv) => {
        const otherUser = otherUserForConversation(conv, userId);
        const identity = formatTaskIdentity(conv, userId);
        const blockState = await getBlockState(userId, otherUser.id);
        return {
          id: conv.id,
          taskId: conv.taskId,
          ...identity,
          ...blockState,
          lastMessage: conv.messages[0]?.content || "No messages yet",
          lastMessageAt: conv.messages[0]?.createdAt || conv.createdAt,
        };
      })
    );

    return res.status(200).json(formatted);
  } catch (error) {
    console.error("Get conversations error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getConversationMessages = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const conversationId = parsePositiveInt(req.params.id);
    const userId = req.user!.userId;
    if (!conversationId) return res.status(400).json({ message: "Invalid conversation id" });

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        task: { select: { id: true, title: true, status: true, requesterId: true } },
        user1: { select: { id: true } },
        user2: { select: { id: true } },
      },
    });

    if (!conversation || !conversation.taskId || !conversation.task) {
      return res.status(404).json({ message: "Task conversation not found" });
    }
    if (conversation.user1Id !== userId && conversation.user2Id !== userId) {
      return res.status(403).json({ message: "Unauthorized to access this conversation" });
    }

    const otherUser = otherUserForConversation(conversation, userId);
    const blockState = await getBlockState(userId, otherUser.id);
    const identity = formatTaskIdentity(conversation, userId);

    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" },
      select: { id: true, senderId: true, content: true, createdAt: true },
    });

    return res.status(200).json({
      conversationId: conversation.id,
      taskId: conversation.taskId,
      ...identity,
      ...blockState,
      messages: messages.map((message) => ({
        id: message.id,
        content: message.content,
        createdAt: message.createdAt,
        senderAlias: message.senderId === userId ? "You" : identity.otherUser.fullName,
        isMe: message.senderId === userId,
      })),
    });
  } catch (error) {
    console.error("Get messages error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const sendMessage = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const conversationId = parsePositiveInt(req.params.id);
    const senderId = req.user!.userId;
    if (!conversationId) return res.status(400).json({ message: "Invalid conversation id" });

    const content = cleanText(req.body?.content, 2000, true);
    if (!content) return res.status(400).json({ message: "Message content is required and must be 2,000 characters or fewer." });

    const safety = checkMessageSafety(content);
    if (!safety.allowed) return res.status(400).json({ message: safety.message, code: "CONTENT_NOT_ALLOWED" });

    const conversation = await prisma.conversation.findUnique({ where: { id: conversationId } });
    if (!conversation || !conversation.taskId) return res.status(404).json({ message: "Task conversation not found" });
    if (conversation.user1Id !== senderId && conversation.user2Id !== senderId) {
      return res.status(403).json({ message: "Unauthorized to send message in this conversation" });
    }

    const otherUserId = conversation.user1Id === senderId ? conversation.user2Id : conversation.user1Id;
    const blockState = await getBlockState(senderId, otherUserId);
    if (blockState.blockedByMe || blockState.blockedMe) {
      return res.status(403).json({ message: "Messaging is unavailable because one participant has blocked the other." });
    }

    const message = await prisma.message.create({ data: { conversationId, senderId, content } });
    return res.status(201).json({
      message: "Message sent",
      data: { ...message, senderAlias: "You", isMe: true },
    });
  } catch (error) {
    console.error("Send message error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const blockOtherParticipant = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const blockerId = req.user!.userId;
    const conversationId = parsePositiveInt(req.params.id);
    if (!conversationId) return res.status(400).json({ message: "Invalid conversation id" });

    const conversation = await prisma.conversation.findUnique({ where: { id: conversationId } });
    if (!conversation || !conversation.taskId) return res.status(404).json({ message: "Task conversation not found" });
    if (conversation.user1Id !== blockerId && conversation.user2Id !== blockerId) {
      return res.status(403).json({ message: "Unauthorized to change blocking for this conversation" });
    }
    const blockedId = conversation.user1Id === blockerId ? conversation.user2Id : conversation.user1Id;
    await prisma.userBlock.upsert({
      where: { blockerId_blockedId: { blockerId, blockedId } },
      update: {},
      create: { blockerId, blockedId },
    });
    return res.status(200).json({ message: "Student blocked", blocked: true });
  } catch (error) {
    console.error("Block user error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const unblockOtherParticipant = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const blockerId = req.user!.userId;
    const conversationId = parsePositiveInt(req.params.id);
    if (!conversationId) return res.status(400).json({ message: "Invalid conversation id" });

    const conversation = await prisma.conversation.findUnique({ where: { id: conversationId } });
    if (!conversation || !conversation.taskId) return res.status(404).json({ message: "Task conversation not found" });
    if (conversation.user1Id !== blockerId && conversation.user2Id !== blockerId) {
      return res.status(403).json({ message: "Unauthorized to change blocking for this conversation" });
    }
    const blockedId = conversation.user1Id === blockerId ? conversation.user2Id : conversation.user1Id;
    await prisma.userBlock.deleteMany({ where: { blockerId, blockedId } });
    return res.status(200).json({ message: "Student unblocked", blocked: false });
  } catch (error) {
    console.error("Unblock user error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

const REPORT_REASONS = ["HARASSMENT", "ADULT_CONTENT", "THREAT", "SPAM", "OTHER"] as const;

export const reportMessage = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const reporterId = req.user!.userId;
    const messageId = parsePositiveInt(req.params.messageId);
    if (!messageId) return res.status(400).json({ message: "Invalid message id" });

    const reason = typeof req.body?.reason === "string" ? req.body.reason.toUpperCase() : "";
    if (!REPORT_REASONS.includes(reason as (typeof REPORT_REASONS)[number])) {
      return res.status(400).json({ message: "Choose a valid report reason" });
    }
    const details = req.body?.details ? cleanText(req.body.details, 1000, false) : null;
    if (req.body?.details && details === null) return res.status(400).json({ message: "Report details are too long" });

    const message = await prisma.message.findUnique({
      where: { id: messageId },
      include: { conversation: true },
    });
    if (!message || !message.conversation.taskId) return res.status(404).json({ message: "Task message not found" });
    if (message.conversation.user1Id !== reporterId && message.conversation.user2Id !== reporterId) {
      return res.status(403).json({ message: "You can only report messages from your conversations" });
    }
    if (message.senderId === reporterId) return res.status(400).json({ message: "You cannot report your own message" });

    const report = await prisma.messageReport.create({
      data: { messageId, reporterId, reason, details: details || null },
    });
    return res.status(201).json({ message: "Message reported. An administrator can review it.", reportId: report.id });
  } catch (error: any) {
    if (error?.code === "P2002") return res.status(400).json({ message: "You already reported this message" });
    console.error("Report message error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
