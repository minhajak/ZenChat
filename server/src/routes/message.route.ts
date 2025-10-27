import express from "express";
import { authMiddleware, updateLastSeen } from "../middlewares/auth.middleware";
import {
  deleteConversation,
  getMessages,
  getUsersForSidebar,
  markMessagesAsSeen,
  sendMessages,
} from "../controllers/message.controller";

const router = express.Router();

router.use(authMiddleware, updateLastSeen);
router.get("/users", getUsersForSidebar);
router.get("/:id", getMessages);
router.post("/send/:id", sendMessages);
router.put("/mark-seen/:id", markMessagesAsSeen);

router.delete("/conversation/:receiverId", deleteConversation);

export default router;
