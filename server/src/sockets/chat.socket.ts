import { Server } from "socket.io";
import http from "http";
import express from "express";
import { getEnvVariable } from "../utils/helper.util";
import { User } from "../models/user.model";

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: getEnvVariable("CLIENT_URL") || "http://localhost:5173",
  },
});

// used to store online users
export const userSocketMap: Record<string, string> = {}; //userId: socketId

export function getRecieverSocketId(userId: string) {
  return userSocketMap[userId];
}

io.on("connection", (socket) => {
  console.log("a user is connected", socket.id);
  const userId = socket.handshake.query.userId as string;
  if (userId) {
    userSocketMap[userId] = socket.id;
    User.findByIdAndUpdate(userId,{lastSeen:null}).catch(console.log)
  }
  io.emit("getOnlineUsers", Object.keys(userSocketMap));
  socket.on("disconnect", () => {
    console.log(`a user disconnected`);
    User.findByIdAndUpdate(userId, { lastSeen: new Date() }).catch(console.error)
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };
