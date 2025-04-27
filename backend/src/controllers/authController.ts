// src/controllers/authController.ts

import { Request, Response } from "express";
import crypto from "crypto";
import { Document } from "mongoose";
import User from "../models/User";
import { sendVerificationEmail } from "../services/emailService";
import { generateToken } from "../middleware/authMiddleware";

interface AuthenticatedUser extends Document {
  _id: string;
  username: string;
  email: string;
  isVerified: boolean;
  verificationCode?: string;
  verificationCodeExpires?: Date;
  comparePassword(password: string): Promise<boolean>;
}

// Register a new user
export const register = async (req: Request, res: Response) => {
  const { username, email, password } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({
        message:
          existingUser.email === email
            ? "Email already registered"
            : "Username already taken",
      });
    }

    // Generate verification code
    const verificationCode = crypto.randomInt(100000, 999999).toString();
    const verificationCodeExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    // Create new user
    const user = new User({
      username,
      email,
      password,
      verificationCode,
      verificationCodeExpires,
    });

    await user.save();

    // Send verification email
    await sendVerificationEmail(email, verificationCode);

    return res.status(201).json({
      message:
        "Registration successful. Please check your email for verification code.",
      userId: user._id,
    });
  } catch (error) {
    console.error("Error in register:", error);
    return res.status(500).json({ message: "Error during registration" });
  }
};

// Verify user's email with code
export const verifyEmail = async (req: Request, res: Response) => {
  const { email, verificationCode } = req.body;

  try {
    const user = await User.findOne({
      email,
      verificationCode,
      verificationCodeExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired verification code",
      });
    }

    // Update user verification status
    user.isVerified = true;
    user.verificationCode = ""; // Set to empty string instead of undefined
    user.verificationCodeExpires = new Date(); // Set to current date instead of null
    await user.save();

    return res.status(200).json({
      message: "Email verified successfully. You can now log in.",
    });
  } catch (error) {
    console.error("Error in verifyEmail:", error);
    return res.status(500).json({ message: "Error during email verification" });
  }
};

// Login user
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = (await User.findOne({ email })) as AuthenticatedUser | null;
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Check if user is verified
    if (!user.isVerified) {
      // Generate new verification code if needed
      const verificationCode = crypto.randomInt(100000, 999999).toString();
      const verificationCodeExpires = new Date(Date.now() + 30 * 60 * 1000);

      user.verificationCode = verificationCode;
      user.verificationCodeExpires = verificationCodeExpires;
      await user.save();

      // Send new verification email
      await sendVerificationEmail(email, verificationCode);

      return res.status(403).json({
        message:
          "Email not verified. A new verification code has been sent to your email.",
      });
    }

    // Check password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate JWT token using the string ID
    const token = generateToken(user._id);

    return res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
      token,
    });
  } catch (error) {
    console.error("Error in login:", error);
    return res.status(500).json({ message: "Error during login" });
  }
};

// Function to send a verification code to the user's email
export const sendVerificationCode = async (req: Request, res: Response) => {
  const { email } = req.body; // Get email from the request body

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    // Generate a random 6-digit verification code
    const verificationCode = crypto.randomInt(100000, 999999).toString();

    // Save the verification code temporarily (you can store it in a database or in-memory for actual use)
    // This is just a placeholder for demo purposes
    // In a real application, you should store it securely and expire it after a set time
    req.app.locals.verificationCode = verificationCode;
    req.app.locals.verificationEmail = email;

    // Send the verification code to the user's email
    await sendVerificationEmail(email, verificationCode);

    return res.status(200).json({ message: "Verification code sent to email" });
  } catch (error) {
    console.error("Error in sendVerificationCode:", error);
    return res
      .status(500)
      .json({ message: "Error sending verification email" });
  }
};

// Function to verify the code entered by the user
export const verifyCode = (req: Request, res: Response) => {
  const { email, verificationCode } = req.body;

  if (!email || !verificationCode) {
    return res
      .status(400)
      .json({ message: "Email and verification code are required" });
  }

  // Check if the verification code matches the one sent earlier
  if (
    email === req.app.locals.verificationEmail &&
    verificationCode === req.app.locals.verificationCode
  ) {
    // If the code is correct, allow the user to log in
    return res
      .status(200)
      .json({ message: "Verification successful, you can now log in" });
  } else {
    // If the code doesn't match
    return res.status(400).json({ message: "Invalid verification code" });
  }
};
