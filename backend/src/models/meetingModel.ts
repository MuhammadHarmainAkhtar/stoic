import mongoose, { Schema, Document } from "mongoose";

export enum MeetingType {
  VOICE = "voice",
  VIDEO = "video",
}

export interface IMeeting extends Document {
  title: string;
  description: string;
  type: MeetingType;
  circle: mongoose.Types.ObjectId;
  creator: mongoose.Types.ObjectId;
  scheduledFor: Date;
  duration: number; // in minutes
  participants: mongoose.Types.ObjectId[];
  roomId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const meetingSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Meeting title is required"],
    },
    description: {
      type: String,
      required: [true, "Meeting description is required"],
    },
    type: {
      type: String,
      enum: Object.values(MeetingType),
      default: MeetingType.VIDEO,
    },
    circle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Circle",
      required: [true, "Circle is required"],
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Creator is required"],
    },
    scheduledFor: {
      type: Date,
      required: [true, "Scheduled time is required"],
    },
    duration: {
      type: Number,
      required: [true, "Duration is required"],
      min: 5,
      max: 180,
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    roomId: {
      type: String,
      required: [true, "Room ID is required"],
    },
    isActive: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IMeeting>("Meeting", meetingSchema);
