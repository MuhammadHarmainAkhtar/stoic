import { Request, Response } from "express";
import mongoose from "mongoose";
import Circle from "../models/circleModel";
import CircleRequest, {
  RequestStatus,
  RequestType,
} from "../models/circleRequestModel";
import User from "../models/userModel";
import Notification, { NotificationType } from "../models/notificationModel";
import CirclePost from "../models/circlePostModel";
import CircleComment from "../models/circleCommentModel";

// Admin remove guru from circle
export const removeGuruFromCircle = async (req: Request, res: Response) => {
  try {
    const { circleId, newGuruId } = req.body;
    const adminId = req.user?._id;

    // Check if user is the main admin
    const isMainAdmin = adminId && adminId.toString() === "682499455e350516d6b68915";
    
    if (!isMainAdmin) {
      const user = await User.findById(adminId);
      if (!user || !user.isAdmin) {
        return res.status(403).json({
          status: "error",
          message: "Only administrators can manage circle gurus",
        });
      }
    }

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

    // Get current guru details for notification
    const currentGuru = await User.findById(circle.guru);
    if (!currentGuru) {
      return res.status(404).json({
        status: "error",
        message: "Current guru not found",
      });
    }

    // If a new guru ID is provided, assign the new guru
    if (newGuruId) {
      if (!mongoose.Types.ObjectId.isValid(newGuruId)) {
        return res.status(400).json({
          status: "error",
          message: "Invalid new guru ID",
        });
      }

      // Check if the new guru exists
      const newGuru = await User.findById(newGuruId);
      if (!newGuru) {
        return res.status(404).json({
          status: "error",
          message: "New guru user not found",
        });
      }

      // Update circle with new guru
      circle.guru = newGuruId;
      await circle.save();

      // Add circle to new guru's list of guru circles
      await User.findByIdAndUpdate(newGuruId, {
        $addToSet: { isGuru: circle._id },
      });

      // Make sure the new guru is a member of the circle
      if (!circle.members.includes(newGuru._id)) {
        circle.members.push(newGuru._id);
        await circle.save();

        // Add circle to the new guru's joined circles as well
        await User.findByIdAndUpdate(newGuruId, {
          $addToSet: { joinedCircles: circle._id },
        });
      }
    } else {
      // If no new guru provided, admin becomes the guru temporarily
      circle.guru = adminId;
      await circle.save();

      // Add circle to admin's list of guru circles if not already there
      await User.findByIdAndUpdate(adminId, {
        $addToSet: { isGuru: circle._id },
      });
    }

    // Remove the circle from old guru's list of guru circles
    await User.findByIdAndUpdate(currentGuru._id, {
      $pull: { isGuru: circle._id },
    });

    // Notify the old guru about removal
    await Notification.create({
      type: NotificationType.CIRCLE_ADMIN_ACTION,
      from: adminId,
      to: currentGuru._id,
      circle: circle._id,
      message: `You have been removed as guru of the "${circle.name}" circle by an administrator`,
    });

    // If a new guru is assigned, notify them
    if (newGuruId) {
      await Notification.create({
        type: NotificationType.CIRCLE_ADMIN_ACTION,
        from: adminId,
        to: newGuruId,
        circle: circle._id,
        message: `You have been assigned as the new guru of "${circle.name}" circle by an administrator`,
      });
      
      // Notify all circle members about the guru change
      const newGuru = await User.findById(newGuruId);
      if (newGuru && circle.members.length > 0) {
        for (const memberId of circle.members) {
          // Skip notifications to the new guru, old guru, and the admin
          if (memberId.toString() === newGuruId.toString() || 
              memberId.toString() === currentGuru._id.toString() ||
              memberId.toString() === adminId.toString()) {
            continue;
          }
          
          await Notification.create({
            type: NotificationType.CIRCLE_ADMIN_ACTION,
            from: adminId,
            to: memberId,
            circle: circle._id,
            message: `${newGuru.username} is now the new guru of "${circle.name}" circle`,
          });
        }
      }
    } else {
      // If admin becomes the guru, notify all members
      const admin = await User.findById(adminId);
      if (admin && circle.members.length > 0) {
        for (const memberId of circle.members) {
          // Skip notifications to the old guru and the admin
          if (memberId.toString() === currentGuru._id.toString() ||
              memberId.toString() === adminId.toString()) {
            continue;
          }
          
          await Notification.create({
            type: NotificationType.CIRCLE_ADMIN_ACTION,
            from: adminId,
            to: memberId,
            circle: circle._id,
            message: `${admin.username} (admin) is now the new guru of "${circle.name}" circle`,
          });
        }
      }
    }

    res.status(200).json({
      status: "success",
      message: "Circle guru updated successfully",
      data: {
        circle,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Admin remove content (post, comment) from circle
export const removeCircleContent = async (req: Request, res: Response) => {
  try {
    const { contentId, contentType } = req.body;
    const adminId = req.user?._id;

    // Check if user is the main admin
    const isMainAdmin = adminId && adminId.toString() === "682499455e350516d6b68915";
    
    if (!isMainAdmin) {
      const user = await User.findById(adminId);
      if (!user || !user.isAdmin) {
        return res.status(403).json({
          status: "error",
          message: "Only administrators can remove content",
        });
      }
    }

    if (!mongoose.Types.ObjectId.isValid(contentId)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid content ID",
      });
    }

    if (!["post", "comment"].includes(contentType)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid content type",
      });
    }

    let result;
    let contentOwner;
    let circleName;

    if (contentType === "post") {
      // Find the post
      const post = await CirclePost.findById(contentId);
      if (!post) {
        return res.status(404).json({
          status: "error",
          message: "Post not found",
        });
      }

      // Find the circle for notification
      const circle = await Circle.findById(post.circle);
      circleName = circle ? circle.name : "unknown circle";

      // Store the owner before deletion for notification
      contentOwner = post.user;

      // Delete the post
      result = await CirclePost.findByIdAndDelete(contentId);

      // Delete all comments associated with this post as well
      await CircleComment.deleteMany({ post: contentId });
      
    } else if (contentType === "comment") {
      // Find the comment
      const comment = await CircleComment.findById(contentId);
      if (!comment) {
        return res.status(404).json({
          status: "error",
          message: "Comment not found",
        });
      }

      // Find the post and circle for notification
      const post = await CirclePost.findById(comment.post);
      if (post) {
        const circle = await Circle.findById(post.circle);
        circleName = circle ? circle.name : "unknown circle";
      } else {
        circleName = "unknown circle";
      }

      // Store the owner before deletion for notification
      contentOwner = comment.user;

      // Delete the comment
      result = await CircleComment.findByIdAndDelete(contentId);
    }

    // Notify the content owner about removal
    if (contentOwner) {
      await Notification.create({
        type: NotificationType.CIRCLE_ADMIN_ACTION,
        from: adminId,
        to: contentOwner,
        message: `Your ${contentType} in "${circleName}" has been removed by an administrator`,
      });
    }

    res.status(200).json({
      status: "success",
      message: `${contentType} removed successfully`,
    });
  } catch (error: any) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Send invite for a user to become guru of a circle
export const inviteUserAsGuru = async (req: Request, res: Response) => {
  try {
    const { circleId, targetUserId } = req.body;
    const adminId = req.user?._id;

    // Check if user is the main admin
    const isMainAdmin = adminId && adminId.toString() === "682499455e350516d6b68915";
    
    if (!isMainAdmin) {
      const user = await User.findById(adminId);
      if (!user || !user.isAdmin) {
        return res.status(403).json({
          status: "error",
          message: "Only administrators can invite gurus",
        });
      }
    }

    // Debug log the IDs and their validation results
    console.log('Validating IDs:', {
      circleId,
      targetUserId,
      circleIdType: typeof circleId,
      targetUserIdType: typeof targetUserId,
      isCircleIdValid: mongoose.Types.ObjectId.isValid(circleId),
      isTargetUserIdValid: mongoose.Types.ObjectId.isValid(targetUserId)
    });

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

    // Check if target user exists
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    // Check if there's a pending invite
    const existingInvite = await CircleRequest.findOne({
      from: adminId,
      to: targetUserId,
      circle: circleId,
      type: RequestType.GURU_INVITE,
      status: RequestStatus.PENDING,
    });

    if (existingInvite) {
      return res.status(400).json({
        status: "error",
        message: "You have already sent an invite to this user for this circle",
      });
    }

    // Create guru invite request
    const invite = await CircleRequest.create({
      type: RequestType.GURU_INVITE,
      from: adminId,
      to: targetUserId,
      circle: circleId,
      reason: `You've been invited to become guru of the "${circle.name}" circle`,
    });

    // Create notification for target user
    await Notification.create({
      type: NotificationType.CIRCLE_GURU_INVITE,
      from: adminId,
      to: targetUserId,
      circle: circleId,
      message: `You've been invited to become guru of the "${circle.name}" circle`,
    });
    
    // Inform current guru about potential replacement
    const currentGuru = await User.findById(circle.guru);
    if (currentGuru && currentGuru._id.toString() !== targetUserId.toString()) {
      await Notification.create({
        type: NotificationType.CIRCLE_ADMIN_ACTION,
        from: adminId,
        to: currentGuru._id,
        circle: circleId,
        message: `An admin has invited another user to potentially become the new guru of "${circle.name}" circle`,
      });
    }
    
    // Get admin username for logging
    const admin = await User.findById(adminId);
    console.log(`Admin ${admin?.username} (${adminId}) sent guru invite to user ${targetUserId} for circle "${circle.name}" (${circleId})`);

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

// Process guru invite (accept/reject)
export const processGuruInvite = async (req: Request, res: Response) => {
  try {
    const { inviteId, status } = req.body;
    const userId = req.user?._id;

    // Debug log user and invite details
    console.log('Processing guru invite:', {
      inviteId,
      status,
      requestingUserId: userId
    });

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
    console.log('Search result:', {
      inviteFound: !!invite,
      inviteType: invite?.type,
      expectedType: RequestType.GURU_INVITE,
      inviteDetails: invite
    });

    if (!invite || invite.type !== RequestType.GURU_INVITE) {
      return res.status(404).json({
        status: "error",
        message: "Guru invite not found",
        debug: { 
          inviteExists: !!invite, 
          inviteType: invite?.type,
          expectedType: RequestType.GURU_INVITE 
        }
      });
    }

    // Debug log invite details
    console.log('Found invite:', {
      inviteToUserId: invite.to?.toString(),
      requestingUserId: userId?.toString(),
      isMatch: invite.to?.toString() === userId?.toString()
    });

    // Check if user is the invite recipient
    if (invite.to?.toString() !== userId?.toString()) {
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

    if (status === RequestStatus.APPROVED) {
      // Get current guru details
      const currentGuru = await User.findById(circle.guru);

      // Update circle with new guru
      const oldGuruId = circle.guru;
      circle.guru = userId;
      await circle.save();

      // Add circle to new guru's list of guru circles
      await User.findByIdAndUpdate(userId, {
        $addToSet: { isGuru: circle._id },
      });

      // Remove circle from old guru's list of guru circles
      if (oldGuruId) {
        await User.findByIdAndUpdate(oldGuruId, {
          $pull: { isGuru: circle._id },
        });
      }

      // Make sure the new guru is a member of the circle
      if (!circle.members.includes(userId)) {
        circle.members.push(userId);
        await circle.save();

        // Add circle to user's joined circles as well
        await User.findByIdAndUpdate(userId, {
          $addToSet: { joinedCircles: circle._id },
        });
      }

      // Notify admin that invite was accepted
      await Notification.create({
        type: NotificationType.CIRCLE_REQUEST_ACCEPTED,
        from: userId,
        to: invite.from,
        circle: circle._id,
        message: `User has accepted your invitation to become guru of "${circle.name}"`,
      });

      // Notify the old guru if they exist
      if (currentGuru) {
        await Notification.create({
          type: NotificationType.CIRCLE_ADMIN_ACTION,
          from: invite.from,
          to: currentGuru._id,
          circle: circle._id,
          message: `You are no longer the guru of "${circle.name}" circle, a new guru has been appointed`,
        });
      }
    } else if (status === RequestStatus.REJECTED) {
      // Notify admin that invite was rejected
      await Notification.create({
        type: NotificationType.CIRCLE_REQUEST_REJECTED,
        from: userId,
        to: invite.from,
        circle: circle._id,
        message: `User has declined your invitation to become guru of "${circle.name}"`,
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
