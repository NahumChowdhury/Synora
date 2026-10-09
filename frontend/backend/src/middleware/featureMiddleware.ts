import { Request, Response, NextFunction } from "express";
import prisma from "../lib/prisma";

type FeatureKey = "taskBoardEnabled";

export const checkFeature = (featureKey: FeatureKey) => {
  return async (_req: Request, res: Response, next: NextFunction) => {
    try {
      let settings = await prisma.featureSetting.findUnique({ where: { id: 1 } });
      if (!settings) settings = await prisma.featureSetting.create({ data: { id: 1 } });
      if (!settings[featureKey]) {
        return res.status(403).json({ message: "This feature is currently disabled by administration." });
      }
      return next();
    } catch (error) {
      console.error("Feature check middleware error:", error);
      return res.status(503).json({ message: "Feature availability could not be verified. Please try again." });
    }
  };
};
