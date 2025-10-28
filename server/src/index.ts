import express, { type Express } from "express";
import dotenv from "dotenv";
import cors from "cors";
import { type CorsOptions } from "cors";
import cookieParser from "cookie-parser";
import { connectDB } from "./config/db.config";
import { authRoute, friendRoute, messageRoute } from "./routes";

connectDB();
import { app, server } from "./sockets/chat.socket";

dotenv.config();

// CORS Configuration
const corsOptions: CorsOptions = {
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.get("/", (req, res) => {
  res.json({ message: "Welcome to chat-app" });
});

app.use("/api/auth", authRoute);
app.use("/api/message", messageRoute);
app.use("/api/friend", friendRoute);

// Start Server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
