import mongoose, { Schema, Document } from "mongoose";
import { ContentType } from "./interactionModel";

export enum ReportStatus {
  PENDING = "pending",
  REVIEWED = "reviewed",
  DISMISSED = "dismissed",
  ACTION_TAKEN = "action_taken"
}

export interface IReport extends Document {
  reporter: mongoose.Types.ObjectId;
  contentType: ContentType;
  contentId: mongoose.Types.ObjectId;
  reason: string;
  status: ReportStatus;
  adminNotes?: string;
  createdAt: Date;
  updatedAt: Date;
  reviewedAt?: Date;
}

const ReportSchema: Schema = new Schema(
  {
    reporter: {
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
    reason: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(ReportStatus),
      default: ReportStatus.PENDING,
    },
    adminNotes: {
      type: String,
    },
    reviewedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Add indexes for efficient queries
ReportSchema.index({ contentType: 1, contentId: 1 });
ReportSchema.index({ reporter: 1 });
ReportSchema.index({ status: 1 });
ReportSchema.index({ createdAt: -1 });

export default mongoose.model<IReport>("Report", ReportSchema);