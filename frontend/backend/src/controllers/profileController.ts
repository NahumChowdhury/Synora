import { Response } from "express";
import { AuthenticatedRequest } from "../types/auth";
import prisma from "../lib/prisma";
import { optionalText, parsePositiveInt } from "../utils/validation";

export const getMyProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const user = await prisma.user.findUnique({ where: { id: userId }, include: { profile: true } });
    if (!user) return res.status(404).json({ message: "User not found" });
    const ratingAvg = user.ratingCount > 0 ? (user.ratingSum / user.ratingCount).toFixed(1) : "New";
    return res.status(200).json({
      id: user.id,
      email: user.email,
      role: user.role,
      rating: ratingAvg,
      ratingCount: user.ratingCount,
      profile: user.profile,
      profileComplete: Boolean(user.profile?.fullName && user.profile?.department && user.profile?.batch),
    });
  } catch (error) {
    console.error("Get profile error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const updateMyProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const fullName = optionalText(req.body?.fullName, 120);
    const department = optionalText(req.body?.department, 120);
    const batch = optionalText(req.body?.batch, 80);
    const skills = optionalText(req.body?.skills, 1200);
    const bio = optionalText(req.body?.bio, 2500);
    if ([fullName, department, batch, skills, bio].includes(undefined)) {
      return res.status(400).json({ message: "One or more profile fields exceed the allowed length." });
    }

    const profile = await prisma.profile.upsert({
      where: { userId },
      update: { fullName, department, batch, skills, bio },
      create: { userId, fullName, department, batch, skills, bio },
    });
    return res.status(200).json({ message: "Profile updated successfully", profile });
  } catch (error) {
    console.error("Update profile error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getAnonymousWorkerProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const workerId = parsePositiveInt(req.params.id);
    if (!workerId) return res.status(400).json({ message: "Invalid worker id" });
    const user = await prisma.user.findUnique({
      where: { id: workerId },
      include: { profile: true, tasksAssigned: { where: { status: "COMPLETED" }, select: { id: true } } },
    });
    if (!user) return res.status(404).json({ message: "Worker not found" });
    const ratingAvg = user.ratingCount > 0 ? (user.ratingSum / user.ratingCount).toFixed(1) : "New";
    return res.status(200).json({
      workerAlias: `Student #${user.id}`,
      rating: ratingAvg,
      ratingCount: user.ratingCount,
      completedTasksCount: user.tasksAssigned.length,
      skills: user.profile?.skills || "General",
    });
  } catch (error) {
    console.error("Get anonymous profile error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getPublicProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const targetUserId = parsePositiveInt(req.params.id);
    if (!targetUserId) return res.status(400).json({ message: "Invalid user id" });
    const user = await prisma.user.findUnique({ where: { id: targetUserId }, include: { profile: true } });
    if (!user) return res.status(404).json({ message: "User not found" });
    const ratingAvg = user.ratingCount > 0 ? (user.ratingSum / user.ratingCount).toFixed(1) : "New";
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
