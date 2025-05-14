import mongoose, { Schema, Document } from "mongoose";

export enum PostType {
  TEXT = "text",
  IMAGE = "image",
  VIDEO = "video",
  ASK = "ask",
  RITUAL = "ritual",
}

export interface ICirclePost extends Document {
  type: PostType;
  content: string;
  media?: string[];
  user: mongoose.Types.ObjectId;
  circle: mongoose.Types.ObjectId;
  upvotes: mongoose.Types.ObjectId[];
  downvotes: mongoose.Types.ObjectId[];
  comments: mongoose.Types.ObjectId[];
  isAnonymous: boolean;
  isArchived: boolean;
  sharedFrom?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const circlePostSchema: Schema = new Schema(
  {
    type: {
      type: String,
      enum: Object.values(PostType),
      required: [true, "Post type is required"],
    },
    content: {
      type: String,
      required: [true, "Content is required"],
    },
    media: [
      {
        type: String,
      },
    ],
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },
    circle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Circle",
      required: [true, "Circle is required"],
    },
    upvotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    downvotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CircleComment",
      },
    ],
    isAnonymous: {
      type: Boolean,
      default: false,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    sharedFrom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CirclePost",
    },
  },
  {
    timestamps: true,
  }
);

// Virtual for saved by users
circlePostSchema.virtual("savedBy", {
  ref: "User",
  localField: "_id",
  foreignField: "savedPosts",
});

export default mongoose.model<ICirclePost>("CirclePost", circlePostSchema);
