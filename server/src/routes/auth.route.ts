import express from "express";
import {
  login,
  logout,
  refresh,
  searchUsers,
  signUp,
  updateProfile,
} from "../controllers/auth.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = express.Router();

router.post("/login", login);
router.post("/sign-up", signUp);
router.post("/logout", authMiddleware, logout);
router.get("/refresh", refresh);
router.put("/update-profile", authMiddleware, updateProfile);
// Search for users to add as friends
router.get("/search/:searchQuery", authMiddleware, searchUsers);
export default router;
