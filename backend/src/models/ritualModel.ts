import mongoose, { Schema, Document } from "mongoose";

export enum RitualFrequency {
  DAILY = "daily",
  WEEKLY = "weekly",
  MONTHLY = "monthly",
}

export enum RitualVisibility {
  PUBLIC = "public",
  CIRCLE = "circle", // Only visible to circle members
}

export interface IRitual extends Document {
  creator: mongoose.Types.ObjectId;
  title: string;
  description: string;
  frequency: RitualFrequency;
  duration: number; // In days
  visibility: RitualVisibility;
  circle?: mongoose.Types.ObjectId; // Only required if visibility is CIRCLE
  linkedPost?: mongoose.Types.ObjectId; // Optional link to a forum or circle post
  tags: string[];
  mediaUrls: string[];
  mediaType: string;
  isArchived: boolean;
  stats: {
    upvotes: number;
    downvotes: number;
    comments: number;
    shares: number;
    saves: number;
    adoptions: number;
    reports: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const RitualSchema: Schema = new Schema(
  {
    creator: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Ritual title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Ritual description is required"],
      trim: true,
    },
    frequency: {
      type: String,
      enum: Object.values(RitualFrequency),
      required: [true, "Ritual frequency is required"],
    },
    duration: {
      type: Number,
      required: [true, "Ritual duration is required"],
      min: [1, "Ritual duration must be at least 1 day"],
    },
    visibility: {
      type: String,
      enum: Object.values(RitualVisibility),
      required: [true, "Ritual visibility is required"],
    },
    circle: {
      type: Schema.Types.ObjectId,
      ref: "Circle",
      required: function(this: any) { 
        return this.visibility === RitualVisibility.CIRCLE;
      },
    },
    linkedPost: {
      type: Schema.Types.ObjectId,
      ref: "Post",
    },
    tags: {
      type: [String],
      default: [],
    },
    mediaUrls: {
      type: [String],
      default: [],
    },
    mediaType: {
      type: String,
      enum: ["none", "image", "video"],
      default: "none",
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
      adoptions: {
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
RitualSchema.index({ creator: 1, createdAt: -1 });
RitualSchema.index({ visibility: 1 });
RitualSchema.index({ circle: 1 });
RitualSchema.index({ tags: 1 });
RitualSchema.index({ "stats.upvotes": -1 });
RitualSchema.index({ "stats.adoptions": -1 });
RitualSchema.index({ createdAt: -1 });

export default mongoose.model<IRitual>("Ritual", RitualSchema);
