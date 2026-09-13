import { Response } from "express";
import { AuthenticatedRequest } from "../types/auth";
import prisma from "../lib/prisma";

export const createTeamPost = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const authorId = req.user!.userId;
    const {
      title,
      category,
      subCategory,
      description,
      lookingFor,
      requiredSkills,
      peopleNeeded,
      deadline,
      department,
      preferredBatch,
      location,
      meetingPreference,
      experienceReq,
      contactInfo,
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: "Title and description are required" });
    }

    const post = await prisma.teamPost.create({
      data: {
        authorId,
        title,
        category: category || "ACADEMIC",
        subCategory: subCategory || null,
        description,
        lookingFor: lookingFor || null,
        requiredSkills: requiredSkills || null,
        peopleNeeded: peopleNeeded ? parseInt(peopleNeeded) : 1,
        deadline: deadline ? new Date(deadline) : null,
        department: department || null,
        preferredBatch: preferredBatch || null,
        location: location || null,
        meetingPreference: meetingPreference || null,
        experienceReq: experienceReq || null,
        contactInfo: contactInfo || req.user!.email,
        status: "OPEN",
      },
    });

    return res.status(201).json({
      message: "Team match opportunity published successfully",
      post,
    });
  } catch (error) {
    console.error("Create team post error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getTeamPosts = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { category, subCategory, department, preferredBatch, status, search } = req.query;
    const userId = req.user?.userId;

    const whereClause: any = {};

    if (status && status !== "ALL") {
      whereClause.status = status as string;
    } else if (!status) {
      whereClause.status = "OPEN";
    }

    if (category && category !== "ALL") {
      whereClause.category = category as any;
    }

    if (subCategory && subCategory !== "ALL") {
      whereClause.subCategory = subCategory as string;
    }

    if (department && department !== "ALL") {
      whereClause.department = { contains: department as string, mode: "insensitive" };
    }

    if (preferredBatch && preferredBatch !== "ALL") {
      whereClause.preferredBatch = preferredBatch as string;
    }

    if (search) {
      whereClause.OR = [
        { title: { contains: search as string, mode: "insensitive" } },
        { description: { contains: search as string, mode: "insensitive" } },
        { lookingFor: { contains: search as string, mode: "insensitive" } },
        { requiredSkills: { contains: search as string, mode: "insensitive" } },
      ];
    }

    const posts = await prisma.teamPost.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            profile: true,
            ratingSum: true,
            ratingCount: true,
          },
        },
        applications: {
          select: {
            id: true,
            applicantId: true,
            status: true,
          },
        },
      },
    });

    const formattedPosts = posts.map((post) => {
      const userApp = userId ? post.applications.find((a) => a.applicantId === userId) : null;
      return {
        ...post,
        authorName: post.author.profile?.fullName || "DIU Student",
        authorDepartment: post.author.profile?.department || "DIU Department",
        authorBatch: post.author.profile?.batch || "Batch N/A",
        authorEmail: post.author.email,
        authorSkills: post.author.profile?.skills,
        authorBio: post.author.profile?.bio,
        authorRating:
          post.author.ratingCount > 0
            ? (post.author.ratingSum / post.author.ratingCount).toFixed(1)
            : "New",
        applicantCount: post.applications.length,
        hasApplied: Boolean(userApp),
        myApplicationStatus: userApp ? userApp.status : null,
      };
    });

    return res.status(200).json(formattedPosts);
  } catch (error) {
    console.error("Get team posts error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getTeamPostById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const postId = parseInt(req.params.id as string);
    const userId = req.user!.userId;

    const post = await prisma.teamPost.findUnique({
      where: { id: postId },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            profile: true,
            ratingSum: true,
            ratingCount: true,
          },
        },
        applications: {
          include: {
            applicant: {
              select: {
                id: true,
                email: true,
                profile: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!post) {
      return res.status(404).json({ message: "Opportunity not found" });
    }

    const isAuthor = post.authorId === userId;
    const userApp = post.applications.find((a) => a.applicantId === userId);

    return res.status(200).json({
      ...post,
      authorName: post.author.profile?.fullName || "DIU Student",
      authorDepartment: post.author.profile?.department,
      authorBatch: post.author.profile?.batch,
      authorEmail: post.author.email,
      authorSkills: post.author.profile?.skills,
      authorBio: post.author.profile?.bio,
      authorRating:
        post.author.ratingCount > 0
          ? (post.author.ratingSum / post.author.ratingCount).toFixed(1)
          : "New",
      isAuthor,
      hasApplied: Boolean(userApp),
      myApplicationStatus: userApp ? userApp.status : null,
      applications: isAuthor
        ? post.applications.map((app) => ({
            id: app.id,
            applicantId: app.applicantId,
            applicantName: app.applicant.profile?.fullName || "DIU Student",
            applicantEmail: app.applicant.email,
            applicantDepartment: app.applicant.profile?.department,
            applicantBatch: app.applicant.profile?.batch,
            applicantSkills: app.applicant.profile?.skills,
            message: app.message,
            status: app.status,
            createdAt: app.createdAt,
          }))
        : [],
    });
  } catch (error) {
    console.error("Get team post by id error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const applyToTeamPost = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const postId = parseInt(req.params.id as string);
    const applicantId = req.user!.userId;
    const { message } = req.body;

    const post = await prisma.teamPost.findUnique({ where: { id: postId } });

    if (!post) {
      return res.status(404).json({ message: "Opportunity not found" });
    }

    if (post.status !== "OPEN") {
      return res.status(400).json({ message: "This opportunity is no longer open" });
    }

    if (post.authorId === applicantId) {
      return res.status(400).json({ message: "You cannot apply to your own opportunity" });
    }

    const existing = await prisma.teamApplication.findUnique({
      where: {
        teamPostId_applicantId: { teamPostId: postId, applicantId },
      },
    });

    if (existing) {
      return res.status(400).json({ message: "You have already expressed interest in this opportunity" });
    }

    const application = await prisma.teamApplication.create({
      data: {
        teamPostId: postId,
        applicantId,
        message,
        status: "PENDING",
      },
    });

    return res.status(201).json({
      message: "Application submitted successfully",
      application,
    });
  } catch (error) {
    console.error("Apply to team post error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const updateTeamApplicationStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const applicationId = parseInt(req.params.appId as string);
    const authorId = req.user!.userId;
    const { status } = req.body; // ACCEPTED or REJECTED

    if (!["ACCEPTED", "REJECTED"].includes(status)) {
      return res.status(400).json({ message: "Invalid application status" });
    }

    const app = await prisma.teamApplication.findUnique({
      where: { id: applicationId },
      include: { teamPost: true },
    });

    if (!app) {
      return res.status(404).json({ message: "Application not found" });
    }

    if (app.teamPost.authorId !== authorId) {
      return res.status(403).json({ message: "Only the opportunity creator can respond to applications" });
    }

    const updatedApp = await prisma.teamApplication.update({
      where: { id: applicationId },
      data: { status },
    });

    // If ACCEPTED, auto-create a Conversation between creator and applicant if none exists
    if (status === "ACCEPTED") {
      const u1 = Math.min(authorId, app.applicantId);
      const u2 = Math.max(authorId, app.applicantId);

      let conv = await prisma.conversation.findFirst({
        where: { user1Id: u1, user2Id: u2 },
      });

      if (!conv) {
        conv = await prisma.conversation.create({
          data: {
            user1Id: u1,
            user2Id: u2,
          },
        });
      }

      // Add a system welcome message
      await prisma.message.create({
        data: {
          conversationId: conv.id,
          senderId: authorId,
          content: `Hi! I accepted your interest in my opportunity: "${app.teamPost.title}". Let's discuss details!`,
        },
      });
    }

    return res.status(200).json({
      message: `Application ${status.toLowerCase()} successfully`,
      application: updatedApp,
    });
  } catch (error) {
    console.error("Update team application status error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const updateTeamPostStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const postId = parseInt(req.params.id as string);
    const userId = req.user!.userId;
    const { status } = req.body; // OPEN or CLOSED

    if (!["OPEN", "CLOSED"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const post = await prisma.teamPost.findUnique({ where: { id: postId } });

    if (!post) {
      return res.status(404).json({ message: "Opportunity not found" });
    }

    if (post.authorId !== userId && req.user!.role !== "ADMIN") {
      return res.status(403).json({ message: "Unauthorized to update status" });
    }

    const updated = await prisma.teamPost.update({
      where: { id: postId },
      data: { status },
    });

    return res.status(200).json({
      message: `Opportunity is now ${status}`,
      post: updated,
    });
  } catch (error) {
    console.error("Update team post status error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const deleteTeamPost = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const postId = parseInt(req.params.id as string);
    const userId = req.user!.userId;
    const userRole = req.user!.role;

    const post = await prisma.teamPost.findUnique({ where: { id: postId } });

    if (!post) {
      return res.status(404).json({ message: "Opportunity not found" });
    }

    if (post.authorId !== userId && userRole !== "ADMIN") {
      return res.status(403).json({ message: "Unauthorized to delete this post" });
    }

    await prisma.teamPost.delete({ where: { id: postId } });

    return res.status(200).json({ message: "Opportunity deleted successfully" });
  } catch (error) {
    console.error("Delete team post error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
