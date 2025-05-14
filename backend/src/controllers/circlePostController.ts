import { Request, Response } from "express";
import mongoose from "mongoose";
import CirclePost, { ICirclePost, PostType } from "../models/circlePostModel";
import CircleComment from "../models/circleCommentModel";
import Circle from "../models/circleModel";
import User from "../models/userModel";
import Notification, { NotificationType } from "../models/notificationModel";
import { socketManager } from "../server";
import { createNotification } from "./notificationController";

// Get all posts for a circle
export const getCirclePosts = async (req: Request, res: Response) => {
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

    // Check if user is a member
    const isMember =
      userId &&
      (circle.members.some(
        (member) => member.toString() === userId.toString()
      ) ||
        circle.guru.toString() === userId.toString());

    if (!isMember) {
      return res.status(403).json({
        status: "error",
        message: "You must be a member of this circle to view posts",
      });
    }

    // Get posts with populated data
    const posts = await CirclePost.find({
      circle: circleId,
      isArchived: false,
    })
      .sort({ createdAt: -1 })
      .populate("user", "username name profilePicture")
      .populate({
        path: "comments",
        options: { limit: 3, sort: { createdAt: -1 } },
        populate: {
          path: "user",
          select: "username name profilePicture",
        },
      });

    // Process posts to handle anonymous ones
    const processedPosts = posts.map((post) => {
      if (post.isAnonymous && post.user._id.toString() !== userId?.toString()) {
        const anonymousPost = post.toObject();
        // Use type assertion to fix TypeScript error
        anonymousPost.user = {
          _id: post.user._id, // Keep the ID but anonymize other data
          username: "Anonymous",
          name: "Anonymous",
          profilePicture: "default-anonymous.jpg",
        } as any;
        return anonymousPost;
      }
      return post;
    });

    res.status(200).json({
      status: "success",
      data: {
        posts: processedPosts,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Create a new post in a circle
export const createCirclePost = async (req: Request, res: Response) => {
  try {
    const { circleId, type, content, isAnonymous } = req.body;
    const media = req.files
      ? (req.files as Express.Multer.File[]).map((file) => file.path)
      : [];
    const userId = req.user?._id;

    if (!mongoose.Types.ObjectId.isValid(circleId)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid circle ID",
      });
    }

    if (!Object.values(PostType).includes(type as PostType)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid post type",
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
    const isMember =
      circle.members.some(
        (member) => member.toString() === userId.toString()
      ) || circle.guru.toString() === userId.toString();

    if (!isMember) {
      return res.status(403).json({
        status: "error",
        message: "You must be a member of this circle to create posts",
      });
    }

    // Create the post
    const post = await CirclePost.create({
      type,
      content,
      media,
      user: userId,
      circle: circleId,
      isAnonymous: isAnonymous || false,
    });

    // Add post to circle's posts
    await Circle.findByIdAndUpdate(circleId, {
      $push: { posts: post._id },
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

// Get a single post by ID
export const getPostById = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const userId = req.user?._id;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid post ID",
      });
    }

    // Get post with populated data
    const post = await CirclePost.findById(postId)
      .populate("user", "username name profilePicture")
      .populate("circle", "name image")
      .populate({
        path: "comments",
        populate: {
          path: "user",
          select: "username name profilePicture",
        },
      });

    if (!post) {
      return res.status(404).json({
        status: "error",
        message: "Post not found",
      });
    }

    // Check if user is a member of the circle
    const circle = await Circle.findById(post.circle);
    if (!circle) {
      return res.status(404).json({
        status: "error",
        message: "Circle not found",
      });
    }

    const isMember =
      userId &&
      (circle.members.some(
        (member) => member.toString() === userId.toString()
      ) ||
        circle.guru.toString() === userId.toString());

    if (!isMember) {
      return res.status(403).json({
        status: "error",
        message: "You must be a member of this circle to view this post",
      });
    }

    // Handle anonymous post
    if (post.isAnonymous && post.user._id.toString() !== userId?.toString()) {
      const anonymousPost = post.toObject();
      anonymousPost.user = {
        _id: post.user._id, // Preserve the ID
        username: "Anonymous",
        name: "Anonymous",
        profilePicture: "default-anonymous.jpg",
      } as any; // Type assertion to fix TypeScript error

      res.status(200).json({
        status: "success",
        data: {
          post: anonymousPost,
        },
      });
    } else {
      res.status(200).json({
        status: "success",
        data: {
          post,
        },
      });
    }
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
    const { postId } = req.params;
    const { content } = req.body;
    const userId = req.user?._id;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid post ID",
      });
    }

    // Find the post
    const post = await CirclePost.findById(postId);
    if (!post) {
      return res.status(404).json({
        status: "error",
        message: "Post not found",
      });
    }

    // Check if user is the post creator
    if (post.user.toString() !== userId?.toString()) {
      return res.status(403).json({
        status: "error",
        message: "You can only update your own posts",
      });
    }

    // Update post
    post.content = content;
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

// Delete or archive a post
export const deletePost = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const { action } = req.query; // 'delete' or 'archive'
    const userId = req.user?._id;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid post ID",
      });
    }

    // Find the post
    const post = await CirclePost.findById(postId);
    if (!post) {
      return res.status(404).json({
        status: "error",
        message: "Post not found",
      });
    }

    // Check if user is the post creator or circle guru
    const circle = await Circle.findById(post.circle);
    if (!circle) {
      return res.status(404).json({
        status: "error",
        message: "Circle not found",
      });
    }

    const isCreator = post.user.toString() === userId?.toString();
    const isGuru = circle.guru.toString() === userId?.toString();

    if (!isCreator && !isGuru) {
      return res.status(403).json({
        status: "error",
        message:
          "You can only delete/archive your own posts or as the circle guru",
      });
    }

    // Handle action
    if (action === "delete") {
      // Remove post from circle's posts
      await Circle.findByIdAndUpdate(post.circle, {
        $pull: { posts: postId },
      });

      // Delete comments associated with post
      await CircleComment.deleteMany({ post: postId });

      // Delete post
      await CirclePost.findByIdAndDelete(postId);

      res.status(200).json({
        status: "success",
        message: "Post deleted successfully",
      });
    } else {
      // Archive post
      post.isArchived = true;
      await post.save();

      res.status(200).json({
        status: "success",
        message: "Post archived successfully",
        data: {
          post,
        },
      });
    }
  } catch (error: any) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Upvote a post
export const upvotePost = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const userId = req.user?._id;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid post ID",
      });
    }

    // Find post
    const post = await CirclePost.findById(postId);
    if (!post) {
      return res.status(404).json({
        status: "error",
        message: "Post not found",
      });
    }

    // Check if user is a member of the circle
    const circle = await Circle.findById(post.circle);
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
        message: "You must be a member of this circle to upvote posts",
      });
    }

    // Check if user has already upvoted
    const alreadyUpvoted = post.upvotes.some(
      (upvote) => upvote.toString() === userId?.toString()
    );

    // Check if user has already downvoted
    const alreadyDownvoted = post.downvotes.some(
      (downvote) => downvote.toString() === userId?.toString()
    );

    if (alreadyUpvoted) {
      // Remove upvote
      await CirclePost.findByIdAndUpdate(postId, {
        $pull: { upvotes: userId },
      });

      res.status(200).json({
        status: "success",
        message: "Upvote removed",
      });
    } else {
      // If already downvoted, remove from downvotes
      if (alreadyDownvoted) {
        await CirclePost.findByIdAndUpdate(postId, {
          $pull: { downvotes: userId },
        });
      }

      // Add upvote
      await CirclePost.findByIdAndUpdate(postId, {
        $addToSet: { upvotes: userId },
      });

      // Create notification for post creator, unless they're upvoting their own post
      if (post.user.toString() !== userId?.toString()) {
        await Notification.create({
          type: NotificationType.POST_UPVOTE,
          from: userId,
          to: post.user,
          post: postId,
          circle: post.circle,
          message: "Someone upvoted your post",
        });
      }

      // Update circle rank
      await circle.calculateRank();

      res.status(200).json({
        status: "success",
        message: "Post upvoted successfully",
      });
    }
  } catch (error: any) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Downvote a post
export const downvotePost = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const userId = req.user?._id;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid post ID",
      });
    }

    // Find post
    const post = await CirclePost.findById(postId);
    if (!post) {
      return res.status(404).json({
        status: "error",
        message: "Post not found",
      });
    }

    // Check if user is a member of the circle
    const circle = await Circle.findById(post.circle);
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
        message: "You must be a member of this circle to downvote posts",
      });
    }

    // Check if user has already downvoted
    const alreadyDownvoted = post.downvotes.some(
      (downvote) => downvote.toString() === userId?.toString()
    );

    // Check if user has already upvoted
    const alreadyUpvoted = post.upvotes.some(
      (upvote) => upvote.toString() === userId?.toString()
    );

    if (alreadyDownvoted) {
      // Remove downvote
      await CirclePost.findByIdAndUpdate(postId, {
        $pull: { downvotes: userId },
      });

      res.status(200).json({
        status: "success",
        message: "Downvote removed",
      });
    } else {
      // If already upvoted, remove from upvotes
      if (alreadyUpvoted) {
        await CirclePost.findByIdAndUpdate(postId, {
          $pull: { upvotes: userId },
        });
      }

      // Add downvote
      await CirclePost.findByIdAndUpdate(postId, {
        $addToSet: { downvotes: userId },
      });

      // Create notification for post creator, unless they're downvoting their own post
      if (post.user.toString() !== userId?.toString()) {
        await Notification.create({
          type: NotificationType.POST_DOWNVOTE,
          from: userId,
          to: post.user,
          post: postId,
          circle: post.circle,
          message: "Someone downvoted your post",
        });
      }

      res.status(200).json({
        status: "success",
        message: "Post downvoted successfully",
      });
    }
  } catch (error: any) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Save a post
export const savePost = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const userId = req.user?._id;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid post ID",
      });
    }

    // Find post
    const post = await CirclePost.findById(postId);
    if (!post) {
      return res.status(404).json({
        status: "error",
        message: "Post not found",
      });
    }

    // Check if user is a member of the circle
    const circle = await Circle.findById(post.circle);
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
        message: "You must be a member of this circle to save posts",
      });
    }

    // Check if user has already saved the post
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    const alreadySaved = user.savedPosts.some(
      (saved: any) => saved.toString() === postId
    );

    if (alreadySaved) {
      // Remove from saved posts
      await User.findByIdAndUpdate(userId, {
        $pull: { savedPosts: postId },
      });

      res.status(200).json({
        status: "success",
        message: "Post removed from saved",
      });
    } else {
      // Add to saved posts
      await User.findByIdAndUpdate(userId, {
        $addToSet: { savedPosts: postId },
      });

      // Create notification for post creator, unless they're saving their own post
      if (post.user.toString() !== userId?.toString()) {
        await Notification.create({
          type: NotificationType.POST_SAVE,
          from: userId,
          to: post.user,
          post: postId,
          circle: post.circle,
          message: "Someone saved your post",
        });
      }

      res.status(200).json({
        status: "success",
        message: "Post saved successfully",
      });
    }
  } catch (error: any) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Share a post to another circle
export const sharePost = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const { targetCircleId, content } = req.body;
    const userId = req.user?._id;

    if (
      !mongoose.Types.ObjectId.isValid(postId) ||
      !mongoose.Types.ObjectId.isValid(targetCircleId)
    ) {
      return res.status(400).json({
        status: "error",
        message: "Invalid IDs",
      });
    }

    // Find original post
    const originalPost = await CirclePost.findById(postId);
    if (!originalPost) {
      return res.status(404).json({
        status: "error",
        message: "Post not found",
      });
    }

    // Check if target circle exists
    const targetCircle = await Circle.findById(targetCircleId);
    if (!targetCircle) {
      return res.status(404).json({
        status: "error",
        message: "Target circle not found",
      });
    }

    // Check if user is a member of both circles
    const isSourceMember =
      originalPost.circle.toString() !== targetCircleId.toString() &&
      ((await Circle.findById(originalPost.circle))?.members.some(
        (member) => member.toString() === userId?.toString()
      ) ||
        (await Circle.findById(originalPost.circle))?.guru.toString() ===
          userId?.toString());

    const isTargetMember =
      targetCircle.members.some(
        (member) => member.toString() === userId?.toString()
      ) || targetCircle.guru.toString() === userId?.toString();

    if (!isSourceMember || !isTargetMember) {
      return res.status(403).json({
        status: "error",
        message: "You must be a member of both circles to share posts",
      });
    }

    // Create the shared post
    const sharedPost = await CirclePost.create({
      type: originalPost.type,
      content: content || `Shared: ${originalPost.content}`,
      media: originalPost.media,
      user: userId,
      circle: targetCircleId,
      sharedFrom: originalPost._id,
      isAnonymous: false,
    });

    // Add post to target circle's posts
    await Circle.findByIdAndUpdate(targetCircleId, {
      $push: { posts: sharedPost._id },
    });

    // Create notification for original post creator, unless they're sharing their own post
    if (originalPost.user.toString() !== userId?.toString()) {
      await Notification.create({
        type: NotificationType.POST_SHARE,
        from: userId,
        to: originalPost.user,
        post: originalPost._id,
        circle: originalPost.circle,
        message: `Someone shared your post to another circle`,
      });
    }

    res.status(201).json({
      status: "success",
      data: {
        sharedPost,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Get user's saved posts
export const getSavedPosts = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;

    // Get user with populated saved posts
    const user = await User.findById(userId).populate({
      path: "savedPosts",
      populate: [
        {
          path: "user",
          select: "username name profilePicture",
        },
        {
          path: "circle",
          select: "name",
        },
      ],
    });

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    // Process posts to handle anonymous ones
    const processedPosts = user.savedPosts.map((post: any) => {
      const postObj = post.toObject();
      // Check if post has user property and it's a document with _id
      if (
        post.isAnonymous &&
        post.user &&
        post.user._id &&
        post.user._id.toString() !== userId?.toString()
      ) {
        postObj.user = {
          _id: post.user._id, // Keep the ID but anonymize other data
          username: "Anonymous",
          name: "Anonymous",
          profilePicture: "default-anonymous.jpg",
        } as any;
      }
      return postObj;
    });

    res.status(200).json({
      status: "success",
      data: {
        savedPosts: processedPosts,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
