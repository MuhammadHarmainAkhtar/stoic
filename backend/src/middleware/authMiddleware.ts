import { Request, Response, NextFunction } from "express";
import { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import User from "../models/userModel";
import mongoose from "mongoose";

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

interface DecodedToken {
  id?: string;
  userId?: string; // Add userId field as it's used in the token
  email?: string;
  verified?: boolean;
  iat: number;
  exp: number;
}

/**
 * Authentication middleware to protect routes
 * Returns a properly typed Express RequestHandler
 */
export const protect: RequestHandler = async (req, res, next) => {
  try {
    let token;

    // Check for token in headers
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      res.status(401).json({
        status: "error",
        message: "You are not logged in. Please log in to get access.",
      });
      return;
    }

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "default_secret"
    ) as DecodedToken;

    console.log("Decoded token:", JSON.stringify(decoded));

    // Check if user still exists - support both id and userId fields
    const userId = decoded.userId || decoded.id;
    
    if (!userId) {
      res.status(401).json({
        status: "error",
        message: "Invalid token structure. User ID not found in token.",
        debug: { decodedToken: decoded }
      });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      console.log(`User not found with ID: ${userId}`);
      res.status(401).json({
        status: "error",
        message: "The user belonging to this token no longer exists.",
        debug: { userId }
      });
      return;
    }

    console.log(`User found and authenticated: ${user.username} (${user._id})`);
    
    // Grant access to protected route
    req.user = user;
    next();
  } catch (error: any) {
    console.error("Auth middleware error:", error.message);
    res.status(401).json({
      status: "error",
      message: "Invalid token or session expired. Please log in again.",
      error: error.message
    });
  }
};

/**
 * Middleware to restrict certain routes to admin only
 */
export const restrictToAdmin: RequestHandler = (req, res, next) => {
  if (!req.user.isAdmin) {
    res.status(403).json({
      status: "error",
      message: "You do not have permission to perform this action.",
    });
    return;
  }

  next();
};

/**
 * Middleware to restrict certain routes to guru of a specific circle
 */
export const restrictToGuru: RequestHandler = async (req, res, next) => {
  try {
    // Get circleId from params or body
    const circleId = req.params.circleId || req.body.circleId;

    if (!mongoose.Types.ObjectId.isValid(circleId)) {
      res.status(400).json({
        status: "error",
        message: "Invalid circle ID",
      });
      return;
    }

    // Check if user is guru of this circle
    const isGuru = req.user.isGuru.some(
      (guruCircleId: mongoose.Types.ObjectId) =>
        guruCircleId.toString() === circleId
    );

    if (!isGuru) {
      res.status(403).json({
        status: "error",
        message: "You must be the guru of this circle to perform this action.",
      });
      return;
    }

    next();
  } catch (error: any) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

/**
 * Middleware to restrict certain routes to members of a specific circle
 */
export const restrictToCircleMembers: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    // Get circleId from params or body
    const circleId = req.params.circleId || req.body.circleId;

    if (!mongoose.Types.ObjectId.isValid(circleId)) {
      res.status(400).json({
        status: "error",
        message: "Invalid circle ID",
      });
      return;
    }

    // Check if user is a member or guru of this circle
    const isMember = req.user.joinedCircles.some(
      (memberCircleId: mongoose.Types.ObjectId) =>
        memberCircleId.toString() === circleId
    );

    const isGuru = req.user.isGuru.some(
      (guruCircleId: mongoose.Types.ObjectId) =>
        guruCircleId.toString() === circleId
    );

    if (!isMember && !isGuru) {
      res.status(403).json({
        status: "error",
        message: "You must be a member of this circle to perform this action.",
      });
      return;
    }

    next();
  } catch (error: any) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
