import { Request, Response } from "express";
import mongoose from "mongoose";
import Ritual, { RitualVisibility, RitualFrequency } from "../models/ritualModel";
import Adoption, { AdoptionStatus } from "../models/adoptionModel";
import User from "../models/userModel";
import Circle from "../models/circleModel";
import Interaction, { ContentType } from "../models/interactionModel";
import Notification, { NotificationType } from "../models/notificationModel";

// Helper to create notifications
const createNotification = async (
  type: NotificationType,
  fromUserId: mongoose.Types.ObjectId,
  toUserId: mongoose.Types.ObjectId,
  ritualId: mongoose.Types.ObjectId,
  message: string
) => {
  await Notification.create({
    type,
    from: fromUserId,
    to: toUserId,
    ritual: ritualId,
    message,
  });
};

// Create a new ritual
export const createRitual = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    const { 
      title, 
      description, 
      frequency, 
      duration, 
      visibility, 
      circleId,
      linkedPostId,
      tags
    } = req.body;
    
    // Validate frequency
    if (!Object.values(RitualFrequency).includes(frequency as RitualFrequency)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid frequency",
      });
    }
    
    // Validate visibility
    if (!Object.values(RitualVisibility).includes(visibility as RitualVisibility)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid visibility",
      });
    }
    
    // If ritual is for a circle, verify circle exists and user is a member
    if (visibility === RitualVisibility.CIRCLE) {
      if (!circleId) {
        return res.status(400).json({
          status: "error",
          message: "Circle ID is required for circle rituals",
        });
      }
      
      const circle = await Circle.findById(circleId);
      
      if (!circle) {
        return res.status(404).json({
          status: "error",
          message: "Circle not found",
        });
      }
      
      const isMember = circle.members.includes(userId);
      
      if (!isMember) {
        return res.status(403).json({
          status: "error",
          message: "You must be a member of the circle to create a ritual for it",
        });
      }
    }
    
    // Check if there are uploaded files
    const files = req.files as Express.Multer.File[] | undefined;
    let mediaUrls: string[] = [];
    let mediaType = "none";
    
    if (files && files.length > 0) {
      mediaUrls = files.map(file => file.path);
      // Determine media type based on the first file
      const mimeType = files[0].mimetype;
      if (mimeType.startsWith('image/')) {
        mediaType = "image";
      } else if (mimeType.startsWith('video/')) {
        mediaType = "video";
      }
    }
    
    // Create the ritual
    const ritual = await Ritual.create({
      creator: userId,
      title,
      description,
      frequency,
      duration,
      visibility,
      circle: visibility === RitualVisibility.CIRCLE ? circleId : undefined,
      linkedPost: linkedPostId,
      tags: tags ? tags.split(',').map((tag: string) => tag.trim()) : [],
      mediaUrls,
      mediaType,
    });
    
    // If ritual is created in a circle, update the circle
    if (visibility === RitualVisibility.CIRCLE && circleId) {
      // Add ritual to circle
      await Circle.findByIdAndUpdate(circleId, {
        $addToSet: { rituals: ritual._id as unknown as mongoose.Types.ObjectId }
      });

      // Recalculate circle rank
      let circle = await Circle.findById(circleId);
      if (circle) {
        await circle.calculateRank();
      }
      
      // Send notifications to circle members
      circle = await Circle.findById(circleId)
        .populate('members', '_id');
        
      if (circle) {
        for (const member of circle.members) {
          if (member._id.toString() !== userId.toString()) {
            await createNotification(
              NotificationType.RITUAL_CREATED,
              userId,
              member._id as mongoose.Types.ObjectId,
              ritual._id as unknown as mongoose.Types.ObjectId,
              `New ritual in your circle: ${title}`
            );
          }
        }
      }
    } else if (visibility === RitualVisibility.PUBLIC) {
      // For public rituals, we could notify followers or specific interested users
      // This would depend on the app's notification strategy
      // Here's a placeholder for that functionality
      
      // Example: Notify users who follow this creator
      // const followers = await User.find({
      //   following: userId
      // }).select('_id');
      
      // for (const follower of followers) {
      //   await createNotification(
      //     NotificationType.RITUAL_CREATED,
      //     userId,
      //     follower._id,
      //     ritual._id,
      //     `${user.username} created a new ritual: ${title}`
      //   );
      // }
    }
    
    res.status(201).json({
      status: "success",
      data: {
        ritual,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Get all rituals with filtering and pagination
export const getRituals = async (req: Request, res: Response) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      visibility, 
      circleId, 
      sortBy = 'latest',
      tags 
    } = req.query;
    
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;
    
    // Build query
    const query: any = {};
    
    // Filter by visibility
    if (visibility) {
      query.visibility = visibility;
      
      // If looking for circle rituals, filter by circleId if provided
      if (visibility === RitualVisibility.CIRCLE && circleId) {
        query.circle = circleId;
      }
    }
    
    // Filter by tags if provided
    if (tags) {
      query.tags = { $in: (tags as string).split(',').map(tag => tag.trim()) };
    }
    
    // Determine sort order
    let sortOption: any = { createdAt: -1 }; // Default: latest
    
    if (sortBy === 'popular') {
      sortOption = { 'stats.upvotes': -1 };
    } else if (sortBy === 'adoptions') {
      sortOption = { 'stats.adoptions': -1 };
    }
    
    // Get rituals with pagination
    const rituals = await Ritual.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum)
      .populate('creator', 'username profilePicture bio')
      .populate('circle', 'name image');
    
    // Get total count
    const total = await Ritual.countDocuments(query);
    
    res.status(200).json({
      status: "success",
      data: {
        rituals,
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

// Get single ritual by ID
export const getRitualById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;
    
    const ritual = await Ritual.findById(id)
      .populate('creator', 'username profilePicture bio')
      .populate('circle', 'name image');
    
    if (!ritual) {
      return res.status(404).json({
        status: "error",
        message: "Ritual not found",
      });
    }
    
    // Check if ritual is in a private circle and if user has access
    if (ritual.visibility === RitualVisibility.CIRCLE) {
      // Check if user is a member of the circle
      const circle = await Circle.findById(ritual.circle);
      
      if (!circle) {
        return res.status(404).json({
          status: "error",
          message: "Circle not found",
        });
      }
      
      const isMember = circle.members.includes(userId);
      
      if (!isMember) {
        return res.status(403).json({
          status: "error",
          message: "You do not have permission to view this ritual",
        });
      }
    }
    
    // Get comments for this ritual
    const comments = await Interaction.find({
      contentType: ContentType.RITUAL,
      contentId: ritual._id,
      type: 'comment',
    })
      .sort({ createdAt: -1 })
      .populate('user', 'username profilePicture');
    
    // Check if user has interacted with this ritual
    const userUpvote = await Interaction.findOne({
      user: userId,
      contentType: ContentType.RITUAL,
      contentId: ritual._id,
      type: 'upvote',
    });
    
    const userSave = await Interaction.findOne({
      user: userId,
      contentType: ContentType.RITUAL,
      contentId: ritual._id,
      type: 'save',
    });
    
    // Check if user has adopted this ritual
    const userAdoption = await Adoption.findOne({
      user: userId,
      ritual: ritual._id,
    });
    
    // Get adoption stats if user has adopted
    let adoptionStats = null;
    if (userAdoption) {
      adoptionStats = {
        status: userAdoption.status,
        progress: userAdoption.progress,
        startDate: userAdoption.startDate,
        completionDate: userAdoption.completionDate,
        abandonedDate: userAdoption.abandonedDate,
      };
    }
    
    res.status(200).json({
      status: "success",
      data: {
        ritual,
        comments,
        isUpvoted: !!userUpvote,
        isSaved: !!userSave,
        adoption: adoptionStats,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Update a ritual
export const updateRitual = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    const { id } = req.params;
    const { title, description, frequency, duration, tags } = req.body;
    
    // Find ritual and check ownership
    const ritual = await Ritual.findById(id);
    
    if (!ritual) {
      return res.status(404).json({
        status: "error",
        message: "Ritual not found",
      });
    }
    
    // Check if user is the creator of the ritual
    if (ritual.creator.toString() !== userId.toString()) {
      return res.status(403).json({
        status: "error",
        message: "You do not have permission to update this ritual",
      });
    }
    
    // Update ritual
    if (title) ritual.title = title;
    if (description) ritual.description = description;
    if (frequency) ritual.frequency = frequency;
    if (duration) ritual.duration = duration;
    if (tags) ritual.tags = tags.split(',').map((tag: string) => tag.trim());
    
    await ritual.save();
    
    // If ritual is in a circle, recalculate circle rank
    if (ritual.visibility === RitualVisibility.CIRCLE && ritual.circle) {
      const circle = await Circle.findById(ritual.circle);
      if (circle) {
        await circle.calculateRank();
      }
    }
    
    res.status(200).json({
      status: "success",
      data: {
        ritual,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Delete a ritual
export const deleteRitual = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    const { id } = req.params;
    
    // Find ritual and check ownership
    const ritual = await Ritual.findById(id);
    
    if (!ritual) {
      return res.status(404).json({
        status: "error",
        message: "Ritual not found",
      });
    }
    
    // Check if user is the creator of the ritual
    if (ritual.creator.toString() !== userId.toString()) {
      return res.status(403).json({
        status: "error",
        message: "You do not have permission to delete this ritual",
      });
    }
    
    // Store circle ID before deletion if it's a circle ritual
    const circleId = ritual.circle;
    
    // Delete the ritual
    await ritual.deleteOne();
    
    // Delete all interactions associated with this ritual
    await Interaction.deleteMany({
      contentType: ContentType.RITUAL,
      contentId: ritual._id,
    });
    
    // Delete all adoptions associated with this ritual
    await Adoption.deleteMany({
      ritual: ritual._id,
    });
    
    // If ritual was in a circle, remove it from circle and recalculate rank
    if (circleId) {
      await Circle.findByIdAndUpdate(circleId, {
        $pull: { rituals: ritual._id }
      });
      
      const circle = await Circle.findById(circleId);
      if (circle) {
        await circle.calculateRank();
      }
    }
    
    res.status(200).json({
      status: "success",
      message: "Ritual deleted successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Adopt a ritual
export const adoptRitual = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    const { ritualId } = req.params;
    
    // Find the ritual
    const ritual = await Ritual.findById(ritualId);
    
    if (!ritual) {
      return res.status(404).json({
        status: "error",
        message: "Ritual not found",
      });
    }
    
    // Check if ritual is in a private circle and if user has access
    if (ritual.visibility === RitualVisibility.CIRCLE) {
      // Check if user is a member of the circle
      const circle = await Circle.findById(ritual.circle);
      
      if (!circle) {
        return res.status(404).json({
          status: "error",
          message: "Circle not found",
        });
      }
      
      const isMember = circle.members.includes(userId);
      
      if (!isMember) {
        return res.status(403).json({
          status: "error",
          message: "You do not have permission to adopt this ritual",
        });
      }
    }
    
    // Check if user has already adopted this ritual
    const existingAdoption = await Adoption.findOne({
      user: userId,
      ritual: ritualId,
    });
    
    if (existingAdoption) {
      // If abandoned, reactivate it
      if (existingAdoption.status === AdoptionStatus.ABANDONED) {
        existingAdoption.status = AdoptionStatus.ACTIVE;
        existingAdoption.abandonedDate = undefined;
        existingAdoption.startDate = new Date();
        
        await existingAdoption.save();
        
        // Increment adoption count if reactivating
        await Ritual.findByIdAndUpdate(ritualId, {
          $inc: { 'stats.adoptions': 1 }
        });
        
        // If ritual is in a circle, recalculate circle rank
        if (ritual.circle) {
          const circle = await Circle.findById(ritual.circle);
          if (circle) {
            await circle.calculateRank();
          }
        }
        
        // Create notification for ritual creator
        const creatorId = ritual.creator;
        
        if (creatorId.toString() !== userId.toString()) {
          await createNotification(
            NotificationType.RITUAL_ADOPTED,
            userId,
            creatorId,
            ritual._id as unknown as mongoose.Types.ObjectId,
            `Someone readopted your ritual: ${ritual.title}`
          );
        }
        
        return res.status(200).json({
          status: "success",
          data: {
            adoption: existingAdoption,
            message: "Ritual readopted successfully",
          },
        });
      } else {
        return res.status(400).json({
          status: "error",
          message: "You have already adopted this ritual",
        });
      }
    }
    
    // Create new adoption
    const adoption = await Adoption.create({
      user: userId,
      ritual: ritualId,
      status: AdoptionStatus.ACTIVE,
      progress: 0,
      startDate: new Date(),
    });
    
    // Increment adoption count
    await Ritual.findByIdAndUpdate(ritualId, {
      $inc: { 'stats.adoptions': 1 }
    });
    
    // If ritual is in a circle, recalculate circle rank
    if (ritual.circle) {
      const circle = await Circle.findById(ritual.circle);
      if (circle) {
        await circle.calculateRank();
      }
    }
    
    // Create notification for ritual creator
    const creatorId = ritual.creator;
    
    if (creatorId.toString() !== userId.toString()) {        await createNotification(
          NotificationType.RITUAL_ADOPTED,
          userId,
          creatorId,
          ritual._id as unknown as mongoose.Types.ObjectId,
          `Someone adopted your ritual: ${ritual.title}`
      );
    }
    
    res.status(201).json({
      status: "success",
      data: {
        adoption,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Update adoption progress
export const updateAdoptionProgress = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    const { adoptionId } = req.params;
    const { progress } = req.body;
    
    // Validate progress
    if (progress < 0 || progress > 100) {
      return res.status(400).json({
        status: "error",
        message: "Progress must be between 0 and 100",
      });
    }
    
    // Find the adoption
    const adoption = await Adoption.findById(adoptionId);
    
    if (!adoption) {
      return res.status(404).json({
        status: "error",
        message: "Adoption not found",
      });
    }
    
    // Check if user is the adopter
    if (adoption.user.toString() !== userId.toString()) {
      return res.status(403).json({
        status: "error",
        message: "You do not have permission to update this adoption",
      });
    }
    
    // Check if adoption is active
    if (adoption.status !== AdoptionStatus.ACTIVE) {
      return res.status(400).json({
        status: "error",
        message: `Cannot update progress for ${adoption.status} adoption`,
      });
    }
    
    // Update progress
    adoption.progress = progress;
    
    // If progress is 100%, mark as completed
    if (progress === 100) {
      adoption.status = AdoptionStatus.COMPLETED;
      adoption.completionDate = new Date();
      
      // Create notification for ritual creator
      const ritual = await Ritual.findById(adoption.ritual);
      if (ritual) {
        const creatorId = ritual.creator;
        
        if (creatorId.toString() !== userId.toString()) {
          await createNotification(
            NotificationType.RITUAL_COMPLETED,
            userId,
            creatorId,
            ritual._id as unknown as mongoose.Types.ObjectId,
            `Someone completed your ritual: ${ritual.title}`
          );
        }
        
        // If ritual is in a circle, recalculate circle rank
        if (ritual.circle) {
          const circle = await Circle.findById(ritual.circle);
          if (circle) {
            await circle.calculateRank();
          }
        }
      }
    }
    
    await adoption.save();
    
    res.status(200).json({
      status: "success",
      data: {
        adoption,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Abandon a ritual adoption
export const abandonAdoption = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    const { adoptionId } = req.params;
    
    // Find the adoption
    const adoption = await Adoption.findById(adoptionId);
    
    if (!adoption) {
      return res.status(404).json({
        status: "error",
        message: "Adoption not found",
      });
    }
    
    // Check if user is the adopter
    if (adoption.user.toString() !== userId.toString()) {
      return res.status(403).json({
        status: "error",
        message: "You do not have permission to abandon this adoption",
      });
    }
    
    // Check if adoption is active
    if (adoption.status !== AdoptionStatus.ACTIVE) {
      return res.status(400).json({
        status: "error",
        message: `Cannot abandon ${adoption.status} adoption`,
      });
    }
    
    // Update status to abandoned
    adoption.status = AdoptionStatus.ABANDONED;
    adoption.abandonedDate = new Date();
    
    await adoption.save();
    
    // Decrement adoption count
    await Ritual.findByIdAndUpdate(adoption.ritual, {
      $inc: { 'stats.adoptions': -1 }
    });
    
    // If ritual is in a circle, recalculate circle rank
    const ritual = await Ritual.findById(adoption.ritual);
    if (ritual && ritual.circle) {
      const circle = await Circle.findById(ritual.circle);
      if (circle) {
        await circle.calculateRank();
      }
    }
    
    // Create notification for ritual creator
    if (ritual) {
      const creatorId = ritual.creator;
      
      if (creatorId.toString() !== userId.toString()) {
        await createNotification(
          NotificationType.RITUAL_ABANDONED,
          userId,
          creatorId,
          ritual._id as unknown as mongoose.Types.ObjectId,
          `Someone abandoned your ritual: ${ritual.title}`
        );
      }
    }
    
    res.status(200).json({
      status: "success",
      data: {
        adoption,
        message: "Ritual abandoned successfully",
      },
    });
  } catch (error: any) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Get user's adoptions
export const getUserAdoptions = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    const { status, page = 1, limit = 10 } = req.query;
    
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;
    
    // Build query
    const query: any = { user: userId };
    
    // Filter by status if provided
    if (status && Object.values(AdoptionStatus).includes(status as AdoptionStatus)) {
      query.status = status;
    }
    
    // Get adoptions with pagination
    const adoptions = await Adoption.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate({
        path: 'ritual',
        select: 'title description frequency duration stats',
        populate: {
          path: 'creator',
          select: 'username profilePicture',
        },
      });
    
    // Get total count
    const total = await Adoption.countDocuments(query);
    
    res.status(200).json({
      status: "success",
      data: {
        adoptions,
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
