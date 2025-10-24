    import express from "express";
    import { authMiddleware } from "../middlewares/auth.middleware";
    import {
    getMessages,
    getUsersForSidebar,
    sendMessages,
    } from "../controllers/message.controller";

    const router = express.Router();

    router.get("/users", authMiddleware, getUsersForSidebar);
    router.get("/:id", authMiddleware, getMessages);
    router.post(
    "/send/:id",
    authMiddleware,
    sendMessages
    );

    export default router;
