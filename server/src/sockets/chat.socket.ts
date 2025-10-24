import { Server } from "socket.io";
import http from "http";
import express from "express";
import { getEnvVariable } from "../utils/helper.util";

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: getEnvVariable("CLIENT_URL") || "http://localhost:5173",
  },
});

// used to store online users
const userSocketMap: Record<string, string> = {}; //userId: socketId

export function getRecieverSocketId(userId: string) {
  return userSocketMap[userId];
}

io.on("connection", (socket) => {
  console.log("a user is connected", socket.id);
  const userId = socket.handshake.query.userId as string;
  if (userId) {
    userSocketMap[userId] = socket.id;
  }
  io.emit("getOnlineUsers", Object.keys(userSocketMap));
  socket.on("disconnect", () => {
    console.log(`a user disconnected`);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };
