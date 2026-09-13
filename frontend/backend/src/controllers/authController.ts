import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma";
import { AuthenticatedRequest } from "../types/auth";

export const register = async (
  req: Request,
  res: Response
) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Strict DIU email restriction rule
    if (!normalizedEmail.endsWith("@diu.edu.bd")) {
      return res.status(400).json({
        message: "Only @diu.edu.bd email addresses are accepted.",
      });
    }

    console.log("Register attempt for:", normalizedEmail);

    const existingUser = await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists with this university email",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Create User and Profile
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        role: "USER",
        profile: {
          create: {
            fullName: normalizedEmail.split("@")[0],
          },
        },
      },
      include: {
        profile: true,
      },
    });

    console.log("User registered:", user.id);

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "7d",
      }
    );

    return res.status(201).json({
      message: "Registration successful",
      token,
      userId: user.id,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    console.error("Register error:", error);

    return res.status(500).json({
      message: "Server Error",
    });
  }
};

export const login = async (
  req: Request,
  res: Response
) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
      include: {
        profile: true,
      },
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid DIU email or password.",
      });
    }

    if (user.isBanned) {
      return res.status(403).json({
        message: "Your account has been restricted. Please contact administration.",
      });
    }

    const validPassword = await bcrypt.compare(
      password,
      user.passwordHash
    );

    if (!validPassword) {
      return res.status(400).json({
        message: "Invalid DIU email or password.",
      });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "7d",
      }
    );

    return res.status(200).json({
      message: "Login successful",
      token,
      userId: user.id,
      email: user.email,
      role: user.role,
      profile: user.profile,
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      message: "Server Error",
    });
  }
};

export const verify = async (
  req: Request,
  res: Response
) => {
  const authReq = req as AuthenticatedRequest;
  if (!authReq.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const user = await prisma.user.findUnique({
    where: { id: authReq.user.userId },
    include: { profile: true },
  });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if (user.isBanned) {
    return res.status(403).json({ message: "Account banned" });
  }

  return res.status(200).json({
    message: "Token valid",
    userId: user.id,
    email: user.email,
    role: user.role,
    rating: user.ratingCount > 0 ? (user.ratingSum / user.ratingCount).toFixed(1) : "New",
    profile: user.profile,
  });
};
