import { Request, Response } from "express";
import { User } from "../models/user.model";
import mongoose from "mongoose";
import { Message } from "../models/message.model";
import cloudinary from "../config/cloudinary.config";
import { getRecieverSocketId, io } from "../sockets/chat.socket";
import { Friend } from "../models/friend.model";
import { friendStatus } from "../types/friend.type";

export const getUsersForSidebar = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const loggedUserId = req.user?.userId;

    if (!loggedUserId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    // Get accepted friendships for the logged-in user
    const acceptedFriendships = await Friend.find({
      $or: [
        { requester: loggedUserId, status: friendStatus.ACCEPTED },
        { recipient: loggedUserId, status: friendStatus.ACCEPTED },
      ],
    });

    // Extract the IDs of friend users
    const otherUserIds = acceptedFriendships.map((friendship) =>
      friendship.requester.equals(loggedUserId)
        ? friendship.recipient
        : friendship.requester
    );

    if (otherUserIds.length === 0) {
      res.status(200).json({ users: [] });
      return;
    }

    // Get friend users
    const users = await User.find({
      _id: { $in: otherUserIds },
    }).select("-password -role -createdAt");

    // Get the latest message and unseen count for each conversation
    const conversationData = await Message.aggregate([
      {
        $match: {
          $or: [
            { senderId: new mongoose.Types.ObjectId(loggedUserId) },
            { receiverId: new mongoose.Types.ObjectId(loggedUserId) },
          ],
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$senderId", new mongoose.Types.ObjectId(loggedUserId)] },
              "$receiverId",
              "$senderId",
            ],
          },
          latestMessage: { $first: "$$ROOT" },
          unseenCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    {
                      $eq: [
                        "$receiverId",
                        new mongoose.Types.ObjectId(loggedUserId),
                      ],
                    },
                    { $eq: ["$seen", false] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);

    // Create a map of userId to conversation data
    const conversationMap = new Map(
      conversationData.map((c) => [
        c._id.toString(),
        {
          latestMessage: c.latestMessage,
          unseenCount: c.unseenCount,
        },
      ])
    );

    // Map users with their latest message and unseen count
    const filteredUsers = users.map((user) => {
      const userId = user.id.toString();
      const conversation = conversationMap.get(userId);

      return {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        profileImage: user.profileImage,
        lastSeen: user.lastSeen,
        latestMessage: conversation?.latestMessage || null,
        unseenCount: conversation?.unseenCount || 0,
      };
    });

    // Sort by latest message timestamp (most recent first)
    filteredUsers.sort((a, b) => {
      const timeA = a.latestMessage?.createdAt || 0;
      const timeB = b.latestMessage?.createdAt || 0;
      return new Date(timeB).getTime() - new Date(timeA).getTime();
    });

    res.status(200).json({ users: filteredUsers });
  } catch (error) {
    console.error("Error in getUsersForSidebar:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const getMessages = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id: userTochatId } = req.params;
    const senderId = new mongoose.Types.ObjectId(req.user?.userId);
    const messages = await Message.find({
      $or: [
        { senderId: senderId, receiverId: userTochatId },
        { senderId: userTochatId, receiverId: senderId },
      ],
    });

    res.status(200).json({ messages: messages });
  } catch (error) {
    res.status(500).json({ message: "internal server error", error: error });
  }
};
export const sendMessages = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user?.userId;
    // Get image URL from Cloudinary upload (if file was uploaded)
    const imageUrl = req.file ? (req.file as any).path : undefined;
    console.log(imageUrl)
    console.log(text)
    const newMessage = new Message({
      senderId: senderId,
      receiverId: receiverId,
      text: text,
      image: imageUrl,
    });
    await newMessage.save();

    const recieverSocketId = getRecieverSocketId(receiverId);
    if (recieverSocketId) {
      io.to(recieverSocketId).emit("newMessage", newMessage);
    }

    res.status(200).json({ message: "message sended", messages: newMessage });
  } catch (error) {
    res.status(500).json({ message: "internal server error", error: error });
  }
};

export const markMessagesAsSeen = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    // Mark all messages from the other user (id) to logged-in user as seen
    const result = await Message.updateMany(
      {
        senderId: id,
        receiverId: userId,
        seen: false,
      },
      {
        $set: { seen: true },
      }
    );
    res.status(200).json({
      message: "Messages marked as seen",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Error in markMessagesAsSeen:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteConversation = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { receiverId } = req.params;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    if (!receiverId) {
      res.status(400).json({ message: "Receiver ID is required" });
      return;
    }

    // Delete all messages between the two users
    const result = await Message.deleteMany({
      $or: [
        { senderId: userId, receiverId: receiverId },
        { senderId: receiverId, receiverId: userId },
      ],
    });

    console.log(`Deleted ${result.deletedCount} messages`);

    res.status(200).json({
      message: "Conversation deleted successfully",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Error in deleteConversation:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
