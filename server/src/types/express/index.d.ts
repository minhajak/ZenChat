import  "express";
import mongoose from "mongoose";

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
