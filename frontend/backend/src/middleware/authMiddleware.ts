import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthenticatedRequest } from "../types/auth";
import prisma from "../lib/prisma";
import { readCookie } from "../utils/cookies";

interface JwtPayload {
  userId: number;
  email: string;
  role?: "USER" | "ADMIN";
}

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  const bearer = req.headers.authorization?.startsWith("Bearer ") ? req.headers.authorization.slice(7) : undefined;
  const token = readCookie(req.headers.cookie, "synora_session") || bearer;
  if (!token) return res.status(401).json({ message: "Authentication required" });

  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) return res.status(503).json({ message: "Authentication is not configured" });

  try {
    const decoded = jwt.verify(token, secret) as JwtPayload;
    if (!Number.isInteger(decoded.userId) || !decoded.email) {
      return res.status(401).json({ message: "Invalid session" });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { email: true, isBanned: true, role: true },
    });
    if (!user) return res.status(401).json({ message: "User account no longer exists" });
    if (user.isBanned) return res.status(403).json({ message: "Your account has been restricted. Please contact administration." });

    (req as AuthenticatedRequest).user = {
      userId: decoded.userId,
      email: user.email,
      role: user.role,
    };
    return next();
  } catch {
    return res.status(401).json({ message: "Session expired. Please login again." });
  }
};
