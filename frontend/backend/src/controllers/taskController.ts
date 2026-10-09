import { Response } from "express";
import { AuthenticatedRequest } from "../types/auth";
import prisma from "../lib/prisma";
import {
  cleanText,
  isFutureDate,
  isOneOf,
  optionalText,
  parseMoney,
  parseOptionalDate,
  parsePositiveInt,
} from "../utils/validation";

const TASK_CATEGORIES = ["PPT", "ASSIGNMENT", "PRESENTATION", "THESIS", "DESIGN", "CODING", "RESEARCH", "OTHER"] as const;
const TASK_STATUSES = ["OPEN", "ASSIGNED", "IN_PROGRESS", "COMPLETED", "CANCELLED"] as const;

export const createTask = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const requesterId = req.user!.userId;
    const title = cleanText(req.body?.title, 120, true);
    const description = cleanText(req.body?.description, 5000, true);
    const requirements = optionalText(req.body?.requirements, 3000);
    const deadline = parseOptionalDate(req.body?.deadline);
    const budget = parseMoney(req.body?.budget);
    const category = req.body?.category || "OTHER";

    if (!title || !description) return res.status(400).json({ message: "Title and description are required and must be within the allowed length." });
    if (!isOneOf(category, TASK_CATEGORIES)) return res.status(400).json({ message: "Invalid task category" });
    if (requirements === undefined) return res.status(400).json({ message: "Requirements are too long" });
    if (deadline === undefined || !isFutureDate(deadline)) return res.status(400).json({ message: "Deadline must be a valid future date" });
    if (budget === undefined) return res.status(400).json({ message: "Budget must be a valid non-negative amount" });

    const task = await prisma.task.create({
      data: { requesterId, title, description, category, requirements, deadline, budget, status: "OPEN" },
    });
    return res.status(201).json({ message: "Task created successfully", task });
  } catch (error) {
    console.error("Create task error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getTasks = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { category, status, search } = req.query;
    const userId = req.user!.userId;
    const whereClause: any = {};
    if (category && category !== "ALL") {
      if (!isOneOf(category, TASK_CATEGORIES)) return res.status(400).json({ message: "Invalid task category" });
      whereClause.category = category;
    }
    if (status && status !== "ALL") {
      if (!isOneOf(status, TASK_STATUSES)) return res.status(400).json({ message: "Invalid task status" });
      whereClause.status = status;
    }
    if (typeof search === "string" && search.trim()) {
      const term = search.trim().slice(0, 120);
      whereClause.OR = [
        { title: { contains: term, mode: "insensitive" } },
        { description: { contains: term, mode: "insensitive" } },
      ];
    }

    const tasks = await prisma.task.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      take: 200,
      include: {
        requester: { select: { id: true, ratingSum: true, ratingCount: true } },
        _count: { select: { applications: true } },
      },
    });

    return res.status(200).json(
      tasks.map((task) => ({
        id: task.id,
        title: task.title,
        description: task.description,
        category: task.category,
        requirements: task.requirements,
        deadline: task.deadline,
        budget: task.budget,
        status: task.status,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
        completedAt: task.completedAt,
        requesterAlias: `Requester #${task.id}`,
        requesterRating: task.requester.ratingCount > 0 ? (task.requester.ratingSum / task.requester.ratingCount).toFixed(1) : "New",
        applicationsCount: task._count.applications,
        isRequester: task.requesterId === userId,
        isWorker: task.assignedWorkerId === userId,
      }))
    );
  } catch (error) {
    console.error("Get tasks error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getTaskById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const taskId = parsePositiveInt(req.params.id);
    const userId = req.user!.userId;
    if (!taskId) return res.status(400).json({ message: "Invalid task id" });

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        requester: { select: { id: true, ratingSum: true, ratingCount: true } },
        assignedWorker: { select: { id: true, ratingSum: true, ratingCount: true } },
        applications: {
          orderBy: { createdAt: "asc" },
          include: {
            applicant: {
              select: {
                id: true,
                ratingSum: true,
                ratingCount: true,
                profile: { select: { skills: true } },
              },
            },
          },
        },
        ratings: true,
        conversation: { select: { id: true } },
      },
    });
    if (!task) return res.status(404).json({ message: "Task not found" });

    const isRequester = task.requesterId === userId;
    const isWorker = task.assignedWorkerId === userId;
    const alreadyRated = task.ratings.some((rating) => rating.raterId === userId);
    const completionTime = task.completedAt || task.updatedAt;
    const ratingWindowOpen =
      task.status === "COMPLETED" && Date.now() - completionTime.getTime() <= 24 * 60 * 60 * 1000;
    const formattedApplications = task.applications.map((app, index) => ({
      id: app.id,
      applicantAlias: `Worker #${index + 1}`,
      applicantRating: app.applicant.ratingCount > 0 ? (app.applicant.ratingSum / app.applicant.ratingCount).toFixed(1) : "New",
      skills: app.applicant.profile?.skills || "General",
      message: app.message,
      status: app.status,
      createdAt: app.createdAt,
    }));

    return res.status(200).json({
      id: task.id,
      title: task.title,
      description: task.description,
      category: task.category,
      requirements: task.requirements,
      deadline: task.deadline,
      budget: task.budget,
      status: task.status,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      completedAt: task.completedAt,
      requesterAlias: `Requester #${task.id}`,
      assignedWorkerAlias: task.assignedWorkerId ? "Selected Worker" : null,
      requesterRating: task.requester.ratingCount > 0 ? (task.requester.ratingSum / task.requester.ratingCount).toFixed(1) : "New",
      assignedWorkerRating: task.assignedWorker
        ? task.assignedWorker.ratingCount > 0
          ? (task.assignedWorker.ratingSum / task.assignedWorker.ratingCount).toFixed(1)
          : "New"
        : null,
      isRequester,
      isWorker,
      canRate: (isRequester || isWorker) && ratingWindowOpen && !alreadyRated,
      hasRated: alreadyRated,
      conversationId: task.conversation?.id || null,
      applications: isRequester ? formattedApplications : [],
    });
  } catch (error) {
    console.error("Get task detail error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const applyToTask = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const taskId = parsePositiveInt(req.params.id);
    const applicantId = req.user!.userId;
    if (!taskId) return res.status(400).json({ message: "Invalid task id" });
    const message = optionalText(req.body?.message, 1500);
    if (message === undefined) return res.status(400).json({ message: "Application message is too long" });

    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) return res.status(404).json({ message: "Task not found" });
    if (task.requesterId === applicantId) return res.status(400).json({ message: "You cannot apply to your own task" });
    if (task.status !== "OPEN") return res.status(400).json({ message: "Task is not open for applications" });
    if (task.deadline && task.deadline.getTime() <= Date.now()) return res.status(400).json({ message: "This task deadline has passed" });

    const application = await prisma.taskApplication.create({ data: { taskId, applicantId, message, status: "PENDING" } });
    return res.status(201).json({ message: "Application submitted successfully", application });
  } catch (error: any) {
    if (error?.code === "P2002") return res.status(400).json({ message: "You have already applied to this task" });
    console.error("Apply to task error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const selectWorker = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const taskId = parsePositiveInt(req.params.id);
    const requesterId = req.user!.userId;
    const applicationId = parsePositiveInt(req.body?.applicationId);
    if (!taskId || !applicationId) return res.status(400).json({ message: "Valid task and application ids are required" });

    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) return res.status(404).json({ message: "Task not found" });
    if (task.requesterId !== requesterId) return res.status(403).json({ message: "Only the task requester can select a worker" });
    if (task.status !== "OPEN" || task.assignedWorkerId) return res.status(409).json({ message: "A worker can only be selected for an open, unassigned task" });

    const application = await prisma.taskApplication.findUnique({ where: { id: applicationId } });
    if (!application || application.taskId !== taskId || application.status !== "PENDING") {
      return res.status(400).json({ message: "Select a valid pending applicant" });
    }
    const workerId = application.applicantId;

    const conversation = await prisma.$transaction(async (tx) => {
      await tx.task.update({ where: { id: taskId }, data: { assignedWorkerId: workerId, status: "ASSIGNED" } });
      await tx.taskApplication.update({ where: { id: application.id }, data: { status: "ACCEPTED" } });
      await tx.taskApplication.updateMany({ where: { taskId, id: { not: application.id }, status: "PENDING" }, data: { status: "REJECTED" } });
      const existing = await tx.conversation.findUnique({ where: { taskId } });
      return existing || (await tx.conversation.create({ data: { taskId, user1Id: requesterId, user2Id: workerId } }));
    });

    return res.status(200).json({ message: "Worker selected and conversation opened successfully", conversationId: conversation.id });
  } catch (error) {
    console.error("Select worker error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const updateTaskStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const taskId = parsePositiveInt(req.params.id);
    const userId = req.user!.userId;
    const status = req.body?.status;
    if (!taskId) return res.status(400).json({ message: "Invalid task id" });
    if (!isOneOf(status, TASK_STATUSES)) return res.status(400).json({ message: "Invalid status" });

    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) return res.status(404).json({ message: "Task not found" });
    const isRequester = task.requesterId === userId;
    const isWorker = task.assignedWorkerId === userId;
    if (!isRequester && !isWorker) return res.status(403).json({ message: "Unauthorized to update task status" });

    const allowed =
      (task.status === "OPEN" && status === "CANCELLED" && isRequester) ||
      (task.status === "ASSIGNED" && status === "IN_PROGRESS" && (isRequester || isWorker)) ||
      (task.status === "ASSIGNED" && status === "CANCELLED" && isRequester) ||
      (task.status === "IN_PROGRESS" && status === "COMPLETED" && (isRequester || isWorker)) ||
      (task.status === "IN_PROGRESS" && status === "CANCELLED" && isRequester);

    if (!allowed) return res.status(409).json({ message: `Status cannot move from ${task.status} to ${status}` });

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: { status, completedAt: status === "COMPLETED" ? new Date() : task.completedAt },
    });
    return res.status(200).json({ message: `Task status updated to ${status}`, task: updatedTask });
  } catch (error) {
    console.error("Update task status error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const rateTaskParticipant = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const taskId = parsePositiveInt(req.params.id);
    const raterId = req.user!.userId;
    const score = Number(req.body?.score);
    const comment = optionalText(req.body?.comment, 1000);
    if (!taskId) return res.status(400).json({ message: "Invalid task id" });
    if (!Number.isInteger(score) || score < 1 || score > 5) return res.status(400).json({ message: "Rating score must be an integer between 1 and 5" });
    if (comment === undefined) return res.status(400).json({ message: "Rating comment is too long" });

    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) return res.status(404).json({ message: "Task not found" });
    if (task.status !== "COMPLETED") return res.status(400).json({ message: "Ratings can only be submitted after task completion" });

    let rateeId: number;
    if (raterId === task.requesterId) {
      if (!task.assignedWorkerId) return res.status(400).json({ message: "No worker assigned to rate" });
      rateeId = task.assignedWorkerId;
    } else if (raterId === task.assignedWorkerId) {
      rateeId = task.requesterId;
    } else {
      return res.status(403).json({ message: "Only task participants can leave a rating" });
    }

    const completionTime = task.completedAt || task.updatedAt;
    if (Date.now() - completionTime.getTime() > 24 * 60 * 60 * 1000) {
      return res.status(400).json({ message: "The 1-day rating window for this completed task has expired." });
    }

    const rating = await prisma.$transaction(async (tx) => {
      const created = await tx.rating.create({ data: { taskId, raterId, rateeId, score, comment } });
      await tx.user.update({ where: { id: rateeId }, data: { ratingSum: { increment: score }, ratingCount: { increment: 1 } } });
      return created;
    });

    return res.status(201).json({ message: "Rating submitted successfully", rating });
  } catch (error: any) {
    if (error?.code === "P2002") return res.status(400).json({ message: "You have already rated this task" });
    console.error("Rate task participant error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
