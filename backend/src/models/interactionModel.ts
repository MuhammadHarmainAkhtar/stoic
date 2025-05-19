import mongoose, { Schema, Document } from "mongoose";

export enum InteractionType {
  UPVOTE = "upvote",
  DOWNVOTE = "downvote",
  COMMENT = "comment",
  SHARE = "share",
  SAVE = "save",
  REPORT = "report",
}

export enum ContentType {
  POST = "post",
  RITUAL = "ritual",
}

export enum ShareTargetType {
  CIRCLE = "circle",
  USER = "user", // For direct messages
}

export interface IInteraction extends Document {
  user: mongoose.Types.ObjectId;
  contentType: ContentType;
  contentId: mongoose.Types.ObjectId;
  type: InteractionType;
  comment?: string;
  shareTarget?: {
    type: ShareTargetType;
    id: mongoose.Types.ObjectId;
  };
  reportReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const InteractionSchema: Schema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    contentType: {
      type: String,
      enum: Object.values(ContentType),
      required: true,
    },
    contentId: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: "contentType",
    },
    type: {
      type: String,
      enum: Object.values(InteractionType),
      required: true,
    },
    comment: {
      type: String,
      required: function(this: any) {
        return this.type === InteractionType.COMMENT;
      },
    },
    shareTarget: {
      type: {
        type: String,
        enum: Object.values(ShareTargetType),
        required: function(this: any) {
          return this.type === InteractionType.SHARE;
        },
      },
      id: {
        type: Schema.Types.ObjectId,
        required: function(this: any) {
          return this.type === InteractionType.SHARE;
        },
        refPath: "shareTarget.type",
      },
    },
    reportReason: {
      type: String,
      required: function(this: any) {
        return this.type === InteractionType.REPORT;
      },
    },
  },
  {
    timestamps: true,
  }
);

// Add indexes for efficient queries
InteractionSchema.index({ user: 1, contentType: 1, contentId: 1, type: 1 }, { unique: true });
InteractionSchema.index({ contentType: 1, contentId: 1 });
InteractionSchema.index({ user: 1, type: 1 });
InteractionSchema.index({ createdAt: -1 });

export default mongoose.model<IInteraction>("Interaction", InteractionSchema);
