import type { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../utils/jwt.utls";
import { User } from "../models/user.model";

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).json({ message: "Unauthorized: No token provided" });
    return;
  }

  // Extract token from header
  const token = authHeader.split(" ")[1];

  if (!token) {
    res.status(403).json({ message: "Unauthorized" });
    return;
  }

  // Verify JWT token
  const { role, userId } = verifyAccessToken(token);

  if (!userId) {
    res.status(403).json({ message: "Unauthorized" });
    return;
  }

  // Set data into the req
  (req as any).user = { role, userId };
  next();
};

export const updateLastSeen = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (req.user?.userId) {
      // Update last seen without blocking the request
      User.findByIdAndUpdate(
        req.user.userId,
        { lastSeen: new Date() },
        { new: false }
      ).catch((err) => console.error("Error updating last seen:", err));
    }
    next();
  } catch (error) {
    next();
  }
};