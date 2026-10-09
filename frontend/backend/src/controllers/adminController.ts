import { Response } from "express";
import { AuthenticatedRequest } from "../types/auth";
import prisma from "../lib/prisma";

export const getAllUsers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        profile: true,
      },
    });

    const formatted = users.map((u) => {
      const avgRating = u.ratingCount > 0 ? (u.ratingSum / u.ratingCount).toFixed(1) : "New";
      return {
        id: u.id,
        email: u.email,
        role: u.role,
        isBanned: u.isBanned,
        rating: avgRating,
        ratingCount: u.ratingCount,
        fullName: u.profile?.fullName,
        department: u.profile?.department,
        createdAt: u.createdAt,
      };
    });

    return res.status(200).json(formatted);
  } catch (error) {
    console.error("Admin get users error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const toggleBanUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const targetUserId = parseInt(req.params.id as string);

    if (targetUserId === req.user!.userId) {
      return res.status(400).json({ message: "You cannot ban yourself" });
    }

    const target = await prisma.user.findUnique({ where: { id: targetUserId } });

    if (!target) {
      return res.status(404).json({ message: "User not found" });
    }

    if (target.role === "ADMIN") {
      return res.status(403).json({ message: "Administrator accounts cannot be banned from this panel." });
    }

    const updated = await prisma.user.update({
      where: { id: targetUserId },
      data: { isBanned: !target.isBanned },
    });

    return res.status(200).json({
      message: `User ${updated.email} is now ${updated.isBanned ? "BANNED" : "UNBANNED"}`,
      isBanned: updated.isBanned,
    });
  } catch (error) {
    console.error("Admin ban user error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getFeatureSettings = async (req: AuthenticatedRequest, res: Response) => {
  try {
    let settings = await prisma.featureSetting.findUnique({ where: { id: 1 } });

    if (!settings) {
      settings = await prisma.featureSetting.create({ data: { id: 1 } });
    }

    return res.status(200).json(settings);
  } catch (error) {
    console.error("Admin get settings error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const updateFeatureSettings = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { taskBoardEnabled, ratingThreshold } = req.body ?? {};

    if (taskBoardEnabled !== undefined && typeof taskBoardEnabled !== "boolean") {
      return res.status(400).json({ message: "taskBoardEnabled must be true or false" });
    }
    let parsedThreshold: number | undefined;
    if (ratingThreshold !== undefined && ratingThreshold !== null && ratingThreshold !== "") {
      parsedThreshold = Number(ratingThreshold);
      if (!Number.isFinite(parsedThreshold) || parsedThreshold < 1 || parsedThreshold > 5) {
        return res.status(400).json({ message: "ratingThreshold must be between 1 and 5" });
      }
    }

    const settings = await prisma.featureSetting.upsert({
      where: { id: 1 },
      update: { taskBoardEnabled, ratingThreshold: parsedThreshold },
      create: {
        id: 1,
        taskBoardEnabled: taskBoardEnabled ?? true,
        ratingThreshold: parsedThreshold ?? 2.5,
      },
    });

    return res.status(200).json({ message: "Platform settings updated successfully", settings });
  } catch (error) {
    console.error("Admin update settings error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getMessageReports = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const reports = await prisma.messageReport.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
      include: {
        message: {
          select: {
            id: true,
            content: true,
            senderId: true,
            createdAt: true,
            conversationId: true,
          },
        },
        reporter: {
          select: { id: true, email: true, profile: { select: { fullName: true } } },
        },
      },
    });

    return res.status(200).json(reports);
  } catch (error) {
    console.error("Admin get reports error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const updateMessageReport = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const reportId = Number(req.params.id);
    const status = typeof req.body?.status === "string" ? req.body.status : "";
    if (!Number.isInteger(reportId) || reportId <= 0) {
      return res.status(400).json({ message: "Invalid report id" });
    }
    if (!["REVIEWED", "DISMISSED", "ACTION_TAKEN"].includes(status)) {
      return res.status(400).json({ message: "Invalid report status" });
    }

    const existing = await prisma.messageReport.findUnique({ where: { id: reportId } });
    if (!existing) return res.status(404).json({ message: "Report not found" });

    const updated = await prisma.messageReport.update({
      where: { id: reportId },
      data: {
        status: status as "REVIEWED" | "DISMISSED" | "ACTION_TAKEN",
        reviewedById: req.user!.userId,
        reviewedAt: new Date(),
      },
    });
    return res.status(200).json({ message: "Report updated", report: updated });
  } catch (error) {
    console.error("Admin update report error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
