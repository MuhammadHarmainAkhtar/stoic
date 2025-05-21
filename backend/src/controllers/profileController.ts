import { Request, Response } from "express";
import mongoose from "mongoose";
import User from "../models/userModel";
import Post from "../models/postModel";
import Ritual from "../models/ritualModel";
import CirclePost from "../models/circlePostModel";
import Adoption from "../models/adoptionModel";

// Get user's profile data including saved items and activity
export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    
    // Get user with populated joined circles
    const user = await User.findById(userId)
      .select("-password")
      .populate("joinedCircles", "name description image")
      .populate("recentlyVisitedCircles", "name description image");
    
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

// Get user's saved posts (forum, circle posts, and rituals)
export const getSavedItems = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    const { page = 1, limit = 10, type } = req.query;
    
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }
    
    let savedItems: Array<any> = [];
    let total = 0;
    
    // Get items based on type
    if (!type || type === 'all') {
      // Get all saved items
      const savedForumPosts = await Post.find({
        _id: { $in: user.savedForumPosts },
      })
        .populate("creator", "username profilePicture")
        .sort({ createdAt: -1 });
      
      const savedCirclePosts = await CirclePost.find({
        _id: { $in: user.savedPosts },
      })
        .populate("creator", "username profilePicture")
        .populate("circle", "name")
        .sort({ createdAt: -1 });
      
      const savedRituals = await Ritual.find({
        _id: { $in: user.savedRituals },
      })
        .populate("creator", "username profilePicture")
        .sort({ createdAt: -1 });
      
      // Combine and add type field
      savedItems = [
        ...savedForumPosts.map(post => ({ ...post.toObject(), itemType: 'forumPost' })),
        ...savedCirclePosts.map(post => ({ ...post.toObject(), itemType: 'circlePost' })),
        ...savedRituals.map(ritual => ({ ...ritual.toObject(), itemType: 'ritual' })),
      ];
      
      // Sort by creation date
      savedItems.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      total = savedItems.length;
      savedItems = savedItems.slice(skip, skip + limitNum);
    } else if (type === 'forumPosts') {
      // Get only saved forum posts
      savedItems = await Post.find({
        _id: { $in: user.savedForumPosts },
      })
        .populate("creator", "username profilePicture")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum);
      
      total = await Post.countDocuments({
        _id: { $in: user.savedForumPosts },
      });
      
      savedItems = savedItems.map(item => ({ ...item.toObject(), itemType: 'forumPost' }));
    } else if (type === 'circlePosts') {
      // Get only saved circle posts
      savedItems = await CirclePost.find({
        _id: { $in: user.savedPosts },
      })
        .populate("creator", "username profilePicture")
        .populate("circle", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum);
      
      total = await CirclePost.countDocuments({
        _id: { $in: user.savedPosts },
      });
      
      savedItems = savedItems.map(item => ({ ...item.toObject(), itemType: 'circlePost' }));
    } else if (type === 'rituals') {
      // Get only saved rituals
      savedItems = await Ritual.find({
        _id: { $in: user.savedRituals },
      })
        .populate("creator", "username profilePicture")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum);
      
      total = await Ritual.countDocuments({
        _id: { $in: user.savedRituals },
      });
      
      savedItems = savedItems.map(item => ({ ...item.toObject(), itemType: 'ritual' }));
    }
    
    res.status(200).json({
      status: "success",
      data: {
        savedItems,
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

// Get user's archived content
export const getArchivedItems = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    const { page = 1, limit = 10, type } = req.query;
    
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }
    
    let archivedItems: Array<any> = [];
    let total = 0;
    
    // Get items based on type
    if (!type || type === 'all') {
      // Get all archived items
      const archivedPosts = await Post.find({
        _id: { $in: user.archivedPosts },
      })
        .sort({ createdAt: -1 });
      
      const archivedRituals = await Ritual.find({
        _id: { $in: user.archivedRituals },
      })
        .sort({ createdAt: -1 });
      
      // Combine and add type field
      archivedItems = [
        ...archivedPosts.map(post => ({ ...post.toObject(), itemType: 'post' })),
        ...archivedRituals.map(ritual => ({ ...ritual.toObject(), itemType: 'ritual' })),
      ];
      
      // Sort by creation date
      archivedItems.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      total = archivedItems.length;
      archivedItems = archivedItems.slice(skip, skip + limitNum);
    } else if (type === 'posts') {
      // Get only archived posts
      archivedItems = await Post.find({
        _id: { $in: user.archivedPosts },
      })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum);
      
      total = await Post.countDocuments({
        _id: { $in: user.archivedPosts },
      });
      
      archivedItems = archivedItems.map(item => ({ ...item.toObject(), itemType: 'post' }));
    } else if (type === 'rituals') {
      // Get only archived rituals
      archivedItems = await Ritual.find({
        _id: { $in: user.archivedRituals },
      })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum);
      
      total = await Ritual.countDocuments({
        _id: { $in: user.archivedRituals },
      });
      
      archivedItems = archivedItems.map(item => ({ ...item.toObject(), itemType: 'ritual' }));
    }
    
    res.status(200).json({
      status: "success",
      data: {
        archivedItems,
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

// Get user's activity (posts, rituals, and adoptions)
export const getUserActivity = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    const { page = 1, limit = 10, type } = req.query;
    
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;
    
    let activityItems: Array<any> = [];
    let total = 0;
    
    // Get items based on type
    if (!type || type === 'all') {
      // Get user's posts
      const userPosts = await Post.find({
        creator: userId,
        isArchived: false,
      })
        .sort({ createdAt: -1 });
      
      // Get user's rituals
      const userRituals = await Ritual.find({
        creator: userId,
        isArchived: false,
      })
        .sort({ createdAt: -1 });
      
      // Get user's ritual adoptions
      const userAdoptions = await Adoption.find({
        user: userId,
      })
        .populate({
          path: 'ritual',
          select: 'title description creator stats',
          populate: {
            path: 'creator',
            select: 'username profilePicture'
          }
        })
        .sort({ createdAt: -1 });
      
      // Combine and add type field
      activityItems = [
        ...userPosts.map(post => ({ ...post.toObject(), itemType: 'post' })),
        ...userRituals.map(ritual => ({ ...ritual.toObject(), itemType: 'ritual' })),
        ...userAdoptions.map(adoption => ({ ...adoption.toObject(), itemType: 'adoption' })),
      ];
      
      // Sort by creation date
      activityItems.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      total = activityItems.length;
      activityItems = activityItems.slice(skip, skip + limitNum);
    } else if (type === 'posts') {
      // Get only user's posts
      activityItems = await Post.find({
        creator: userId,
        isArchived: false,
      })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum);
      
      total = await Post.countDocuments({
        creator: userId,
        isArchived: false,
      });
      
      activityItems = activityItems.map(item => ({ ...item.toObject(), itemType: 'post' }));
    } else if (type === 'rituals') {
      // Get only user's rituals
      activityItems = await Ritual.find({
        creator: userId,
        isArchived: false,
      })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum);
      
      total = await Ritual.countDocuments({
        creator: userId,
        isArchived: false,
      });
      
      activityItems = activityItems.map(item => ({ ...item.toObject(), itemType: 'ritual' }));
    } else if (type === 'adoptions') {
      // Get only user's adoptions
      activityItems = await Adoption.find({
        user: userId,
      })
        .populate({
          path: 'ritual',
          select: 'title description creator stats',
          populate: {
            path: 'creator',
            select: 'username profilePicture'
          }
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum);
      
      total = await Adoption.countDocuments({
        user: userId,
      });
      
      activityItems = activityItems.map(item => ({ ...item.toObject(), itemType: 'adoption' }));
    }
    
    res.status(200).json({
      status: "success",
      data: {
        activityItems,
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

// Archive or unarchive a post
export const archivePost = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    const { postId } = req.params;
    const { archive } = req.body; // true to archive, false to unarchive
    
    // Check if post exists and belongs to the user
    const post = await Post.findOne({
      _id: postId,
      creator: userId,
    });
    
    if (!post) {
      return res.status(404).json({
        status: "error",
        message: "Post not found or you don't have permission to archive it",
      });
    }
    
    // Update the post's archive status
    post.isArchived = archive;
    await post.save();
    
    // Update the user's archived posts list
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }
    
    if (archive) {
      // Add to archived posts if not already there
      if (!user.archivedPosts.includes(post._id)) {
        user.archivedPosts.push(post._id);
      }
    } else {
      // Remove from archived posts
      const postId = post._id as mongoose.Types.ObjectId;
      user.archivedPosts = user.archivedPosts.filter(
        (id: mongoose.Types.ObjectId) => id.toString() !== postId.toString()
      );
    }
    
    await user.save();
    
    res.status(200).json({
      status: "success",
      message: archive ? "Post archived successfully" : "Post unarchived successfully",
      data: {
        post,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Archive or unarchive a ritual
export const archiveRitual = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    const { ritualId } = req.params;
    const { archive } = req.body; // true to archive, false to unarchive
    
    // Check if ritual exists and belongs to the user
    const ritual = await Ritual.findOne({
      _id: ritualId,
      creator: userId,
    });
    
    if (!ritual) {
      return res.status(404).json({
        status: "error",
        message: "Ritual not found or you don't have permission to archive it",
      });
    }
    
    // Update the ritual's archive status
    ritual.isArchived = archive;
    await ritual.save();
    
    // Update the user's archived rituals list
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }
    
    if (archive) {
      // Add to archived rituals if not already there
      if (!user.archivedRituals.includes(ritual._id)) {
        user.archivedRituals.push(ritual._id);
      }
    } else {
      // Remove from archived rituals
      const ritualId = ritual._id as mongoose.Types.ObjectId;
      user.archivedRituals = user.archivedRituals.filter(
        (id: mongoose.Types.ObjectId) => id.toString() !== ritualId.toString()
      );
    }
    
    await user.save();
    
    res.status(200).json({
      status: "success",
      message: archive ? "Ritual archived successfully" : "Ritual unarchived successfully",
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

// Update user's recently visited circles
export const updateRecentlyVisitedCircle = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    const { circleId } = req.params;
    
    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }
    
    // Check if the circle exists
    if (!mongoose.Types.ObjectId.isValid(circleId)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid circle ID",
      });
    }
    
    // Remove the circle if it's already in the recently visited list
    user.recentlyVisitedCircles = user.recentlyVisitedCircles.filter(
      (id: mongoose.Types.ObjectId) => id.toString() !== circleId
    );
    
    // Add the circle to the beginning of the list
    user.recentlyVisitedCircles.unshift(new mongoose.Types.ObjectId(circleId));
    
    // Keep only the 10 most recent
    if (user.recentlyVisitedCircles.length > 10) {
      user.recentlyVisitedCircles = user.recentlyVisitedCircles.slice(0, 10);
    }
    
    await user.save();
    
    res.status(200).json({
      status: "success",
      message: "Recently visited circles updated",
    });
  } catch (error: any) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};