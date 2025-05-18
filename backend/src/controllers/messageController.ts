import { Request, Response } from "express";
import mongoose from "mongoose";
import Message, { MessageType } from "../models/messageModel";
import Circle from "../models/circleModel";
import User from "../models/userModel";
import { socketManager } from "../server";
import Notification, { NotificationType } from "../models/notificationModel";
import { createNotification } from "./notificationController";

// Get direct messages between two users
export const getDirectMessages = async (req: Request, res: Response) => {
  try {
    const { userId: otherUserId } = req.params;
    const userId = req.user?._id;
    const { page = 1, limit = 20 } = req.query;

    if (!mongoose.Types.ObjectId.isValid(otherUserId)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid user ID",
      });
    }

    // Check if other user exists
    const otherUser = await User.findById(otherUserId);
    if (!otherUser) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Get messages between the two users (in both directions)
    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: otherUserId },
        { sender: otherUserId, receiver: userId },
      ],
      circle: { $exists: false },
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate("sender", "username name profilePicture");

    // Mark messages as read
    await Message.updateMany(
      {
        sender: otherUserId,
        receiver: userId,
        read: false,
      },
      {
        $set: { read: true },
      }
    );

    // Get total count for pagination
    const totalCount = await Message.countDocuments({
      $or: [
        { sender: userId, receiver: otherUserId },
        { sender: otherUserId, receiver: userId },
      ],
      circle: { $exists: false },
    });

    res.status(200).json({
      status: "success",
      data: {
        messages: messages.reverse(), // Return in chronological order
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

// Get messages for a circle
export const getCircleMessages = async (req: Request, res: Response) => {
  try {
    const { circleId } = req.params;
    const userId = req.user?._id;
    const { page = 1, limit = 20 } = req.query;

    if (!mongoose.Types.ObjectId.isValid(circleId)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid circle ID",
      });
    }

    // Check if circle exists
    const circle = await Circle.findById(circleId);
    if (!circle) {
      return res.status(404).json({
        status: "error",
        message: "Circle not found",
      });
    }

    // Check if user is a member of the circle
    const isMember =
      circle.members.some(
        (member) => member.toString() === userId?.toString()
      ) || circle.guru.toString() === userId?.toString();

    if (!isMember) {
      return res.status(403).json({
        status: "error",
        message: "You must be a member of this circle to view messages",
      });
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Get messages for this circle
    const messages = await Message.find({
      circle: circleId,
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate("sender", "username name profilePicture");

    // Get total count for pagination
    const totalCount = await Message.countDocuments({
      circle: circleId,
    });

    res.status(200).json({
      status: "success",
      data: {
        messages: messages.reverse(), // Return in chronological order
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

// Send a direct message (REST API, alternative to socket)
export const sendDirectMessage = async (req: Request, res: Response) => {
  try {
    const { receiverId, content, type } = req.body;
    const senderId = req.user?._id;

    if (!mongoose.Types.ObjectId.isValid(receiverId)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid receiver ID",
      });
    }

    if (!content || content.trim() === "") {
      return res.status(400).json({
        status: "error",
        message: "Message content is required",
      });
    }

    // Check if receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({
        status: "error",
        message: "Receiver not found",
      });
    }

    // Create message
    const message = await Message.create({
      sender: senderId,
      receiver: receiverId,
      type: type || MessageType.TEXT,
      content,
    });

    // Populate sender for response
    await message.populate("sender", "username name profilePicture");

    // Send real-time message via socket if available
    try {
      // Use the helper methods instead of direct access
      socketManager.sendDirectMessage(
        senderId.toString(),
        receiverId.toString(),
        message
      );

      // Create notification for receiver with real-time delivery
      await createNotification({
        type: NotificationType.DIRECT_MESSAGE,
        from: senderId,
        to: receiverId,
        message: "You have a new message",
      });
    } catch (socketError) {
      console.error("Socket error when sending message:", socketError);
    }

    res.status(201).json({
      status: "success",
      data: {
        message,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Send a circle message (REST API, alternative to socket)
export const sendCircleMessage = async (req: Request, res: Response) => {
  try {
    const { circleId, content, type } = req.body;
    const senderId = req.user?._id;

    if (!mongoose.Types.ObjectId.isValid(circleId)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid circle ID",
      });
    }

    if (!content || content.trim() === "") {
      return res.status(400).json({
        status: "error",
        message: "Message content is required",
      });
    }

    // Check if circle exists
    const circle = await Circle.findById(circleId);
    if (!circle) {
      return res.status(404).json({
        status: "error",
        message: "Circle not found",
      });
    }

    // Check if user is a member of the circle
    const isMember =
      circle.members.some(
        (member) => member.toString() === senderId?.toString()
      ) || circle.guru.toString() === senderId?.toString();

    if (!isMember) {
      return res.status(403).json({
        status: "error",
        message: "You must be a member of this circle to send messages",
      });
    }

    // Create message
    const message = await Message.create({
      sender: senderId,
      circle: circleId,
      type: type || MessageType.TEXT,
      content,
    });

    // Populate sender for response
    await message.populate("sender", "username name profilePicture");

    // Send real-time message via socket if available
    try {
      // Use helper method
      socketManager.sendCircleMessage(circleId.toString(), message);
      
      // Create notifications for all circle members except the sender
      const memberIdsToNotify = circle.members.filter(
        memberId => memberId.toString() !== senderId.toString()
      );
      
      // Add guru to notification recipients if not the sender
      if (circle.guru.toString() !== senderId.toString()) {
        memberIdsToNotify.push(circle.guru);
      }
      
      // Get sender's name for the notification message
      const sender = await User.findById(senderId).select("name username");
      const senderName = sender?.name || sender?.username || "Someone";
      
      // Create a notification for each member
      await Promise.all(
        memberIdsToNotify.map(memberId => 
          createNotification({
            type: NotificationType.CIRCLE_MESSAGE,
            from: senderId,
            to: memberId,
            circle: circleId,
            message: `${senderName} posted in ${circle.name}: ${content.substring(0, 50)}${content.length > 50 ? '...' : ''}`,
          })
        )
      );
      
    } catch (socketError) {
      console.error("Socket error when sending circle message:", socketError);
    }

    res.status(201).json({
      status: "success",
      data: {
        message,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Get list of users with whom the current user has had conversations
export const getMessageContacts = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;

    // Find all unique users that the current user has had conversations with
    const sentMessages = await Message.distinct("receiver", {
      sender: userId,
      receiver: { $exists: true },
    });

    const receivedMessages = await Message.distinct("sender", {
      receiver: userId,
    });

    // Combine and deduplicate
    const contactIds = [...new Set([...sentMessages, ...receivedMessages])];

    // Get user info for these contacts
    const contacts = await User.find({
      _id: { $in: contactIds },
    }).select("username name profilePicture");

    // For each contact, find the last message and any unread count
    const contactsWithDetails = await Promise.all(
      contacts.map(async (contact) => {
        // Find the last message between these users
        const lastMessage = await Message.findOne({
          $or: [
            { sender: userId, receiver: contact._id },
            { sender: contact._id, receiver: userId },
          ],
        })
          .sort({ createdAt: -1 })
          .limit(1);

        // Count unread messages from this contact
        const unreadCount = await Message.countDocuments({
          sender: contact._id,
          receiver: userId,
          read: false,
        });

        return {
          _id: contact._id,
          username: contact.username,
          name: contact.name,
          profilePicture: contact.profilePicture,
          lastMessage: lastMessage
            ? {
                content: lastMessage.content,
                createdAt: lastMessage.createdAt,
              }
            : null,
          unreadCount,
        };
      })
    );

    // Sort by last message time, most recent first
    contactsWithDetails.sort((a, b) => {
      if (!a.lastMessage) return 1;
      if (!b.lastMessage) return -1;
      return (
        new Date(b.lastMessage.createdAt).getTime() -
        new Date(a.lastMessage.createdAt).getTime()
      );
    });

    res.status(200).json({
      status: "success",
      data: {
        contacts: contactsWithDetails,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
