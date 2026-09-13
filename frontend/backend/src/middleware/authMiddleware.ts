import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthenticatedRequest } from "../types/auth";
import prisma from "../lib/prisma";

interface JwtPayload {
  userId: number;
  email: string;
  role?: "USER" | "ADMIN";
}

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Access token required",
    });
  }

  const token = authHeader.slice(7);

  if (!token) {
    return res.status(401).json({
      message: "Access token required",
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload;

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { isBanned: true, role: true },
    });

    if (!user) {
      return res.status(401).json({ message: "User account no longer exists" });
    }

    if (user.isBanned) {
      return res.status(403).json({
        message: "Your account has been restricted. Please contact administration.",
      });
    }

    (req as AuthenticatedRequest).user = {
      userId: decoded.userId,
      email: decoded.email,
      role: user.role || decoded.role || "USER",
    };

    next();
  } catch {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};
