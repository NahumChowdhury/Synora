import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../types/auth";

export const requireAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user || req.user.role !== "ADMIN") {
    return res.status(403).json({
      message: "Admin permission required to perform this action.",
    });
  }

  next();
};
