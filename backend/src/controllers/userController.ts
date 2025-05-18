import { Request, Response } from "express";
import User from "../models/userModel";
import fs from "fs";
import path from "path";

// Get user profile
export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;

    // Get user without sensitive information
    const user = await User.findById(userId).select("-password -verificationToken -forgotPasswordToken");
    
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        user,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Update user profile
export const updateUserProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    const { username, bio } = req.body;

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    // Check if username is being updated and verify if it already exists
    if (username && username !== user.username) {
      const usernameExists = await User.findOne({ 
        username: username,
        _id: { $ne: userId } // Exclude current user from check
      });
      
      if (usernameExists) {
        return res.status(400).json({
          status: "error",
          message: "Username already exists. Please choose a different username.",
        });
      }
      
      user.username = username;
    }
    
    // Update bio if provided
    if (bio) user.bio = bio;
    
    await user.save();

    res.status(200).json({
      status: "success",
      data: {
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          bio: user.bio,
          profilePicture: user.profilePicture,
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Update profile picture
export const updateProfilePicture = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    
    // TypeScript fix: req.file comes from multer middleware
    const uploadedFile = req.file as Express.Multer.File | undefined;

    if (!uploadedFile) {
      return res.status(400).json({
        status: "error",
        message: "No file uploaded",
      });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    // Delete old profile picture if it exists and is not the default
    if (user.profilePicture && 
        !user.profilePicture.includes('default') && 
        fs.existsSync(path.join(__dirname, '../../', user.profilePicture))) {
      try {
        fs.unlinkSync(path.join(__dirname, '../../', user.profilePicture));
      } catch (e) {
        console.error("Error deleting old profile picture:", e);
      }
    }

    // Update profile picture path
    user.profilePicture = uploadedFile.path;
    await user.save();

    res.status(200).json({
      status: "success",
      data: {
        user: {
          _id: user._id,
          profilePicture: user.profilePicture,
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
