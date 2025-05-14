import { Request, Response } from "express";
import mongoose from "mongoose";
import CircleComment, { ICircleComment } from "../models/circleCommentModel";
import CirclePost from "../models/circlePostModel";
import Circle from "../models/circleModel";
import Notification, { NotificationType } from "../models/notificationModel";
import { socketManager } from "../server";
import { createNotification } from "./notificationController";

// Get comments for a post
export const getPostComments = async (req: Request, res: Response) => {
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
        message: "You must be a member of this circle to view comments",
      });
    }

    // Get comments
    const comments = await CircleComment.find({ post: postId })
      .sort({ createdAt: -1 })
      .populate("user", "username name profilePicture");

    res.status(200).json({
      status: "success",
      data: {
        comments,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Add a comment to a post
export const addComment = async (req: Request, res: Response) => {
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

    if (!content || content.trim() === "") {
      return res.status(400).json({
        status: "error",
        message: "Comment content is required",
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
        message: "You must be a member of this circle to comment on posts",
      });
    }

    // Create comment
    const comment = await CircleComment.create({
      content,
      user: userId,
      post: postId,
    });

    // Add comment to post's comments
    await CirclePost.findByIdAndUpdate(postId, {
      $push: { comments: comment._id },
    });

    // Create notification for post creator, unless they're commenting on their own post
    if (post.user.toString() !== userId?.toString()) {
      await createNotification({
        type: NotificationType.POST_COMMENT,
        from: userId,
        to: post.user,
        post: postId,
        comment: comment._id,
        circle: post.circle,
        message: "Someone commented on your post",
      });

      // Also emit a socket event to update the UI in real-time for anyone viewing the post
      try {
        socketManager.io
          .to(`circle:${post.circle.toString()}`)
          .emit("post:new-comment", {
            postId,
            comment,
            user: comment.user,
          });
      } catch (error) {
        console.error("Error emitting comment socket event:", error);
      }
    }

    // Populate user for response
    await comment.populate("user", "username name profilePicture");

    res.status(201).json({
      status: "success",
      data: {
        comment,
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
    const { commentId } = req.params;
    const userId = req.user?._id;

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid comment ID",
      });
    }

    // Find comment
    const comment = await CircleComment.findById(commentId);
    if (!comment) {
      return res.status(404).json({
        status: "error",
        message: "Comment not found",
      });
    }

    // Check if user is the comment creator or circle guru
    const post = await CirclePost.findById(comment.post);
    if (!post) {
      return res.status(404).json({
        status: "error",
        message: "Post not found",
      });
    }

    const circle = await Circle.findById(post.circle);
    if (!circle) {
      return res.status(404).json({
        status: "error",
        message: "Circle not found",
      });
    }

    const isCreator = comment.user.toString() === userId?.toString();
    const isGuru = circle.guru.toString() === userId?.toString();
    const isPostCreator = post.user.toString() === userId?.toString();

    if (!isCreator && !isGuru && !isPostCreator) {
      return res.status(403).json({
        status: "error",
        message:
          "You can only delete your own comments, or comments on your post, or as the circle guru",
      });
    }

    // Remove comment from post's comments
    await CirclePost.findByIdAndUpdate(comment.post, {
      $pull: { comments: commentId },
    });

    // Delete comment
    await CircleComment.findByIdAndDelete(commentId);

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

// Upvote a comment
export const upvoteComment = async (req: Request, res: Response) => {
  try {
    const { commentId } = req.params;
    const userId = req.user?._id;

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid comment ID",
      });
    }

    // Find comment
    const comment = await CircleComment.findById(commentId);
    if (!comment) {
      return res.status(404).json({
        status: "error",
        message: "Comment not found",
      });
    }

    // Check if user is a member of the circle
    const post = await CirclePost.findById(comment.post);
    if (!post) {
      return res.status(404).json({
        status: "error",
        message: "Post not found",
      });
    }

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
        message: "You must be a member of this circle to upvote comments",
      });
    }

    // Check if user has already upvoted
    const alreadyUpvoted = comment.upvotes.some(
      (upvote) => upvote.toString() === userId?.toString()
    );

    if (alreadyUpvoted) {
      // Remove upvote
      await CircleComment.findByIdAndUpdate(commentId, {
        $pull: { upvotes: userId },
      });

      res.status(200).json({
        status: "success",
        message: "Upvote removed",
      });
    } else {
      // Add upvote
      await CircleComment.findByIdAndUpdate(commentId, {
        $addToSet: { upvotes: userId },
      });

      res.status(200).json({
        status: "success",
        message: "Comment upvoted successfully",
      });
    }
  } catch (error: any) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
