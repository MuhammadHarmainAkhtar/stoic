import { Request, Response } from "express";
import mongoose from "mongoose";
import Post, { PostMediaType } from "../models/postModel";
import User from "../models/userModel";
import Ritual from "../models/ritualModel";
import Interaction, { InteractionType, ContentType } from "../models/interactionModel";
import Notification, { NotificationType } from "../models/notificationModel";

// Helper to create notifications
const createNotification = async (
  type: NotificationType,
  fromUserId: mongoose.Types.ObjectId,
  toUserId: mongoose.Types.ObjectId,
  postId?: mongoose.Types.ObjectId,
  message?: string
) => {
  await Notification.create({
    type,
    from: fromUserId,
    to: toUserId,
    post: postId,
    message: message || "",
  });
};

// Create a new forum post
export const createPost = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    const { content, tags } = req.body;
    
    // Check if there are uploaded files
    const files = req.files as Express.Multer.File[] | undefined;
    let mediaUrls: string[] = [];
    let mediaType = PostMediaType.NONE;
    
    if (files && files.length > 0) {
      mediaUrls = files.map(file => file.path);
      // Determine media type based on the first file
      const mimeType = files[0].mimetype;
      if (mimeType.startsWith('image/')) {
        mediaType = PostMediaType.IMAGE;
      } else if (mimeType.startsWith('video/')) {
        mediaType = PostMediaType.VIDEO;
      }
    }
    
    // Create new post
    const post = await Post.create({
      creator: userId,
      content,
      mediaUrls,
      mediaType,
      tags: tags ? tags.split(',').map((tag: string) => tag.trim()) : [],
    });
    
    res.status(201).json({
      status: "success",
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

// Get all forum posts with pagination and filtering
export const getPosts = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, sortBy = 'latest', tags } = req.query;
    
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;
    
    // Build query
    const query: any = {};
    
    // Filter by tags if provided
    if (tags) {
      query.tags = { $in: (tags as string).split(',').map(tag => tag.trim()) };
    }
    
    // Determine sort order
    let sortOption: any = { createdAt: -1 }; // Default: latest
    
    if (sortBy === 'popular') {
      sortOption = { 'stats.upvotes': -1 };
    } else if (sortBy === 'comments') {
      sortOption = { 'stats.comments': -1 };
    }
    
    // Get posts with pagination
    const posts = await Post.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum)
      .populate('creator', 'username profilePicture bio');
    
    // Get total count
    const total = await Post.countDocuments(query);
    
    res.status(200).json({
      status: "success",
      data: {
        posts,
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

// Get single post by ID
export const getPostById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const post = await Post.findById(id)
      .populate('creator', 'username profilePicture bio');
    
    if (!post) {
      return res.status(404).json({
        status: "error",
        message: "Post not found",
      });
    }
    
    // Get comments for this post
    const comments = await Interaction.find({
      contentType: ContentType.POST,
      contentId: post._id,
      type: InteractionType.COMMENT,
    })
      .sort({ createdAt: -1 })
      .populate('user', 'username profilePicture');
    
    // Check if user has interacted with this post
    const userId = req.user?._id;
    const userUpvote = await Interaction.findOne({
      user: userId,
      contentType: ContentType.POST,
      contentId: post._id,
      type: InteractionType.UPVOTE,
    });
    
    const userSave = await Interaction.findOne({
      user: userId,
      contentType: ContentType.POST,
      contentId: post._id,
      type: InteractionType.SAVE,
    });
    
    // Find related rituals based on tags
    const relatedRituals = await Ritual.find({
      tags: { $in: post.tags },
      visibility: 'public',
    })
      .limit(3)
      .populate('creator', 'username profilePicture')
      .select('title description stats');
    
    res.status(200).json({
      status: "success",
      data: {
        post,
        comments,
        isUpvoted: !!userUpvote,
        isSaved: !!userSave,
        relatedRituals,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Update a post
export const updatePost = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    const { id } = req.params;
    const { content, tags } = req.body;
    
    // Find post and check ownership
    const post = await Post.findById(id);
    
    if (!post) {
      return res.status(404).json({
        status: "error",
        message: "Post not found",
      });
    }
    
    // Check if user is the creator of the post
    if (post.creator.toString() !== userId.toString()) {
      return res.status(403).json({
        status: "error",
        message: "You do not have permission to update this post",
      });
    }
    
    // Update post
    if (content) post.content = content;
    if (tags) post.tags = tags.split(',').map((tag: string) => tag.trim());
    
    await post.save();
    
    res.status(200).json({
      status: "success",
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

// Delete a post
export const deletePost = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    const { id } = req.params;
    
    // Find post and check ownership
    const post = await Post.findById(id);
    
    if (!post) {
      return res.status(404).json({
        status: "error",
        message: "Post not found",
      });
    }
    
    // Check if user is the creator of the post
    if (post.creator.toString() !== userId.toString()) {
      return res.status(403).json({
        status: "error",
        message: "You do not have permission to delete this post",
      });
    }
    
    // Delete the post
    await post.deleteOne();
    
    // Delete all interactions associated with this post
    await Interaction.deleteMany({
      contentType: ContentType.POST,
      contentId: post._id,
    });
    
    res.status(200).json({
      status: "success",
      message: "Post deleted successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Get posts by user
export const getUserPosts = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;
    
    // Get user's posts with pagination
    const posts = await Post.find({ creator: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('creator', 'username profilePicture bio');
    
    // Get total count
    const total = await Post.countDocuments({ creator: userId });
    
    res.status(200).json({
      status: "success",
      data: {
        posts,
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
