import { Request, Response } from "express";
import mongoose from "mongoose";
import Circle, { ICircle } from "../models/circleModel";
import CircleRequest, {
  RequestStatus,
  RequestType,
} from "../models/circleRequestModel";
import User from "../models/userModel";
import Notification, { NotificationType } from "../models/notificationModel";

// Get all circles (public info only)
export const getAllCircles = async (req: Request, res: Response) => {
  try {
    // Find specific admin user to be used as the guru for default circles
    let adminUser = await User.findOne({ 
      _id: "682499455e350516d6b68915",
      isAdmin: true 
    });
    
    // Fallback to any admin user if the specific one is not found
    if (!adminUser) {
      adminUser = await User.findOne({ isAdmin: true }) || await User.findOne();
      
      if (!adminUser) {
        return res.status(500).json({
          status: "error",
          message: "No users found in the system",
        });
      }
      
      console.log(`Using fallback admin: ${adminUser.username} (${adminUser._id})`);
    } else {
      console.log(`Using primary admin: ${adminUser.username} (${adminUser._id})`);
    }

    // Check if default circles exist
    const defaultCirclesExist = await Circle.findOne({ isDefault: true });
    
    // Define the default circles data
    const defaultCirclesData = [
      {
        name: "Discipline & Focus",
        image: "/uploads/circles/stoic-warriors.jpg",
        bio: "A circle for those who practice stoicism in their daily lives.",
        guru: adminUser._id,
        members: [adminUser._id],
        rank: 1,
        isDefault: true,
      },
      {
        name: "Meditation Masters",
        image: "/uploads/circles/meditation.jpg",
        bio: "Daily meditation practice and mindfulness techniques.",
        guru: adminUser._id,
        members: [adminUser._id],
        rank: 2,
        isDefault: true,
      },
      {
        name: "Ethical Leadership",
        image: "/uploads/circles/leadership.jpg",
        bio: "Discussing leadership principles based on stoic philosophy.",
        guru: adminUser._id,
        members: [adminUser._id],
        rank: 3,
        isDefault: true,
      },
      {
        name: "Stoic Parenting",
        image: "/uploads/circles/leadership.jpg",
        bio: "Discussing how can be the best parent that create future leaders.",
        guru: adminUser._id,
        members: [adminUser._id],
        rank: 4,
        isDefault: true,
      },
      {
        name: "Heartbreak & Healing",
        image: "/uploads/circles/leadership.jpg",
        bio: "Heal yourself after you have tried your best whether its a relationship or anything that broke you and you want a great comeback from the biggest disaster of your life.",
        guru: adminUser._id,
        members: [adminUser._id],
        rank: 5,
        isDefault: true,
      },
      {
        name: "Psychological Facts",
        image: "/uploads/circles/leadership.jpg",
        bio: "Some mindblowing facts that can blow your mind and ready your mind to train to become a stoic.",
        guru: adminUser._id,
        members: [adminUser._id],
        rank: 6,
        isDefault: true,
      },
    ];

    // If default circles don't exist, create them
    if (!defaultCirclesExist) {
      console.log("Creating default circles in database...");
      
      const createdCircles = await Circle.insertMany(defaultCirclesData);
      console.log(`Created ${createdCircles.length} default circles`);

      // Update admin user to be guru of these circles
      if (adminUser) {
        await User.findByIdAndUpdate(adminUser._id, {
          $addToSet: { isGuru: { $each: createdCircles.map(circle => circle._id) } }
        });
        console.log("Updated admin user to be guru of default circles");
      }
    }

    // Fetch all circles (will now include the default ones too)
    const circles = await Circle.find()
      .select("name image bio members rank isDefault")
      .populate("guru", "username name profilePicture");
    
    console.log("Fetched circles from database:", circles.length);
    
    // Sort by rank
    circles.sort((a, b) => (a.rank || 0) - (b.rank || 0));

    return res.status(200).json({
      status: "success",
      data: {
        circles,
      },
    });
  } catch (error: any) {
    console.error("Error fetching circles:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Get circle by ID (with more details if user is a member)
export const getCircleById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid circle ID",
      });
    }

    const circle = await Circle.findById(id)
      .populate("guru", "username name profilePicture")
      .populate("members", "username name profilePicture");

    if (!circle) {
      return res.status(404).json({
        status: "error",
        message: "Circle not found",
      });
    }

    // Check if user is a member to determine what data to send
    const isMember =
      userId &&
      circle.members.some(
        (member) => member._id.toString() === userId.toString()
      );
    const isGuru = userId && circle.guru._id.toString() === userId.toString();

    // If not a member, only send public info
    if (!isMember && !isGuru) {
      const publicCircleInfo = {
        _id: circle._id,
        name: circle.name,
        image: circle.image,
        bio: circle.bio,
        memberCount: circle.members.length,
        guru: circle.guru,
        rank: circle.rank,
        isDefault: circle.isDefault,
        isMember: false,
        isGuru: false,
      };

      return res.status(200).json({
        status: "success",
        data: {
          circle: publicCircleInfo,
        },
      });
    }

    // Send full info for members or guru
    res.status(200).json({
      status: "success",
      data: {
        circle: {
          ...circle.toObject(),
          isMember: true,
          isGuru,
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

// Create default circles (admin only)
export const createDefaultCircles = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;

    // Check if user is admin
    const user = await User.findById(userId);
    if (!user || !user.isAdmin) {
      return res.status(403).json({
        status: "error",
        message: "Only admin can create default circles",
      });
    }

    // Default circle data
    const defaultCircles = [
      {
        name: "Discipline & Focus",
        bio: "Master your mind and actions through stoic discipline and focus techniques",
        image: "default-discipline-image.jpg",
        guru: userId,
        members: [userId],
        isDefault: true,
      },
      {
        name: "Being a better parent",
        bio: "Apply stoic principles to parenthood and family relationships",
        image: "default-parent-image.jpg",
        guru: userId,
        members: [userId],
        isDefault: true,
      },
      {
        name: "Career and Purpose",
        bio: "Find meaning and direction in work through stoic purpose-seeking",
        image: "default-career-image.jpg",
        guru: userId,
        members: [userId],
        isDefault: true,
      },
      {
        name: "Heartbreak and healing",
        bio: "Navigate difficult emotions and relationships with stoic resilience",
        image: "default-heartbreak-image.jpg",
        guru: userId,
        members: [userId],
        isDefault: true,
      },
      {
        name: "Psychological Facts",
        bio: "Explore psychological insights through the lens of stoic philosophy",
        image: "default-psychology-image.jpg",
        guru: userId,
        members: [userId],
        isDefault: true,
      },
    ];

    // Check if default circles already exist
    const existingDefaultCircles = await Circle.find({ isDefault: true });
    if (existingDefaultCircles.length > 0) {
      return res.status(400).json({
        status: "error",
        message: "Default circles already exist",
      });
    }

    // Create default circles
    const circles = await Circle.create(defaultCircles);

    // Update user to be guru of these circles
    await User.findByIdAndUpdate(userId, {
      $push: { isGuru: { $each: circles.map((circle) => circle._id) } },
    });

    res.status(201).json({
      status: "success",
      data: {
        circles,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Send a request to join a circle
export const requestToJoinCircle = async (req: Request, res: Response) => {
  try {
    console.log('Request body:', JSON.stringify(req.body));
    console.log('Content-Type:', req.headers['content-type']);
    
    // Check if body is undefined or empty
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        status: "error",
        message: "Request body is empty. Make sure you're sending a JSON payload with 'Content-Type: application/json' header."
      });
    }
    
    const { circleId, reason } = req.body;
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

    // Check if user is already a member
    const isMember = circle.members.some(
      (member) => member.toString() === userId.toString()
    );
    if (isMember) {
      return res.status(400).json({
        status: "error",
        message: "You are already a member of this circle",
      });
    }

    // Check if there's a pending request
    const existingRequest = await CircleRequest.findOne({
      from: userId,
      circle: circleId,
      type: RequestType.JOIN,
      status: RequestStatus.PENDING,
    });

    if (existingRequest) {
      return res.status(400).json({
        status: "error",
        message: "You already have a pending request to join this circle",
      });
    }

    // Debug guru and user info
    console.log('Circle guru ID:', circle.guru ? circle.guru.toString() : 'undefined');
    console.log('User ID:', userId ? userId.toString() : 'undefined');

    // Check if the circle has a valid guru
    if (!circle.guru) {
      return res.status(400).json({
        status: "error",
        message: "This circle doesn't have a guru assigned. Cannot send join request.",
      });
    }

    // Check if the user is trying to join their own circle (user is the guru)
    if (circle.guru.toString() === userId.toString()) {
      console.log('User is the guru of this circle!');
      return res.status(400).json({
        status: "error",
        message: "You are the guru of this circle and already a member.",
      });
    }
    
    // Let's get more details about the guru
    const guruUser = await User.findById(circle.guru).select('_id username email');
    console.log('Guru user details:', guruUser);

    // Get the guru user ID to avoid any potential issues
    const guruId = guruUser ? guruUser._id : circle.guru;
    
    console.log('From userId:', userId.toString());
    console.log('To guruId:', guruId.toString());
    
    // Create join request
    const request = await CircleRequest.create({
      type: RequestType.JOIN,
      from: userId,
      to: guruId,
      circle: circleId,
      reason: reason || "I would like to join this circle",
    });

    // Create notification for the guru
    await Notification.create({
      type: NotificationType.CIRCLE_JOIN_REQUEST,
      from: userId,
      to: circle.guru,
      circle: circleId,
      message: `New join request for circle "${circle.name}"`,
    });

    res.status(201).json({
      status: "success",
      data: {
        request,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Process circle requests (approve/reject) as a guru
export const processCircleRequest = async (req: Request, res: Response) => {
  try {
    const { requestId, status } = req.body;
    const userId = req.user?._id;

    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid request ID",
      });
    }

    if (![RequestStatus.APPROVED, RequestStatus.REJECTED].includes(status)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid status",
      });
    }

    // Find the request
    const request = await CircleRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({
        status: "error",
        message: "Request not found",
      });
    }

    // Check if user is authorized (guru of the circle)
    if (request.type === RequestType.JOIN) {
      const circle = await Circle.findById(request.circle);
      if (!circle) {
        return res.status(404).json({
          status: "error",
          message: "Circle not found",
        });
      }

      if (circle.guru.toString() !== userId.toString()) {
        return res.status(403).json({
          status: "error",
          message: "Only the circle guru can process join requests",
        });
      }

      // Update request status
      request.status = status;
      await request.save();

      // If approved, add user to circle members
      if (status === RequestStatus.APPROVED) {
        await Circle.findByIdAndUpdate(request.circle, {
          $addToSet: { members: request.from },
        });

        await User.findByIdAndUpdate(request.from, {
          $addToSet: { joinedCircles: request.circle },
        });

        // Create notification for the user
        await Notification.create({
          type: NotificationType.CIRCLE_REQUEST_ACCEPTED,
          from: userId,
          to: request.from,
          circle: request.circle,
          message: `Your request to join "${circle.name}" has been approved`,
        });
      } else if (status === RequestStatus.REJECTED) {
        // Create notification for the user
        await Notification.create({
          type: NotificationType.CIRCLE_REQUEST_REJECTED,
          from: userId,
          to: request.from,
          circle: request.circle,
          message: `Your request to join "${circle.name}" has been rejected`,
        });
      }
    } else if (request.type === RequestType.CREATE) {
      // Check if user is admin for circle creation requests
      const user = await User.findById(userId);
      if (!user || !user.isAdmin) {
        return res.status(403).json({
          status: "error",
          message: "Only admin can process circle creation requests",
        });
      }

      // Update request status
      request.status = status;
      await request.save();

      // If approved, create circle and make requester the guru
      if (
        status === RequestStatus.APPROVED &&
        request.circleName &&
        request.circleBio
      ) {
        const newCircle = await Circle.create({
          name: request.circleName,
          bio: request.circleBio,
          image: "default-circle-image.jpg", // Default image
          guru: request.from,
          members: [request.from], // Add the creator as a member as well
          isDefault: false,
        });

        // Add user as guru of this circle
        await User.findByIdAndUpdate(request.from, {
          $addToSet: { isGuru: newCircle._id },
        });

        // Create notification for the user
        await Notification.create({
          type: NotificationType.CIRCLE_CREATED,
          from: userId,
          to: request.from,
          circle: newCircle._id,
          message: `Your circle "${request.circleName}" has been approved and created`,
        });
      } else if (status === RequestStatus.REJECTED) {
        // Create rejection notification
        await Notification.create({
          type: NotificationType.CIRCLE_REQUEST_REJECTED,
          from: userId,
          to: request.from,
          message: `Your request to create circle "${request.circleName}" has been rejected`,
        });
      }
    }

    res.status(200).json({
      status: "success",
      data: {
        request,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Request to create a new circle
export const requestToCreateCircle = async (req: Request, res: Response) => {
  try {
    const { name, bio, reason } = req.body;
    const userId = req.user?._id;

    if (!name || !bio || !reason) {
      return res.status(400).json({
        status: "error",
        message: "Name, bio, and reason are required",
      });
    }

    // Check if circle name already exists
    const existingCircle = await Circle.findOne({ name });
    if (existingCircle) {
      return res.status(400).json({
        status: "error",
        message: "A circle with this name already exists",
      });
    }

    // Find specific admin user to send request to
    let admin = await User.findOne({ 
      _id: "682499455e350516d6b68915",
      isAdmin: true 
    });
    
    // Fallback to any admin if specific one not found
    if (!admin) {
      admin = await User.findOne({ isAdmin: true });
      if (!admin) {
        return res.status(500).json({
          status: "error",
          message: "No admin found to process request",
        });
      }
      console.log(`Using fallback admin for circle creation request: ${admin.username}`);
    } else {
      console.log(`Using primary admin for circle creation request: ${admin.username}`);
    }

    // Check if there's a pending request
    const existingRequest = await CircleRequest.findOne({
      from: userId,
      type: RequestType.CREATE,
      circleName: name,
      status: RequestStatus.PENDING,
    });

    if (existingRequest) {
      return res.status(400).json({
        status: "error",
        message:
          "You already have a pending request to create a circle with this name",
      });
    }

    // Create circle creation request
    const request = await CircleRequest.create({
      type: RequestType.CREATE,
      from: userId,
      to: admin._id,
      circleName: name,
      circleBio: bio,
      reason,
    });

    // Create notification for admin
    await Notification.create({
      type: NotificationType.CIRCLE_JOIN_REQUEST,
      from: userId,
      to: admin._id,
      message: `New request to create circle "${name}"`,
    });

    res.status(201).json({
      status: "success",
      data: {
        request,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Invite a user to a circle (guru only)
export const inviteUserToCircle = async (req: Request, res: Response) => {
  try {
    const { circleId, userId: targetUserId } = req.body;
    const guruId = req.user?._id;

    if (
      !mongoose.Types.ObjectId.isValid(circleId) ||
      !mongoose.Types.ObjectId.isValid(targetUserId)
    ) {
      return res.status(400).json({
        status: "error",
        message: "Invalid IDs",
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

    // Check if user is guru of this circle
    if (circle.guru.toString() !== guruId.toString()) {
      return res.status(403).json({
        status: "error",
        message: "Only the circle guru can invite users",
      });
    }

    // Check if target user exists
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    // Check if user is already a member
    const isMember = circle.members.some(
      (member) => member.toString() === targetUserId.toString()
    );
    if (isMember) {
      return res.status(400).json({
        status: "error",
        message: "User is already a member of this circle",
      });
    }

    // Check if there's a pending invite
    const existingInvite = await CircleRequest.findOne({
      from: guruId,
      to: targetUserId,
      circle: circleId,
      type: RequestType.INVITE,
      status: RequestStatus.PENDING,
    });

    if (existingInvite) {
      return res.status(400).json({
        status: "error",
        message: "You have already sent an invite to this user",
      });
    }

    // Create invite request
    const invite = await CircleRequest.create({
      type: RequestType.INVITE,
      from: guruId,
      to: targetUserId,
      circle: circleId,
      reason: `You've been invited to join the "${circle.name}" circle`,
    });

    // Create notification for target user
    await Notification.create({
      type: NotificationType.CIRCLE_INVITE,
      from: guruId,
      to: targetUserId,
      circle: circleId,
      message: `You've been invited to join the "${circle.name}" circle`,
    });

    res.status(201).json({
      status: "success",
      data: {
        invite,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Process invite (accept/reject) as a user
export const processCircleInvite = async (req: Request, res: Response) => {
  try {
    const { inviteId, status } = req.body;
    const userId = req.user?._id;

    if (!mongoose.Types.ObjectId.isValid(inviteId)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid invite ID",
      });
    }

    if (![RequestStatus.APPROVED, RequestStatus.REJECTED].includes(status)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid status",
      });
    }

    // Find the invite
    const invite = await CircleRequest.findById(inviteId);
    if (!invite || invite.type !== RequestType.INVITE) {
      return res.status(404).json({
        status: "error",
        message: "Invite not found",
      });
    }

    // Check if user is the invite recipient
    if (invite.to?.toString() !== userId.toString()) {
      return res.status(403).json({
        status: "error",
        message: "You can only process your own invites",
      });
    }

    // Check if circle exists
    const circle = await Circle.findById(invite.circle);
    if (!circle) {
      return res.status(404).json({
        status: "error",
        message: "Circle not found",
      });
    }

    // Update invite status
    invite.status = status;
    await invite.save();

    // If accepted, add user to circle members
    if (status === RequestStatus.APPROVED) {
      await Circle.findByIdAndUpdate(invite.circle, {
        $addToSet: { members: userId },
      });

      await User.findByIdAndUpdate(userId, {
        $addToSet: { joinedCircles: invite.circle },
      });

      // Notify guru that invite was accepted
      await Notification.create({
        type: NotificationType.CIRCLE_REQUEST_ACCEPTED,
        from: userId,
        to: invite.from,
        circle: invite.circle,
        message: `User has accepted your invitation to "${circle.name}"`,
      });
    } else if (status === RequestStatus.REJECTED) {
      // Notify guru that invite was rejected
      await Notification.create({
        type: NotificationType.CIRCLE_REQUEST_REJECTED,
        from: userId,
        to: invite.from,
        circle: invite.circle,
        message: `User has declined your invitation to "${circle.name}"`,
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        invite,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Remove a member from a circle (guru only)
export const removeCircleMember = async (req: Request, res: Response) => {
  try {
    const { circleId, userId: memberUserId } = req.body;
    const guruId = req.user?._id;

    if (
      !mongoose.Types.ObjectId.isValid(circleId) ||
      !mongoose.Types.ObjectId.isValid(memberUserId)
    ) {
      return res.status(400).json({
        status: "error",
        message: "Invalid IDs",
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

    // Check if user is guru of this circle
    if (circle.guru.toString() !== guruId.toString()) {
      return res.status(403).json({
        status: "error",
        message: "Only the circle guru can remove members",
      });
    }

    // Check if member exists and is in the circle
    const isMember = circle.members.some(
      (member) => member.toString() === memberUserId.toString()
    );
    if (!isMember) {
      return res.status(400).json({
        status: "error",
        message: "User is not a member of this circle",
      });
    }

    // Remove member from circle
    await Circle.findByIdAndUpdate(circleId, {
      $pull: { members: memberUserId },
    });

    // Remove circle from user's joined circles
    await User.findByIdAndUpdate(memberUserId, {
      $pull: { joinedCircles: circleId },
    });

    res.status(200).json({
      status: "success",
      message: "Member removed from circle successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Leave a circle (as a member)
export const leaveCircle = async (req: Request, res: Response) => {
  try {
    const { circleId } = req.body;
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

    // Check if user is a member
    const isMember = circle.members.some(
      (member) => member.toString() === userId.toString()
    );
    if (!isMember) {
      return res.status(400).json({
        status: "error",
        message: "You are not a member of this circle",
      });
    }

    // Check if user is the guru (guru can't leave, only transfer ownership)
    if (circle.guru.toString() === userId.toString()) {
      return res.status(400).json({
        status: "error",
        message:
          "As the guru, you cannot leave the circle. You must transfer ownership first.",
      });
    }

    // Remove user from circle members
    await Circle.findByIdAndUpdate(circleId, {
      $pull: { members: userId },
    });

    // Remove circle from user's joined circles
    await User.findByIdAndUpdate(userId, {
      $pull: { joinedCircles: circleId },
    });

    res.status(200).json({
      status: "success",
      message: "Left circle successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Update circle ranking
export const updateCircleRanking = async (req: Request, res: Response) => {
  try {
    const circles = await Circle.find();

    // Process each circle to calculate rank
    for (const circle of circles) {
      await circle.calculateRank();
    }

    // Get updated circles sorted by rank
    const rankedCircles = await Circle.find()
      .sort({ rank: -1 })
      .select("name rank");

    res.status(200).json({
      status: "success",
      data: {
        rankedCircles,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Get circles where user is a member
export const getUserCircles = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;

    const user = await User.findById(userId)
      .populate({
        path: "joinedCircles",
        select: "name image bio members rank",
        populate: {
          path: "guru",
          select: "username name profilePicture",
        },
      })
      .populate({
        path: "isGuru",
        select: "name image bio members rank",
      });

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        joinedCircles: user.joinedCircles,
        guruCircles: user.isGuru,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
