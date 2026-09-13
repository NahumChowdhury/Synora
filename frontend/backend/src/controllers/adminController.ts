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
    const {
      taskBoardEnabled,
      teamMatchEnabled,
      ratingThreshold,
    } = req.body;

    const settings = await prisma.featureSetting.upsert({
      where: { id: 1 },
      update: {
        taskBoardEnabled,
        teamMatchEnabled,
        ratingThreshold: ratingThreshold ? parseFloat(ratingThreshold) : undefined,
      },
      create: {
        id: 1,
        taskBoardEnabled: taskBoardEnabled ?? true,
        teamMatchEnabled: teamMatchEnabled ?? true,
        ratingThreshold: ratingThreshold ? parseFloat(ratingThreshold) : 2.5,
      },
    });

    return res.status(200).json({
      message: "Platform settings updated successfully",
      settings,
    });
  } catch (error) {
    console.error("Admin update settings error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
