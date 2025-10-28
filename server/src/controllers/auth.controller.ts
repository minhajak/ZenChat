import type { Response, Request } from "express";
import { sanitizeInput } from "../utils/sanitize.util";
import {
  userLoginValidationSchema,
  UserType,
  userValidationSchema,
} from "../validations/user.validation";
import { User } from "../models/user.model";
import {
  generateAccessToken,
  generateTokens,
  verifyRefreshToken,
} from "../utils/jwt.utls";
import { userEnum } from "../types/user.type";
import { validateInpuWithZod } from "../utils/helper.util";
import mongoose from "mongoose";
import cloudinary from "../config/cloudinary.config";
import { Friend } from "../models/friend.model";


export const signUp = async (req: Request, res: Response): Promise<void> => {
  try {
    const data: Partial<UserType> = sanitizeInput(req.body);
    validateInpuWithZod(userValidationSchema, data, res);

    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      res.status(409).json({ message: "Email already exists" });
      return;
    }

    const newUser = await User.create({
      email: data.email,
      fullName: data.fullName,
      password: data.password,
      role: userEnum.USER,
    });

    const { accessToken, refreshToken } = generateTokens({
      userId: newUser.id,
      role: newUser.role,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({
      message: "User created successfully",
      accessToken,
      user: {
        id: newUser._id,
        email: newUser.email,
        fullName: newUser.fullName,
        profileImage: newUser.profileImage,
        role: newUser.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "internal server error", error: error });
  }
};
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const data: Partial<UserType> = sanitizeInput(req.body);
    validateInpuWithZod(userLoginValidationSchema, data, res);
    const user = await User.findOne({ email: data.email });
    if (!user) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }
    const isPasswordValid = await user.comparePassword(data.password!);
    if (!isPasswordValid) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens({
      userId: new mongoose.Types.ObjectId(user.id),
      role: user.role,
    });

    // Set refresh token in httpOnly cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Send response
    res.status(200).json({
      message: "Login successful",
      accessToken,
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        profileImage: user.profileImage,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "internal server error", error: error });
  }
};
export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    res.clearCookie("refreshToken");
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error });
  }
};

export const refresh = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get refresh token from cookies or request body
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      res.status(401).json({ message: "Refresh token not provided" });
      return;
    }

    // Verify the refresh token
    const decoded = verifyRefreshToken(refreshToken);

    if (!decoded) {
      res.status(403).json({ message: "Invalid refresh token" });
      return;
    }
    // Generate new access token
    const accessToken = generateAccessToken({
      userId: decoded.userId,
      role: decoded.role,
    });

    const user = await User.findOne({ _id: decoded.userId });
    if (!user) {
      res.status(400).json({ message: "user not exists.." });
      return;
    }

    res.status(200).json({
      message: "Token refreshed successfully",
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        profileImage: user.profileImage,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error", error: error });
  }
};

export const updateProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { profileImage } = req.body;
    const userId = req.user?.userId;

    if (!profileImage) {
      res.status(400).json({ message: "Profile pic is required" });
      return;
    }

    const uploadResponse = await cloudinary.uploader.upload(profileImage);
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profileImage: uploadResponse.secure_url },
      { new: true }
    );

    res.status(200).json({
      user: {
        id: updatedUser?.id,
        email: updatedUser?.email,
        fullName: updatedUser?.fullName,
        profileImage: updatedUser?.profileImage,
        createdAt: updatedUser?.createdAt,
      },
    });
  } catch (error) {
    console.log("error in update profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const searchUsers = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { searchQuery } = req.params;
    const userId = req.user?.userId;


    if (!userId) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    if (!searchQuery || typeof searchQuery !== 'string') {
      res.status(400).json({ message: "Search query is required" });
      return;
    }

    // Search for users by name or email, excluding current user
    const users = await User.find({
      $and: [
        {
          $or: [
            { fullName: { $regex: searchQuery, $options: 'i' } },
            { email: { $regex: searchQuery, $options: 'i' } }
          ]
        },
        { _id: { $ne: userId } }
      ]
    })
    .select('fullName email profileImage')
    .limit(10);

    // Get all friendships for these users
    const userIds = users.map(user => user._id);
    const friendships = await Friend.find({
      $or: [
        { requester: userId, recipient: { $in: userIds } },
        { recipient: userId, requester: { $in: userIds } }
      ]
    }).select('requester recipient status');

    // Map users with their friendship status
    const usersWithStatus = users.map(user => {
      const friendship = friendships.find(f => 
        (f.requester.toString() === user.id.toString()) || 
        (f.recipient.toString() === user.id.toString())
      );

      let friendshipStatus = null;
      let isRequester = false;

      if (friendship) {
        friendshipStatus = friendship.status;
        isRequester = friendship.requester.toString() === userId.toString();
      }

      return {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        profileImage: user.profileImage,
        friendshipStatus,
        isRequester,
      };
    });

    res.status(200).json({ 
      users: usersWithStatus,
      count: usersWithStatus.length 
    });
  } catch (error) {
    console.error("Error in searchUsers:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};