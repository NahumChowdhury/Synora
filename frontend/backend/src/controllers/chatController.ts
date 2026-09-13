import { Response } from "express";
import { AuthenticatedRequest } from "../types/auth";
import prisma from "../lib/prisma";

export const getMyConversations = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;

    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [{ user1Id: userId }, { user2Id: userId }],
      },
      orderBy: { createdAt: "desc" },
      include: {
        task: { select: { id: true, title: true, status: true } },
        user1: { select: { id: true, email: true, profile: { select: { fullName: true } } } },
        user2: { select: { id: true, email: true, profile: { select: { fullName: true } } } },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    const formatted = conversations.map((conv) => {
      const otherUser = conv.user1Id === userId ? conv.user2 : conv.user1;
      return {
        id: conv.id,
        taskId: conv.taskId,
        taskTitle: conv.task?.title || "Task Chat",
        otherUserId: otherUser.id,
        otherUserAlias: `Student #${otherUser.id}`,
        lastMessage: conv.messages[0]?.content || "No messages yet",
        lastMessageAt: conv.messages[0]?.createdAt || conv.createdAt,
      };
    });

    return res.status(200).json(formatted);
  } catch (error) {
    console.error("Get conversations error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getConversationMessages = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const conversationId = parseInt(req.params.id as string);
    const userId = req.user!.userId;

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        task: { select: { id: true, title: true, status: true } },
      },
    });

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    if (conversation.user1Id !== userId && conversation.user2Id !== userId) {
      return res.status(403).json({ message: "Unauthorized to access this conversation" });
    }

    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" },
      include: {
        sender: {
          select: { id: true },
        },
      },
    });

    const formatted = messages.map((m) => ({
      id: m.id,
      senderId: m.senderId,
      senderAlias: `Student #${m.senderId}`,
      content: m.content,
      createdAt: m.createdAt,
      isMe: m.senderId === userId,
    }));

    return res.status(200).json({
      conversationId: conversation.id,
      taskId: conversation.taskId,
      taskTitle: conversation.task?.title,
      messages: formatted,
    });
  } catch (error) {
    console.error("Get messages error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const sendMessage = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const conversationId = parseInt(req.params.id as string);
    const senderId = req.user!.userId;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: "Message content cannot be empty" });
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    if (conversation.user1Id !== senderId && conversation.user2Id !== senderId) {
      return res.status(403).json({ message: "Unauthorized to send message in this conversation" });
    }

    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId,
        content: content.trim(),
      },
    });

    return res.status(201).json({
      message: "Message sent",
      data: {
        id: message.id,
        senderId: message.senderId,
        senderAlias: `Student #${message.senderId}`,
        content: message.content,
        createdAt: message.createdAt,
        isMe: true,
      },
    });
  } catch (error) {
    console.error("Send message error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
