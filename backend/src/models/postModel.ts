import mongoose, { Schema, Document } from "mongoose";

export enum PostMediaType {
  NONE = "none",
  IMAGE = "image",
  VIDEO = "video",
}

export interface IPost extends Document {
  creator: mongoose.Types.ObjectId;
  content: string;
  mediaUrls: string[];
  mediaType: PostMediaType;
  tags: string[];
  isArchived: boolean;
  stats: {
    upvotes: number;
    downvotes: number;
    comments: number;
    shares: number;
    saves: number;
    reports: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const PostSchema: Schema = new Schema(
  {
    creator: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: [true, "Post content is required"],
      trim: true,
    },
    mediaUrls: {
      type: [String],
      default: [],
    },
    mediaType: {
      type: String,
      enum: Object.values(PostMediaType),
      default: PostMediaType.NONE,
    },
    tags: {
      type: [String],
      default: [],
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    stats: {
      upvotes: {
        type: Number,
        default: 0,
      },
      downvotes: {
        type: Number,
        default: 0,
      },
      comments: {
        type: Number,
        default: 0,
      },
      shares: {
        type: Number,
        default: 0,
      },
      saves: {
        type: Number,
        default: 0,
      },
      reports: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Add index for efficient queries
PostSchema.index({ creator: 1, createdAt: -1 });
PostSchema.index({ tags: 1 });
PostSchema.index({ "stats.upvotes": -1 });
PostSchema.index({ createdAt: -1 });

export default mongoose.model<IPost>("Post", PostSchema);
