import { Request, Response } from "express";
import mongoose from "mongoose";
import Notification from "../models/notificationModel";
import { socketManager } from "../server";

// Get user notifications
export const getUserNotifications = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    const { page = 1, limit = 10, unreadOnly = false } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build query
    const query: any = { to: userId };
    if (unreadOnly === "true") {
      query.read = false;
    }

    // Get notifications
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate("from", "username name profilePicture")
      .populate("circle", "name")
      .populate("post", "content type");

    // Get total count
    const totalCount = await Notification.countDocuments(query);

    res.status(200).json({
      status: "success",
      data: {
        notifications,
        pagination: {
          total: totalCount,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(totalCount / limitNum),
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

// Mark notifications as read
export const markNotificationsAsRead = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    const { notificationIds } = req.body;

    // Validate notification IDs
    if (!notificationIds || !Array.isArray(notificationIds)) {
      return res.status(400).json({
        status: "error",
        message: "Notification IDs must be provided as an array",
      });
    }

    // Validate each ID
    for (const notificationId of notificationIds) {
      if (!mongoose.Types.ObjectId.isValid(notificationId)) {
        return res.status(400).json({
          status: "error",
          message: `Invalid notification ID: ${notificationId}`,
        });
      }
    }

    // Mark notifications as read
    const result = await Notification.updateMany(
      {
        _id: { $in: notificationIds },
        to: userId,
      },
      {
        $set: { read: true },
      }
    );

    res.status(200).json({
      status: "success",
      data: {
        modifiedCount: result.modifiedCount,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.user?._id;

    // Mark all notifications as read
    const result = await Notification.updateMany(
      {
        to: userId,
        read: false,
      },
      {
        $set: { read: true },
      }
    );

    res.status(200).json({
      status: "success",
      data: {
        modifiedCount: result.modifiedCount,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Get unread notification count
export const getUnreadNotificationCount = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.user?._id;

    // Get unread notification count
    const count = await Notification.countDocuments({
      to: userId,
      read: false,
    });

    res.status(200).json({
      status: "success",
      data: {
        count,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Helper function to create and send notification
export const createNotification = async (notificationData: any) => {
  try {
    // Create notification in database
    const notification = await Notification.create(notificationData);

    // Send real-time notification if recipient is online
    if (notification.to) {
      try {
        socketManager.sendNotification(
          notification.to.toString(),
          notification
        );
      } catch (error) {
        console.error("Error sending real-time notification:", error);
      }
    }

    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
};
