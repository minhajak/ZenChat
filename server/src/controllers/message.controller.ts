import { Request, Response } from "express";
import { User } from "../models/user.model";
import mongoose from "mongoose";
import { Message } from "../models/message.model";
import cloudinary from "../config/cloudinary.config";
import { getRecieverSocketId, io } from "../sockets/chat.socket";

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

    // Get all users except the logged-in user
    const users = await User.find({
      _id: { $ne: loggedUserId },
    }).select("-password -role -createdAt");

    // Get the latest message for each conversation
    const latestMessages = await Message.aggregate([
      {
        $match: {
          $or: [
            { senderId: new mongoose.Types.ObjectId(loggedUserId) },
            { receiverId: new mongoose.Types.ObjectId(loggedUserId) }
          ]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$senderId", new mongoose.Types.ObjectId(loggedUserId)] },
              "$receiverId",
              "$senderId"
            ]
          },
          latestMessage: { $first: "$$ROOT" }
        }
      }
    ]);


    // Create a map of userId to latest message
    const messageMap = new Map(
      latestMessages.map(m => [m._id.toString(), m.latestMessage])
    );


    // Map users with their latest message info
    const filteredUsers = users.map((user) => {
      const userId = user.id.toString();
      
      return {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        profileImage: user.profileImage,
        latestMessage: messageMap.get(userId) || null,
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

    let imageUrl;
    if (image) {
      // Upload base64 image to cloudinary
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }
    const newMessage = new Message({
      senderId: senderId,
      receiverId: receiverId,
      text,
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
