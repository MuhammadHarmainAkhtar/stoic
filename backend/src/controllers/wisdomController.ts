import { Request, Response } from "express";
import mongoose from "mongoose";
import Circle from "../models/circleModel";
import Post from "../models/postModel";
import Ritual from "../models/ritualModel";
import Interaction, { ContentType, InteractionType } from "../models/interactionModel";
import User from "../models/userModel";
import Adoption from "../models/adoptionModel";

// Get top-ranked circles based on member count and engagement
export const getTopCircles = async (req: Request, res: Response) => {
  try {
    const { limit = 10 } = req.query;
    const limitNum = parseInt(limit as string);
    
    // Get circles with member count and total upvotes
    // First get all public circles
    const circles = await Circle.aggregate([
      {
        $match: { visibility: "public" } // Only include public circles
      },
      {
        $addFields: {
          memberCount: { $size: "$members" }
        }
      },
      {
        $lookup: {
          from: "circleposts", // The collection to join
          localField: "_id", // The field from the input documents
          foreignField: "circle", // The field from the documents of the "from" collection
          as: "posts" // The output array field
        }
      },
      {
        $addFields: {
          totalUpvotes: {
            $sum: "$posts.stats.upvotes" // Sum all upvotes from posts
          }
        }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          description: 1,
          memberCount: 1,
          totalUpvotes: 1,
          guru: 1,
          image: 1
        }
      },
      {
        $sort: {
          totalUpvotes: -1,
          memberCount: -1
        }
      },
      {
        $limit: limitNum
      }
    ]);
    
    // Populate guru information
    const populatedCircles = await Circle.populate(circles, {
      path: "guru",
      select: "username profilePicture"
    });
    
    res.status(200).json({
      status: "success",
      results: populatedCircles.length,
      data: {
        circles: populatedCircles
      }
    });
  } catch (error: any) {
    res.status(500).json({
      status: "error",
      message: error.message
    });
  }
};

// Get top forum posts by upvotes
export const getTopPosts = async (req: Request, res: Response) => {
  try {
    const { limit = 10 } = req.query;
    const limitNum = parseInt(limit as string);
    
    // Get top-voted public posts
    const posts = await Post.find({ isArchived: false })
      .sort({ "stats.upvotes": -1 })
      .limit(limitNum)
      .populate("creator", "username profilePicture bio");
    
    res.status(200).json({
      status: "success",
      results: posts.length,
      data: {
        posts
      }
    });
  } catch (error: any) {
    res.status(500).json({
      status: "error",
      message: error.message
    });
  }
};

// Get top rituals by adoption count
export const getTopRituals = async (req: Request, res: Response) => {
  try {
    const { limit = 10 } = req.query;
    const limitNum = parseInt(limit as string);
    
    // Get top rituals by adoption count
    const rituals = await Ritual.find({ 
      visibility: "public", // Only public rituals
      isArchived: false
    })
      .sort({ "stats.adoptions": -1, "stats.upvotes": -1 })
      .limit(limitNum)
      .populate("creator", "username profilePicture bio");
    
    res.status(200).json({
      status: "success",
      results: rituals.length,
      data: {
        rituals
      }
    });
  } catch (error: any) {
    res.status(500).json({
      status: "error",
      message: error.message
    });
  }
};

// Combined feed for wisdom hall (top posts & rituals)
export const getWisdomFeed = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;
    
    // Get top posts
    const topPosts = await Post.find({ isArchived: false })
      .sort({ "stats.upvotes": -1 })
      .limit(50) // Get top 50 to merge and paginate
      .populate("creator", "username profilePicture bio");
    
    // Get top public rituals
    const topRituals = await Ritual.find({ 
      visibility: "public", 
      isArchived: false 
    })
      .sort({ "stats.adoptions": -1, "stats.upvotes": -1 })
      .limit(50) // Get top 50 to merge and paginate
      .populate("creator", "username profilePicture bio");
    
    // Combine and sort by engagement metrics
    const combinedFeed = [
      ...topPosts.map(post => ({
        ...post.toObject(),
        type: 'post',
        engagementScore: post.stats.upvotes * 2 + post.stats.comments
      })),
      ...topRituals.map(ritual => ({
        ...ritual.toObject(),
        type: 'ritual',
        engagementScore: (ritual.stats.adoptions * 3) + (ritual.stats.upvotes * 2) + ritual.stats.comments
      }))
    ];
    
    // Sort by engagement score
    combinedFeed.sort((a, b) => b.engagementScore - a.engagementScore);
    
    // Paginate
    const paginatedFeed = combinedFeed.slice(skip, skip + limitNum);
    
    res.status(200).json({
      status: "success",
      data: {
        feed: paginatedFeed,
        pagination: {
          page: pageNum,
          limit: limitNum,
          totalItems: combinedFeed.length,
          totalPages: Math.ceil(combinedFeed.length / limitNum)
        }
      }
    });
  } catch (error: any) {
    res.status(500).json({
      status: "error",
      message: error.message
    });
  }
};

// Search functionality for wisdom hall
export const search = async (req: Request, res: Response) => {
  try {
    const { query, type, limit = 10 } = req.query;
    
    if (!query || query === "") {
      return res.status(400).json({
        status: "error",
        message: "Search query is required"
      });
    }
    
    const limitNum = parseInt(limit as string);
    const searchQuery = new RegExp(query as string, "i");
    let results: any = {};
    
    // If type is specified, search only that type
    if (type) {
      switch(type) {
        case "users":
          results.users = await User.find({
            username: searchQuery
          })
          .select("username profilePicture bio")
          .limit(limitNum);
          break;
          
        case "circles":
          results.circles = await Circle.find({
            name: searchQuery,
            visibility: "public" // Only public circles
          })
          .select("name description image")
          .populate("guru", "username profilePicture")
          .limit(limitNum);
          break;
          
        case "rituals":
          results.rituals = await Ritual.find({
            $or: [
              { title: searchQuery },
              { description: searchQuery },
              { tags: searchQuery }
            ],
            visibility: "public", // Only public rituals
            isArchived: false
          })
          .select("title description stats")
          .populate("creator", "username profilePicture")
          .limit(limitNum);
          break;
          
        case "posts":
          results.posts = await Post.find({
            $or: [
              { content: searchQuery },
              { tags: searchQuery }
            ],
            isArchived: false
          })
          .select("content stats createdAt")
          .populate("creator", "username profilePicture")
          .limit(limitNum);
          break;
          
        default:
          return res.status(400).json({
            status: "error",
            message: "Invalid search type"
          });
      }
    } else {
      // Search all types
      results = {
        users: await User.find({
          username: searchQuery
        })
        .select("username profilePicture bio")
        .limit(limitNum),
        
        circles: await Circle.find({
          name: searchQuery,
          visibility: "public" // Only public circles
        })
        .select("name description image")
        .populate("guru", "username profilePicture")
        .limit(limitNum),
        
        rituals: await Ritual.find({
          $or: [
            { title: searchQuery },
            { description: searchQuery },
            { tags: searchQuery }
          ],
          visibility: "public", // Only public rituals
          isArchived: false
        })
        .select("title description stats")
        .populate("creator", "username profilePicture")
        .limit(limitNum),
        
        posts: await Post.find({
          $or: [
            { content: searchQuery },
            { tags: searchQuery }
          ],
          isArchived: false
        })
        .select("content stats createdAt")
        .populate("creator", "username profilePicture")
        .limit(limitNum),
      };
    }
    
    res.status(200).json({
      status: "success",
      data: results
    });
  } catch (error: any) {
    res.status(500).json({
      status: "error",
      message: error.message
    });
  }
};

// Get user's interaction status with content (for Wisdom Hall)
export const getUserWisdomInteractions = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    const { contentIds } = req.body;
    
    if (!contentIds || !Array.isArray(contentIds) || contentIds.length === 0) {
      return res.status(400).json({
        status: "error",
        message: "Content IDs array is required"
      });
    }
    
    // Get all user interactions with these content IDs (both posts and rituals)
    const interactions = await Interaction.find({
      user: userId,
      contentId: { $in: contentIds },
      type: { $in: [InteractionType.UPVOTE, InteractionType.SAVE] }
    });
    
    // Format into a lookup map for easy access
    const interactionMap: Record<string, { isUpvoted?: boolean, isSaved?: boolean }> = {};
    
    contentIds.forEach(id => {
      interactionMap[id.toString()] = {};
    });
    
    interactions.forEach(interaction => {
      const contentId = interaction.contentId.toString();
      
      if (interaction.type === InteractionType.UPVOTE) {
        interactionMap[contentId].isUpvoted = true;
      }
      
      if (interaction.type === InteractionType.SAVE) {
        interactionMap[contentId].isSaved = true;
      }
    });
    
    res.status(200).json({
      status: "success",
      data: {
        interactions: interactionMap
      }
    });
  } catch (error: any) {
    res.status(500).json({
      status: "error",
      message: error.message
    });
  }
};