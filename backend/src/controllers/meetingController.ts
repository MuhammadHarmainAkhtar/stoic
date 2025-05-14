import { Request, Response } from "express";
import mongoose from "mongoose";
import Meeting, { IMeeting, MeetingType } from "../models/meetingModel";
import Circle from "../models/circleModel";
import Notification, { NotificationType } from "../models/notificationModel";
import { v4 as uuidv4 } from "uuid";
import { socketManager } from "../server";

// Create a meeting
export const createMeeting = async (req: Request, res: Response) => {
  try {
    const { circleId, title, description, type, scheduledFor, duration } =
      req.body;
    const userId = req.user?._id;

    if (!mongoose.Types.ObjectId.isValid(circleId)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid circle ID",
      });
    }

    // Validate required fields
    if (!title || !description || !scheduledFor || !duration) {
      return res.status(400).json({
        status: "error",
        message: "Missing required fields",
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

    // Check if user is the guru of this circle
    if (circle.guru.toString() !== userId?.toString()) {
      return res.status(403).json({
        status: "error",
        message: "Only the guru can schedule meetings for this circle",
      });
    }

    // Create meeting with unique room ID
    const meeting = await Meeting.create({
      title,
      description,
      type: type || MeetingType.VIDEO,
      circle: circleId,
      creator: userId,
      scheduledFor: new Date(scheduledFor),
      duration: parseInt(duration as string),
      roomId: uuidv4(),
      participants: [userId],
    });

    // Create notifications for all circle members
    const memberIds = circle.members.filter(
      (member) => member.toString() !== userId.toString()
    );

    const notifications = memberIds.map((memberId) => ({
      type: NotificationType.MEETING_SCHEDULED,
      from: userId,
      to: memberId,
      circle: circleId,
      message: `New meeting scheduled in ${circle.name}: ${title}`,
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    res.status(201).json({
      status: "success",
      data: {
        meeting,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Get meetings for a circle
export const getCircleMeetings = async (req: Request, res: Response) => {
  try {
    const { circleId } = req.params;
    const userId = req.user?._id;

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
        message: "You must be a member of this circle to view meetings",
      });
    }

    // Get meetings for this circle, sorted by scheduled date
    const meetings = await Meeting.find({ circle: circleId })
      .sort({ scheduledFor: 1 })
      .populate("creator", "username name profilePicture");

    res.status(200).json({
      status: "success",
      data: {
        meetings,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Get a meeting by ID
export const getMeetingById = async (req: Request, res: Response) => {
  try {
    const { meetingId } = req.params;
    const userId = req.user?._id;

    if (!mongoose.Types.ObjectId.isValid(meetingId)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid meeting ID",
      });
    }

    // Get meeting with populated data
    const meeting = await Meeting.findById(meetingId)
      .populate("creator", "username name profilePicture")
      .populate("participants", "username name profilePicture")
      .populate("circle", "name");

    if (!meeting) {
      return res.status(404).json({
        status: "error",
        message: "Meeting not found",
      });
    }

    // Check if user is a member of the circle
    const circle = await Circle.findById(meeting.circle);
    if (!circle) {
      return res.status(404).json({
        status: "error",
        message: "Circle not found",
      });
    }

    const isMember =
      circle.members.some(
        (member) => member.toString() === userId?.toString()
      ) || circle.guru.toString() === userId?.toString();

    if (!isMember) {
      return res.status(403).json({
        status: "error",
        message: "You must be a member of this circle to view this meeting",
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        meeting,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Join a meeting
export const joinMeeting = async (req: Request, res: Response) => {
  try {
    const { meetingId } = req.params;
    const userId = req.user?._id;

    if (!mongoose.Types.ObjectId.isValid(meetingId)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid meeting ID",
      });
    }

    // Find meeting
    const meeting = await Meeting.findById(meetingId);
    if (!meeting) {
      return res.status(404).json({
        status: "error",
        message: "Meeting not found",
      });
    }

    // Check if user is a member of the circle
    const circle = await Circle.findById(meeting.circle);
    if (!circle) {
      return res.status(404).json({
        status: "error",
        message: "Circle not found",
      });
    }

    const isMember =
      circle.members.some(
        (member) => member.toString() === userId?.toString()
      ) || circle.guru.toString() === userId?.toString();

    if (!isMember) {
      return res.status(403).json({
        status: "error",
        message: "You must be a member of this circle to join this meeting",
      });
    }

    // Add user to participants if not already there
    if (
      !meeting.participants.some((p) => p.toString() === userId?.toString())
    ) {
      meeting.participants.push(userId as any);
      await meeting.save();

      // Notify other participants of the new joiner
      try {
        socketManager.io
          .to(`meeting:${meetingId}`)
          .emit("meeting:participant-joined", {
            meetingId,
            participant: userId,
          });
      } catch (error) {
        console.error("Error sending meeting join notification:", error);
      }
    }

    // Set meeting to active if it's the creator joining and not already active
    if (
      meeting.creator.toString() === userId?.toString() &&
      !meeting.isActive
    ) {
      meeting.isActive = true;
      await meeting.save();
    }

    res.status(200).json({
      status: "success",
      data: {
        meeting,
        roomId: meeting.roomId,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// End a meeting (guru only)
export const endMeeting = async (req: Request, res: Response) => {
  try {
    const { meetingId } = req.params;
    const userId = req.user?._id;

    if (!mongoose.Types.ObjectId.isValid(meetingId)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid meeting ID",
      });
    }

    // Find meeting
    const meeting = await Meeting.findById(meetingId);
    if (!meeting) {
      return res.status(404).json({
        status: "error",
        message: "Meeting not found",
      });
    }

    // Check if user is the creator
    if (meeting.creator.toString() !== userId?.toString()) {
      return res.status(403).json({
        status: "error",
        message: "Only the meeting creator can end this meeting",
      });
    }

    // End meeting
    meeting.isActive = false;
    await meeting.save();

    // Optionally, notify all participants that the meeting has ended
    // This would be better handled through the socket connection

    res.status(200).json({
      status: "success",
      message: "Meeting ended successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Update a meeting (guru only)
export const updateMeeting = async (req: Request, res: Response) => {
  try {
    const { meetingId } = req.params;
    const { title, description, type, scheduledFor, duration } = req.body;
    const userId = req.user?._id;

    if (!mongoose.Types.ObjectId.isValid(meetingId)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid meeting ID",
      });
    }

    // Find meeting
    const meeting = await Meeting.findById(meetingId);
    if (!meeting) {
      return res.status(404).json({
        status: "error",
        message: "Meeting not found",
      });
    }

    // Check if user is the creator
    if (meeting.creator.toString() !== userId?.toString()) {
      return res.status(403).json({
        status: "error",
        message: "Only the meeting creator can update this meeting",
      });
    }

    // Check if meeting is already active
    if (meeting.isActive) {
      return res.status(400).json({
        status: "error",
        message: "Cannot update an active meeting",
      });
    }

    // Update meeting
    if (title) meeting.title = title;
    if (description) meeting.description = description;
    if (type && Object.values(MeetingType).includes(type as MeetingType))
      meeting.type = type as MeetingType;
    if (scheduledFor) meeting.scheduledFor = new Date(scheduledFor);
    if (duration) meeting.duration = parseInt(duration as string);

    await meeting.save();

    // Create notifications for all participants
    const participantIds = meeting.participants.filter(
      (participant) => participant.toString() !== userId.toString()
    );

    const notifications = participantIds.map((participantId) => ({
      type: NotificationType.MEETING_SCHEDULED,
      from: userId,
      to: participantId,
      circle: meeting.circle,
      message: `Meeting updated: ${meeting.title}`,
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    res.status(200).json({
      status: "success",
      data: {
        meeting,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Delete a meeting (guru only)
export const deleteMeeting = async (req: Request, res: Response) => {
  try {
    const { meetingId } = req.params;
    const userId = req.user?._id;

    if (!mongoose.Types.ObjectId.isValid(meetingId)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid meeting ID",
      });
    }

    // Find meeting
    const meeting = await Meeting.findById(meetingId);
    if (!meeting) {
      return res.status(404).json({
        status: "error",
        message: "Meeting not found",
      });
    }

    // Check if user is the creator
    if (meeting.creator.toString() !== userId?.toString()) {
      return res.status(403).json({
        status: "error",
        message: "Only the meeting creator can delete this meeting",
      });
    }

    // Check if meeting is already active
    if (meeting.isActive) {
      return res.status(400).json({
        status: "error",
        message: "Cannot delete an active meeting",
      });
    }

    // Notify participants before deleting
    const participantIds = meeting.participants.filter(
      (participant) => participant.toString() !== userId.toString()
    );

    const notifications = participantIds.map((participantId) => ({
      type: NotificationType.MEETING_SCHEDULED,
      from: userId,
      to: participantId,
      circle: meeting.circle,
      message: `Meeting canceled: ${meeting.title}`,
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    // Delete meeting
    await Meeting.findByIdAndDelete(meetingId);

    res.status(200).json({
      status: "success",
      message: "Meeting deleted successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
