import { Request, Response, NextFunction } from "express";
import prisma from "../lib/prisma";

type FeatureKey =
  | "taskBoardEnabled"
  | "teamMatchEnabled";

export const checkFeature = (featureKey: FeatureKey) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      let settings = await prisma.featureSetting.findUnique({
        where: { id: 1 },
      });

      if (!settings) {
        settings = await prisma.featureSetting.create({
          data: { id: 1 },
        });
      }

      if (!settings[featureKey]) {
        return res.status(403).json({
          message: "This feature is currently disabled by administration.",
        });
      }

      next();
    } catch (error) {
      console.error("Feature check middleware error:", error);
      next();
    }
  };
};
