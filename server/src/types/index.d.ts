import "express";
import mongoose from "mongoose"

declare module 'cookie-parser';
declare module 'streamifier';
declare module 'multer';

declare global {
  namespace Express {
    interface User {
      role: string;
      userId: mongoose.Types.ObjectId;
    }

    interface Request {
      user?: User;
    }
  }
}