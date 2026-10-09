import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma";
import { AuthenticatedRequest } from "../types/auth";
import { verifyGoogleIdToken } from "../utils/googleIdentity";

const DIU_DOMAIN = "diu.edu.bd";
const SESSION_COOKIE = "synora_session";

function cookieOptions() {
  const sameSite = process.env.COOKIE_SAME_SITE === "none" ? "none" : "lax";
  const secure = process.env.NODE_ENV === "production" || sameSite === "none";
  return { httpOnly: true, secure, sameSite: sameSite as "lax" | "none", path: "/" as const };
}

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) throw new Error("JWT_SECRET must be configured with at least 32 characters");
  return secret;
}

function issueSession(res: Response, user: { id: number; email: string; role: string }) {
  const token = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    getJwtSecret(),
    { expiresIn: "12h" }
  );

  res.cookie(SESSION_COOKIE, token, {
    ...cookieOptions(),
    maxAge: 12 * 60 * 60 * 1000,
  });
}

export const googleLogin = async (req: Request, res: Response) => {
  try {
    const credential = typeof req.body?.credential === "string" ? req.body.credential : "";
    const clientId = process.env.GOOGLE_CLIENT_ID;

    if (!credential) return res.status(400).json({ message: "Google credential is required." });
    if (!clientId) return res.status(503).json({ message: "Google login is not configured on this server." });

    const payload = await verifyGoogleIdToken(credential, clientId);

    const email = payload.email.trim().toLowerCase();
    const domain = email.split("@")[1];
    if (domain !== DIU_DOMAIN) {
      return res.status(403).json({ message: "Only verified @diu.edu.bd Google accounts can use Synora." });
    }

    // For Workspace accounts Google may provide `hd`. Email-domain verification is still
    // required because the login identity itself is cryptographically verified by Google.
    if (payload.hd && payload.hd.toLowerCase() !== DIU_DOMAIN) {
      return res.status(403).json({ message: "This Google Workspace account is not a DIU account." });
    }

    const existingByGoogle = await prisma.user.findUnique({ where: { googleSub: payload.sub }, include: { profile: true } });
    const existingByEmail = await prisma.user.findUnique({ where: { email }, include: { profile: true } });

    if (existingByGoogle && existingByGoogle.email !== email) {
      return res.status(409).json({ message: "This Google identity is already linked to another Synora account." });
    }

    let user = existingByGoogle || existingByEmail;
    if (user?.isBanned) {
      return res.status(403).json({ message: "Your account has been restricted. Please contact administration." });
    }

    if (user) {
      if (user.googleSub && user.googleSub !== payload.sub) {
        return res.status(409).json({ message: "This DIU email is already linked to a different Google identity." });
      }
      user = await prisma.user.update({
        where: { id: user.id },
        data: { googleSub: payload.sub, authProvider: "GOOGLE" },
        include: { profile: true },
      });
    } else {
      user = await prisma.user.create({
        data: {
          email,
          googleSub: payload.sub,
          authProvider: "GOOGLE",
          role: "USER",
          profile: { create: { fullName: payload.name || email.split("@")[0] } },
        },
        include: { profile: true },
      });
    }

    issueSession(res, user);
    return res.status(200).json({
      message: "Login successful",
      userId: user.id,
      email: user.email,
      role: user.role,
      profile: user.profile,
      profileComplete: Boolean(user.profile?.fullName && user.profile?.department && user.profile?.batch),
    });
  } catch (error) {
    console.error("Google login error:", error instanceof Error ? error.message : "Unknown error");
    return res.status(401).json({ message: "Google sign-in could not be verified. Please try again." });
  }
};

// Legacy password login is intentionally limited to ADMIN accounts so existing local admin
// access is not destroyed during the Google migration. Student accounts must use Google.
export const adminLogin = async (req: Request, res: Response) => {
  try {
    if (process.env.ALLOW_ADMIN_PASSWORD_LOGIN !== "true") {
      return res.status(404).json({ message: "Route not found" });
    }
    const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const password = typeof req.body?.password === "string" ? req.body.password : "";
    if (!email || !password) return res.status(400).json({ message: "Email and password are required." });

    const user = await prisma.user.findUnique({ where: { email }, include: { profile: true } });
    if (!user || user.role !== "ADMIN" || !user.passwordHash) {
      return res.status(401).json({ message: "Invalid administrator credentials." });
    }
    if (user.isBanned) return res.status(403).json({ message: "Account restricted." });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ message: "Invalid administrator credentials." });

    issueSession(res, user);
    return res.status(200).json({ message: "Login successful", userId: user.id, email: user.email, role: user.role, profile: user.profile });
  } catch (error) {
    console.error("Admin login error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const logout = async (_req: Request, res: Response) => {
  res.clearCookie(SESSION_COOKIE, cookieOptions());
  return res.status(200).json({ message: "Logged out" });
};

export const verify = async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  if (!authReq.user) return res.status(401).json({ message: "Unauthorized" });

  const user = await prisma.user.findUnique({ where: { id: authReq.user.userId }, include: { profile: true } });
  if (!user) return res.status(401).json({ message: "User not found" });
  if (user.isBanned) return res.status(403).json({ message: "Account banned" });

  return res.status(200).json({
    message: "Session valid",
    id: user.id,
    userId: user.id,
    email: user.email,
    role: user.role,
    rating: user.ratingCount > 0 ? (user.ratingSum / user.ratingCount).toFixed(1) : "New",
    profile: user.profile,
    profileComplete: Boolean(user.profile?.fullName && user.profile?.department && user.profile?.batch),
  });
};
