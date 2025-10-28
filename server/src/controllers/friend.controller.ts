import { Request, Response } from "express";
import { User } from "../models/user.model";

import mongoose from "mongoose";
import { getRecieverSocketId, io } from "../sockets/chat.socket";
import { Friend } from "../models/friend.model";
import { friendStatus } from "../types/friend.type";

export const addFriendRequest = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const loggedUserId = req.user?.userId;
    const { receiverId } = req.params;

    // Validation
    if (!loggedUserId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    if (!receiverId) {
      res.status(400).json({ message: "Receiver ID is required" });
      return;
    }

    if (loggedUserId.toString() === receiverId) {
      res
        .status(400)
        .json({ message: "Cannot send friend request to yourself" });
      return;
    }

    // Check if receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Check if friendship already exists (in either direction)
    const existingFriendship = await Friend.findOne({
      $or: [
        { requester: loggedUserId, recipient: receiverId },
        { requester: receiverId, recipient: loggedUserId },
      ],
    });

    if (existingFriendship) {
      // Handle different statuses
      if (existingFriendship.status === friendStatus.ACCEPTED) {
        res.status(400).json({ message: "You are already friends" });
        return;
      }

      if (existingFriendship.status === friendStatus.PENDING) {
        const isSentByMe =
          existingFriendship.requester.toString() === loggedUserId.toString();

        if (isSentByMe) {
          res.status(400).json({ message: "Friend request already sent" });
          return;
        } else {
          res.status(400).json({
            message:
              "This user has already sent you a friend request. Please check your requests.",
          });
          return;
        }
      }

      if (existingFriendship.status === friendStatus.BLOCKED) {
        const blockedByMe =
          existingFriendship.requester.toString() === loggedUserId.toString();

        if (blockedByMe) {
          res.status(400).json({
            message: "You have blocked this user. Unblock them first.",
          });
          return;
        } else {
          res
            .status(400)
            .json({ message: "Cannot send friend request to this user" });
          return;
        }
      }

      if (existingFriendship.status === friendStatus.DECLINED) {
        // Update existing friendship
        existingFriendship.requester = new mongoose.Types.ObjectId(
          loggedUserId
        );
        existingFriendship.recipient = new mongoose.Types.ObjectId(receiverId);
        existingFriendship.status = friendStatus.PENDING;
        existingFriendship.createdAt = new Date(); // Update timestamp
        await existingFriendship.save();

        // Populate requester data
        await existingFriendship.populate(
          "requester",
          "_id fullName email profileImage"
        );

        // Get requester info for socket emission
        const requester = await User.findById(loggedUserId).select(
          "_id fullName email profileImage"
        );

        // Emit to receiver via socket
        const recipientSocketId = getRecieverSocketId(receiverId);
        if (recipientSocketId && requester) {
          io.to(recipientSocketId).emit("newInvites", {
            id: existingFriendship._id.toString(),
            requester: {
              id: requester.id.toString(),
              fullName: requester.fullName,
              email: requester.email,
              profileImage: requester.profileImage,
            },
            status: existingFriendship.status,
            createdAt: existingFriendship.createdAt,
          });
        }

        res.status(200).json({
          message: "Friend request sent successfully",
          friendRequest: existingFriendship,
        });
        return;
      }
    }

    // Create new friend request
    const newFriendRequest = await Friend.create({
      requester: loggedUserId,
      recipient: receiverId,
      status: friendStatus.PENDING,
    });

    // Populate requester data
    await newFriendRequest.populate(
      "requester",
      "_id fullName email profileImage"
    );

    // Get requester info for socket emission
    const requester = await User.findById(loggedUserId).select(
      "_id fullName email profileImage"
    );

    // Emit to receiver via socket
    const recipientSocketId = getRecieverSocketId(receiverId);
    if (recipientSocketId && requester) {
      io.to(recipientSocketId).emit("newInvites", {
        id: newFriendRequest._id.toString(),
        requester: {
          id: requester.id.toString(),
          fullName: requester.fullName,
          email: requester.email,
          profileImage: requester.profileImage,
        },
        status: newFriendRequest.status,
        createdAt: newFriendRequest.createdAt,
      });
    }

    res.status(201).json({
      message: "Friend request sent successfully",
      friendRequest: newFriendRequest,
    });
  } catch (error) {
    console.error("Error in addFriendRequest:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const acceptFriendRequest = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const loggedUserId = req.user?.userId;
    const { senderId } = req.params;

    // Validation
    if (!loggedUserId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    if (!senderId) {
      res.status(400).json({ message: "Sender ID is required" });
      return;
    }

    // Find the friend request
    const friendRequest = await Friend.findOne({
      requester: senderId,
      recipient: loggedUserId,
      status: friendStatus.PENDING,
    });

    if (!friendRequest) {
      res.status(404).json({ message: "Friend request not found" });
      return;
    }

    // Verify the logged-in user is the recipient
    if (friendRequest.recipient.toString() !== loggedUserId.toString()) {
      res.status(403).json({
        message: "Not authorized to accept this request",
      });
      return;
    }

    // Update status to accepted
    friendRequest.status = friendStatus.ACCEPTED;
    await friendRequest.save();

    // Populate user details for response
    await friendRequest.populate([
      { path: "requester", select: "fullName email profileImage" },
      { path: "recipient", select: "fullName email profileImage" },
    ]);

    // Get recipient details for socket notification
    const recipient = await User.findById(loggedUserId);

    // Send socket notification to the requester
    const requesterSocketId = getRecieverSocketId(
      friendRequest.requester._id.toString()
    );
    if (requesterSocketId) {
      io.to(requesterSocketId).emit("friendRequestAccepted", {
        acceptedBy: {
          id: loggedUserId,
          fullName: recipient?.fullName,
          email: recipient?.email,
          profileImage: recipient?.profileImage,
        },
        friendship: friendRequest,
      });
    }

    res.status(200).json({
      message: "Friend request accepted",
      friendship: friendRequest,
    });
  } catch (error) {
    console.error("Error in acceptFriendRequest:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getInvites = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId; // Assuming userId is string
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    // Parse pagination parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 5;
    const skip = (page - 1) * limit;

    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 100) {
      res.status(400).json({
        message:
          "Invalid pagination parameters. Page must be >= 1 and limit between 1-100",
      });
      return;
    }

    const objectId = new mongoose.Types.ObjectId(userId);

    // Get total count for pagination metadata
    const totalCount = await Friend.countDocuments({
      recipient: objectId,
      status: friendStatus.PENDING,
    });

    // Fetch paginated invites
    const invites = await Friend.find({
      recipient: objectId,
      status: friendStatus.PENDING,
    })
      .select("_id requester status createdAt")
      .sort({ createdAt: -1 }) // Most recent first
      .skip(skip)
      .limit(limit);

    if (invites.length === 0) {
      res.status(200).json({
        invites: [],
        pagination: {
          currentPage: page,
          totalPages: 0,
          totalCount: 0,
          limit,
          hasNextPage: false,
          hasPrevPage: false,
        },
      });
      return;
    }

    const requesterIds = [
      ...new Set(invites.map((invite) => invite.requester.toString())),
    ];
    const users = await User.find({
      _id: { $in: requesterIds.map((id) => new mongoose.Types.ObjectId(id)) },
    }).select("_id fullName email profileImage");

    const userMap = new Map(users.map((user) => [user.id.toString(), user]));

    // Transform to include only necessary fields for response
    const formattedInvites = invites.map((invite) => {
      const requesterUser = userMap.get(invite.requester.toString());
      return {
        id: invite._id.toString(),
        requester: requesterUser
          ? {
              id: requesterUser.id.toString(),
              fullName: requesterUser.fullName,
              email: requesterUser.email,
              profileImage: requesterUser.profileImage,
            }
          : null,
        status: invite.status,
        createdAt: invite.createdAt,
      };
    });

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.status(200).json({
      invites: formattedInvites,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit,
        hasNextPage,
        hasPrevPage,
      },
    });
  } catch (error) {
    console.error("Error in getInvites:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const rejectFriendRequest = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const loggedUserId = req.user?.userId;
    const { senderId } = req.params;

    // Validation
    if (!loggedUserId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    if (!senderId) {
      res.status(400).json({ message: "Sender ID is required" });
      return;
    }

    // Find the friend request
    const friendRequest = await Friend.findOne({
      requester: senderId,
      recipient: loggedUserId,
      status: friendStatus.PENDING,
    });
    console.log(friendRequest);

    if (!friendRequest) {
      res.status(404).json({ message: "Friend request not found" });
      return;
    }

    // Verify the logged-in user is the recipient
    if (friendRequest.recipient.toString() !== loggedUserId.toString()) {
      res.status(403).json({
        message: "Not authorized to reject this request",
      });
      return;
    }

    // Update status to declined
    friendRequest.status = friendStatus.DECLINED;
    await friendRequest.save();

    // Populate user details for response
    await friendRequest.populate([
      { path: "requester", select: "fullName email profileImage" },
      { path: "recipient", select: "fullName email profileImage" },
    ]);

    // Get recipient details for socket notification
    const recipient = await User.findById(loggedUserId);

    // Send socket notification to the requester
    const requesterSocketId = getRecieverSocketId(senderId);
    if (requesterSocketId) {
      io.to(requesterSocketId).emit("friendRequestDeclined", {
        declinedBy: {
          id: loggedUserId,
          fullName: recipient?.fullName,
          email: recipient?.email,
          profileImage: recipient?.profileImage,
        },
        friendship: friendRequest,
      });
    }

    res.status(200).json({
      message: "Friend request declined",
      friendship: friendRequest,
    });
  } catch (error) {
    console.error("Error in rejectFriendRequest:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getSuggestions = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 5;
    const skip = (page - 1) * limit;

    // Fetch existing friendships to exclude friends and pending requests
    const friendships = await Friend.find({
      $or: [
        {
          requester: userId,
          status: { $in: ["accepted", "pending", "declined"] },
        },
        {
          recipient: userId,
          status: { $in: ["accepted", "pending", "declined"] },
        },
      ],
    }).select("requester recipient");

    // Build excluded IDs (current user + friends + pending)
    const excludedIds = new Set([userId]);
    friendships.forEach((f) => {
      if (f.requester.toString() !== userId.toString()) {
        excludedIds.add(f.requester);
      }
      if (f.recipient.toString() !== userId.toString()) {
        excludedIds.add(f.recipient);
      }
    });

    // Get total count of potential suggestions
    const totalCount = await User.countDocuments({
      _id: { $nin: Array.from(excludedIds) },
    });

    // Fetch paginated suggestions (sorted by creation date descending for recency)
    const suggestions = await User.find({
      _id: { $nin: Array.from(excludedIds) },
    })
      .select("_id fullName email profileImage")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const filteredSuggestions = suggestions.map((suggestion) => {
      return {
        id: suggestion._id,
        fullName: suggestion.fullName,
        email: suggestion.email,
        profileImage: suggestion.profileImage,
      };
    });

    const totalPages = Math.ceil(totalCount / limit);

    res.status(200).json({
      suggestions: filteredSuggestions,
      page,
      limit,
      totalPages,
      totalCount,
    });
  } catch (error) {
    console.error("Error in getSuggestions:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
