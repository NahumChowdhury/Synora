import { Response } from "express";
import { AuthenticatedRequest } from "../types/auth";
import prisma from "../lib/prisma";

export const getMyProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const ratingAvg =
      user.ratingCount > 0 ? (user.ratingSum / user.ratingCount).toFixed(1) : "New";

    return res.status(200).json({
      id: user.id,
      email: user.email,
      role: user.role,
      rating: ratingAvg,
      ratingCount: user.ratingCount,
      profile: user.profile,
    });
  } catch (error) {
    console.error("Get profile error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const updateMyProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { fullName, department, batch, skills, bio } = req.body;

    const profile = await prisma.profile.upsert({
      where: { userId },
      update: {
        fullName,
        department,
        batch,
        skills,
        bio,
      },
      create: {
        userId,
        fullName,
        department,
        batch,
        skills,
        bio,
      },
    });

    return res.status(200).json({
      message: "Profile updated successfully",
      profile,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// ANONYMOUS PROFILE for Task Board (Hides University Email)
export const getAnonymousWorkerProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const workerId = parseInt(req.params.id as string);
    const user = await prisma.user.findUnique({
      where: { id: workerId },
      include: {
        profile: true,
        tasksAssigned: {
          where: { status: "COMPLETED" },
          select: { id: true },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ message: "Worker not found" });
    }

    const ratingAvg =
      user.ratingCount > 0 ? (user.ratingSum / user.ratingCount).toFixed(1) : "New";

    // Strictly omit email for anonymity
    return res.status(200).json({
      workerAlias: `Student #${user.id}`,
      rating: ratingAvg,
      ratingCount: user.ratingCount,
      completedTasksCount: user.tasksAssigned.length,
      skills: user.profile?.skills || "General",
      department: user.profile?.department || "DIU Student",
      bio: user.profile?.bio || "",
    });
  } catch (error) {
    console.error("Get anonymous profile error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// PUBLIC PROFESSIONAL PROFILE for Team Match
export const getPublicProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const targetUserId = parseInt(req.params.id as string);
    const user = await prisma.user.findUnique({
      where: { id: targetUserId },
      include: {
        profile: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const ratingAvg =
      user.ratingCount > 0 ? (user.ratingSum / user.ratingCount).toFixed(1) : "New";

    return res.status(200).json({
      id: user.id,
      email: user.email,
      fullName: user.profile?.fullName || "DIU Student",
      department: user.profile?.department,
      batch: user.profile?.batch,
      skills: user.profile?.skills,
      bio: user.profile?.bio,
      rating: ratingAvg,
    });
  } catch (error) {
    console.error("Get public profile error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
