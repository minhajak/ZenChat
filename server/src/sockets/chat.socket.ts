import { Server } from "socket.io";
import http from "http";
import express from "express";
import { getEnvVariable } from "../utils/helper.util";
import { User } from "../models/user.model";
import { Friend } from "../models/friend.model";
import { friendStatus } from "../types/friend.type";

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

// Helper function to get user's accepted friends list
async function getUserFriends(userId: string): Promise<string[]> {
  try {
    const friendships = await Friend.find({
      $or: [
        { requester: userId, status: friendStatus.ACCEPTED },
        { recipient: userId, status: friendStatus.ACCEPTED },
      ],
    }).lean();

    // Extract friend IDs (either requester or recipient, whichever is not the current user)
    const friendIds = friendships.map((friendship) => {
      if (friendship.requester.toString() === userId) {
        return friendship.recipient.toString();
      }
      return friendship.requester.toString();
    });

    return friendIds;
  } catch (error) {
    console.error("Error fetching friends:", error);
    return [];
  }
}

// Helper function to emit online friends to a specific user
async function emitOnlineFriendsToUser(socket: any, userId: string) {
  const friends = await getUserFriends(userId);
  const onlineFriends = friends.filter((friendId) => userSocketMap[friendId]);
  socket.emit("getOnlineUsers", onlineFriends);
}

// Helper function to notify friends when user goes online/offline
async function notifyFriendsAboutStatus(userId: string) {
  const friends = await getUserFriends(userId);

  for (const friendId of friends) {
    const friendSocketId = userSocketMap[friendId];
    if (friendSocketId) {
      // Send updated online friends list to each online friend
      const friendSocket = io.sockets.sockets.get(friendSocketId);
      if (friendSocket) {
        await emitOnlineFriendsToUser(friendSocket, friendId);
      }
    }
  }
}

io.on("connection", async (socket) => {
  console.log("a user is connected", socket.id);
  const userId = socket.handshake.query.userId as string;

  if (userId) {
    userSocketMap[userId] = socket.id;
    await User.findByIdAndUpdate(userId, { lastSeen: null }).catch((err) =>
      console.log("error here ......", err)
    );

    // Send this user their online friends
    await emitOnlineFriendsToUser(socket, userId);

    // Notify this user's friends that they came online
    await notifyFriendsAboutStatus(userId);
  }

  socket.on("disconnect", async () => {
    console.log(`a user disconnected`, socket.id);

    if (userId) {
      await User.findByIdAndUpdate(userId, { lastSeen: new Date() }).catch(
        (err) => console.log("error here ......", err)
      );

      // Notify friends about offline status BEFORE removing from map
      await notifyFriendsAboutStatus(userId);

      delete userSocketMap[userId];
    }
  });
});

export { io, app, server };
