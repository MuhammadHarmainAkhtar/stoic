import { Request, Response } from "express";
import mongoose from "mongoose";
import Interaction, { InteractionType, ContentType, ShareTargetType } from "../models/interactionModel";
import Post from "../models/postModel";
import Ritual from "../models/ritualModel";
import User from "../models/userModel";
import Circle from "../models/circleModel";
import Notification, { NotificationType } from "../models/notificationModel";

// Helper to update content stats
const updateContentStats = async (
  contentType: ContentType,
  contentId: mongoose.Types.ObjectId,
  interactionType: InteractionType,
  increment: boolean = true
) => {
  const updateValue = increment ? 1 : -1;
  
  const updateField = (() => {
    switch (interactionType) {
      case InteractionType.UPVOTE:
        return 'stats.upvotes';
      case InteractionType.DOWNVOTE:
        return 'stats.downvotes';
      case InteractionType.COMMENT:
        return 'stats.comments';
      case InteractionType.SHARE:
        return 'stats.shares';
      case InteractionType.SAVE:
        return 'stats.saves';
      case InteractionType.REPORT:
        return 'stats.reports';
      default:
        return null;
    }
  })();
  
  if (updateField) {
    if (contentType === ContentType.POST) {
      await Post.findByIdAndUpdate(
        contentId,
        { $inc: { [updateField]: updateValue } }
      );
    } else {
      await Ritual.findByIdAndUpdate(
        contentId,
        { $inc: { [updateField]: updateValue } }
      );
    }
  }
};

// Helper to create notifications
const createNotification = async (
  type: NotificationType,
  fromUserId: mongoose.Types.ObjectId,
  toUserId: mongoose.Types.ObjectId,
  contentType: ContentType,
  contentId: mongoose.Types.ObjectId,
  message?: string
) => {
  const notificationData: any = {
    type,
    from: fromUserId,
    to: toUserId,
    message: message || "",
  };
  
  // Set the appropriate content field
  if (contentType === ContentType.POST) {
    notificationData.post = contentId;
  } else if (contentType === ContentType.RITUAL) {
    notificationData.ritual = contentId;
  }
  
  await Notification.create(notificationData);
};

// Create an interaction (upvote, downvote, save)
export const createInteraction = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    const { contentType, contentId, type } = req.body;
    
    // Validate contentType
    if (!Object.values(ContentType).includes(contentType)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid content type",
      });
    }
    
    // Validate interactionType
    if (!Object.values(InteractionType).includes(type)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid interaction type",
      });
    }
    
    // Validate that the content exists
    let content;
    if (contentType === ContentType.POST) {
      content = await Post.findById(contentId);
    } else {
      content = await Ritual.findById(contentId);
    }
    
    if (!content) {
      return res.status(404).json({
        status: "error",
        message: `${contentType} not found`,
      });
    }
    
    // Check if the interaction already exists
    const existingInteraction = await Interaction.findOne({
      user: userId,
      contentType,
      contentId,
      type,
    });
    
    if (existingInteraction) {
      // If interaction exists, remove it (toggle behavior)
      await existingInteraction.deleteOne();
      
      // Update content stats
      await updateContentStats(contentType, contentId, type, false);
      
      return res.status(200).json({
        status: "success",
        data: {
          action: "removed",
        },
      });
    }
    
    // If it's an upvote/downvote, check if the opposite exists and remove it
    if (type === InteractionType.UPVOTE || type === InteractionType.DOWNVOTE) {
      const oppositeType = type === InteractionType.UPVOTE ? InteractionType.DOWNVOTE : InteractionType.UPVOTE;
      
      const oppositeInteraction = await Interaction.findOne({
        user: userId,
        contentType,
        contentId,
        type: oppositeType,
      });
      
      if (oppositeInteraction) {
        await oppositeInteraction.deleteOne();
        await updateContentStats(contentType, contentId, oppositeType, false);
      }
    }
    
    // Create the interaction
    const interaction = await Interaction.create({
      user: userId,
      contentType,
      contentId,
      type,
    });
    
    // Update content stats
    await updateContentStats(contentType, contentId, type, true);
    
    // Create notification for the content creator if it's an upvote
    if (type === InteractionType.UPVOTE) {
      const creatorId = content.creator;
      
      if (creatorId.toString() !== userId.toString()) {
        const notificationType = contentType === ContentType.POST
          ? NotificationType.POST_UPVOTE
          : NotificationType.RITUAL_ADOPTED; // Using RITUAL_ADOPTED for ritual upvotes
        
        await createNotification(
          notificationType,
          userId,
          creatorId,
          contentType,
          contentId,
          `Someone liked your ${contentType}`
        );
      }
    }
    
    res.status(201).json({
      status: "success",
      data: {
        interaction,
        action: "added",
      },
    });
  } catch (error: any) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Add a comment to content
export const addComment = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    const { contentType, contentId, comment } = req.body;
    
    // Validate contentType
    if (!Object.values(ContentType).includes(contentType)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid content type",
      });
    }
    
    // Validate content exists
    let content;
    if (contentType === ContentType.POST) {
      content = await Post.findById(contentId);
    } else {
      content = await Ritual.findById(contentId);
    }
    
    if (!content) {
      return res.status(404).json({
        status: "error",
        message: `${contentType} not found`,
      });
    }
    
    // Create comment interaction
    const interaction = await Interaction.create({
      user: userId,
      contentType,
      contentId,
      type: InteractionType.COMMENT,
      comment,
    });
    
    // Update content stats
    await updateContentStats(contentType, contentId, InteractionType.COMMENT, true);
    
    // Load the user who commented
    const commentWithUser = await Interaction.findById(interaction._id)
      .populate('user', 'username profilePicture');
    
    // Create notification for the content creator
    const creatorId = content.creator;
    
    if (creatorId.toString() !== userId.toString()) {
      const notificationType = contentType === ContentType.POST
        ? NotificationType.POST_COMMENT
        : NotificationType.RITUAL_ADOPTED; // Using RITUAL_ADOPTED for ritual comments
      
      await createNotification(
        notificationType,
        userId,
        creatorId,
        contentType,
        contentId,
        comment.substring(0, 50) + (comment.length > 50 ? '...' : '')
      );
    }
    
    res.status(201).json({
      status: "success",
      data: {
        comment: commentWithUser,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Get comments for content
export const getComments = async (req: Request, res: Response) => {
  try {
    const { contentType, contentId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    // Validate contentType
    if (!Object.values(ContentType).includes(contentType as ContentType)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid content type",
      });
    }
    
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;
    
    // Get comments with pagination
    const comments = await Interaction.find({
      contentType,
      contentId,
      type: InteractionType.COMMENT,
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('user', 'username profilePicture');
    
    // Get total count
    const total = await Interaction.countDocuments({
      contentType,
      contentId,
      type: InteractionType.COMMENT,
    });
    
    res.status(200).json({
      status: "success",
      data: {
        comments,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(total / limitNum),
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

// Delete a comment
export const deleteComment = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    const { commentId } = req.params;
    
    // Find the comment
    const comment = await Interaction.findById(commentId);
    
    if (!comment || comment.type !== InteractionType.COMMENT) {
      return res.status(404).json({
        status: "error",
        message: "Comment not found",
      });
    }
    
    // Check if user is the creator of the comment
    if (comment.user.toString() !== userId.toString()) {
      return res.status(403).json({
        status: "error",
        message: "You do not have permission to delete this comment",
      });
    }
    
    // Delete the comment
    await comment.deleteOne();
    
    // Update content stats
    await updateContentStats(comment.contentType, comment.contentId, InteractionType.COMMENT, false);
    
    res.status(200).json({
      status: "success",
      message: "Comment deleted successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Report content
export const reportContent = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    const { contentType, contentId, reason } = req.body;
    
    // Validate contentType
    if (!Object.values(ContentType).includes(contentType)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid content type",
      });
    }
    
    // Validate content exists
    let content;
    if (contentType === ContentType.POST) {
      content = await Post.findById(contentId);
    } else {
      content = await Ritual.findById(contentId);
    }
    
    if (!content) {
      return res.status(404).json({
        status: "error",
        message: `${contentType} not found`,
      });
    }
    
    // Check if the user already reported this content
    const existingReport = await Interaction.findOne({
      user: userId,
      contentType,
      contentId,
      type: InteractionType.REPORT,
    });
    
    if (existingReport) {
      return res.status(400).json({
        status: "error",
        message: "You have already reported this content",
      });
    }
    
    // Create report interaction
    await Interaction.create({
      user: userId,
      contentType,
      contentId,
      type: InteractionType.REPORT,
      reportReason: reason,
    });
    
    // Update content stats
    await updateContentStats(contentType, contentId, InteractionType.REPORT, true);
    
    // TODO: Notify admin about the report
    
    res.status(201).json({
      status: "success",
      message: "Content reported successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Share content to a circle or user
export const shareContent = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    const { contentType, contentId, targetType, targetId } = req.body;
    
    // Validate contentType
    if (!Object.values(ContentType).includes(contentType)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid content type",
      });
    }
    
    // Validate targetType
    if (!Object.values(ShareTargetType).includes(targetType)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid target type",
      });
    }
    
    // Validate content exists
    let content;
    if (contentType === ContentType.POST) {
      content = await Post.findById(contentId);
    } else {
      content = await Ritual.findById(contentId);
    }
    
    if (!content) {
      return res.status(404).json({
        status: "error",
        message: `${contentType} not found`,
      });
    }
    
    // Validate target exists
    if (targetType === ShareTargetType.CIRCLE) {
      const circle = await Circle.findById(targetId);
      
      if (!circle) {
        return res.status(404).json({
          status: "error",
          message: "Circle not found",
        });
      }
      
      // Check if user is a member of the circle
      const isMember = circle.members.includes(userId);
      
      if (!isMember) {
        return res.status(403).json({
          status: "error",
          message: "You must be a member of the circle to share content to it",
        });
      }
    } else if (targetType === ShareTargetType.USER) {
      const user = await User.findById(targetId);
      
      if (!user) {
        return res.status(404).json({
          status: "error",
          message: "User not found",
        });
      }
    }
    
    // Create share interaction
    const interaction = await Interaction.create({
      user: userId,
      contentType,
      contentId,
      type: InteractionType.SHARE,
      shareTarget: {
        type: targetType,
        id: targetId,
      },
    });
    
    // Update content stats
    await updateContentStats(contentType, contentId, InteractionType.SHARE, true);
    
    // Create notification for the circle members or target user
    if (targetType === ShareTargetType.CIRCLE) {
      const circle = await Circle.findById(targetId);
      
      if (circle) {
        // Notify circle members (except the user who shared)
        // This would be handled differently in a production app (e.g., batch processing)
        // ...
      }
    } else if (targetType === ShareTargetType.USER) {
      // Notify the target user
      const notificationType = contentType === ContentType.POST
        ? NotificationType.POST_SHARE
        : NotificationType.RITUAL_CREATED; // Using RITUAL_CREATED for ritual shares
      
      await createNotification(
        notificationType,
        userId,
        targetId,
        contentType,
        contentId,
        `Someone shared a ${contentType} with you`
      );
    }
    
    res.status(201).json({
      status: "success",
      data: {
        interaction,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Get user's interactions with a specific content
export const getUserInteraction = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    const { contentType, contentId } = req.params;
    
    // Validate contentType
    if (!Object.values(ContentType).includes(contentType as ContentType)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid content type",
      });
    }
    
    // Get user's interactions with this content
    const interactions = await Interaction.find({
      user: userId,
      contentType,
      contentId,
    });
    
    // Transform to a more useful format
    const userInteractions = {
      isUpvoted: interactions.some(i => i.type === InteractionType.UPVOTE),
      isDownvoted: interactions.some(i => i.type === InteractionType.DOWNVOTE),
      isSaved: interactions.some(i => i.type === InteractionType.SAVE),
      isReported: interactions.some(i => i.type === InteractionType.REPORT),
      comments: interactions.filter(i => i.type === InteractionType.COMMENT),
      shares: interactions.filter(i => i.type === InteractionType.SHARE),
    };
    
    res.status(200).json({
      status: "success",
      data: {
        interactions: userInteractions,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
