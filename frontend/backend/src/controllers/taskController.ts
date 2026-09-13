import { Response } from "express";
import { AuthenticatedRequest } from "../types/auth";
import prisma from "../lib/prisma";

export const createTask = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const requesterId = req.user!.userId;
    const { title, description, category, requirements, deadline, budget } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: "Title and description are required" });
    }

    const task = await prisma.task.create({
      data: {
        requesterId,
        title,
        description,
        category: category || "OTHER",
        requirements,
        deadline: deadline ? new Date(deadline) : null,
        budget: budget ? parseFloat(budget) : null,
        status: "OPEN",
      },
    });

    return res.status(201).json({
      message: "Task created successfully",
      task,
    });
  } catch (error) {
    console.error("Create task error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getTasks = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { category, status, search } = req.query;

    const whereClause: any = {};

    if (category && category !== "ALL") {
      whereClause.category = category as any;
    }

    if (status && status !== "ALL") {
      whereClause.status = status as any;
    }

    if (search) {
      whereClause.OR = [
        { title: { contains: search as string, mode: "insensitive" } },
        { description: { contains: search as string, mode: "insensitive" } },
      ];
    }

    const tasks = await prisma.task.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      include: {
        requester: {
          select: {
            id: true,
            ratingSum: true,
            ratingCount: true,
            profile: {
              select: {
                fullName: true,
                skills: true,
              },
            },
          },
        },
        _count: {
          select: { applications: true },
        },
      },
    });

    const formattedTasks = tasks.map((task) => ({
      ...task,
      requesterAlias: `Student #${task.requesterId}`,
      requesterRating:
        task.requester.ratingCount > 0
          ? (task.requester.ratingSum / task.requester.ratingCount).toFixed(1)
          : "New",
      applicationsCount: task._count.applications,
    }));

    return res.status(200).json(formattedTasks);
  } catch (error) {
    console.error("Get tasks error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getTaskById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const taskId = parseInt(req.params.id as string);
    const userId = req.user!.userId;

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        requester: {
          select: {
            id: true,
            ratingSum: true,
            ratingCount: true,
          },
        },
        assignedWorker: {
          select: {
            id: true,
            ratingSum: true,
            ratingCount: true,
          },
        },
        applications: {
          include: {
            applicant: {
              select: {
                id: true,
                ratingSum: true,
                ratingCount: true,
                profile: {
                  select: {
                    skills: true,
                    department: true,
                    bio: true,
                  },
                },
              },
            },
          },
        },
        ratings: true,
        conversation: true,
      },
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const isRequester = task.requesterId === userId;
    const isWorker = task.assignedWorkerId === userId;

    // Anonymous application list formatting
    const formattedApplications = task.applications.map((app) => ({
      id: app.id,
      applicantId: app.applicantId,
      applicantAlias: `Worker #${app.applicantId}`,
      rating:
        app.applicant.ratingCount > 0
          ? (app.applicant.ratingSum / app.applicant.ratingCount).toFixed(1)
          : "New",
      skills: app.applicant.profile?.skills || "General",
      message: app.message,
      status: app.status,
      createdAt: app.createdAt,
    }));

    return res.status(200).json({
      ...task,
      requesterAlias: `Requester #${task.requesterId}`,
      assignedWorkerAlias: task.assignedWorkerId ? `Worker #${task.assignedWorkerId}` : null,
      isRequester,
      isWorker,
      applications: isRequester ? formattedApplications : [],
    });
  } catch (error) {
    console.error("Get task detail error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const applyToTask = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const taskId = parseInt(req.params.id as string);
    const applicantId = req.user!.userId;
    const { message } = req.body;

    const task = await prisma.task.findUnique({ where: { id: taskId } });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (task.requesterId === applicantId) {
      return res.status(400).json({ message: "You cannot apply to your own task" });
    }

    if (task.status !== "OPEN") {
      return res.status(400).json({ message: "Task is not open for applications" });
    }

    const application = await prisma.taskApplication.create({
      data: {
        taskId,
        applicantId,
        message,
        status: "PENDING",
      },
    });

    return res.status(201).json({
      message: "Application submitted successfully",
      application,
    });
  } catch (error: any) {
    if (error.code === "P2002") {
      return res.status(400).json({ message: "You have already applied to this task" });
    }
    console.error("Apply to task error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const selectWorker = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const taskId = parseInt(req.params.id as string);
    const requesterId = req.user!.userId;
    const { workerId } = req.body;

    const task = await prisma.task.findUnique({ where: { id: taskId } });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (task.requesterId !== requesterId) {
      return res.status(403).json({ message: "Only the task requester can select a worker" });
    }

    // Update Task & Applications
    await prisma.$transaction([
      prisma.task.update({
        where: { id: taskId },
        data: {
          assignedWorkerId: workerId,
          status: "ASSIGNED",
        },
      }),
      prisma.taskApplication.updateMany({
        where: { taskId, applicantId: workerId },
        data: { status: "ACCEPTED" },
      }),
      prisma.taskApplication.updateMany({
        where: { taskId, applicantId: { not: workerId } },
        data: { status: "REJECTED" },
      }),
    ]);

    // Automatically create or fetch Conversation for chat between requester and worker
    let conversation = await prisma.conversation.findUnique({
      where: { taskId },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          taskId,
          user1Id: requesterId,
          user2Id: workerId,
        },
      });
    }

    return res.status(200).json({
      message: "Worker selected and conversation opened successfully",
      conversationId: conversation.id,
    });
  } catch (error) {
    console.error("Select worker error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const updateTaskStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const taskId = parseInt(req.params.id as string);
    const userId = req.user!.userId;
    const { status } = req.body;

    const task = await prisma.task.findUnique({ where: { id: taskId } });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (task.requesterId !== userId && task.assignedWorkerId !== userId) {
      return res.status(403).json({ message: "Unauthorized to update task status" });
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: { status },
    });

    return res.status(200).json({
      message: `Task status updated to ${status}`,
      task: updatedTask,
    });
  } catch (error) {
    console.error("Update task status error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const rateTaskParticipant = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const taskId = parseInt(req.params.id as string);
    const raterId = req.user!.userId;
    const { score, comment } = req.body;

    if (!score || score < 1 || score > 5) {
      return res.status(400).json({ message: "Rating score must be between 1 and 5" });
    }

    const task = await prisma.task.findUnique({ where: { id: taskId } });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (task.status !== "COMPLETED") {
      return res.status(400).json({ message: "Ratings can only be submitted after task completion" });
    }

    let rateeId: number;
    if (raterId === task.requesterId) {
      if (!task.assignedWorkerId) {
        return res.status(400).json({ message: "No worker assigned to rate" });
      }
      rateeId = task.assignedWorkerId;
    } else if (raterId === task.assignedWorkerId) {
      rateeId = task.requesterId;
    } else {
      return res.status(403).json({ message: "Only task participants can leave a rating" });
    }

    // 1-Day (24h) rating timing rule enforcement
    const now = new Date();
    const completionTime = new Date(task.updatedAt);
    const diffHours = (now.getTime() - completionTime.getTime()) / (1000 * 60 * 60);

    if (diffHours > 24) {
      return res.status(400).json({ message: "The 1-day rating window for this completed task has expired." });
    }

    const rating = await prisma.rating.create({
      data: {
        taskId,
        raterId,
        rateeId,
        score: parseInt(score),
        comment,
      },
    });

    // Update aggregate rating for ratee
    await prisma.user.update({
      where: { id: rateeId },
      data: {
        ratingSum: { increment: parseInt(score) },
        ratingCount: { increment: 1 },
      },
    });

    return res.status(201).json({
      message: "Rating submitted successfully",
      rating,
    });
  } catch (error: any) {
    if (error.code === "P2002") {
      return res.status(400).json({ message: "You have already rated this task" });
    }
    console.error("Rate task participant error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
