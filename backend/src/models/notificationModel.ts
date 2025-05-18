import mongoose, { Schema, Document } from "mongoose";

export enum NotificationType {
  CIRCLE_JOIN_REQUEST = "circle_join_request",
  CIRCLE_INVITE = "circle_invite",
  CIRCLE_REQUEST_ACCEPTED = "circle_request_accepted",
  CIRCLE_REQUEST_REJECTED = "circle_request_rejected",
  POST_UPVOTE = "post_upvote",
  POST_DOWNVOTE = "post_downvote",
  POST_COMMENT = "post_comment",
  POST_SHARE = "post_share",
  POST_SAVE = "post_save",
  CIRCLE_CREATED = "circle_created",
  MEETING_SCHEDULED = "meeting_scheduled",
  DIRECT_MESSAGE = "direct_message",
  CIRCLE_MESSAGE = "circle_message",
  CIRCLE_ADMIN_ACTION = "circle_admin_action",
  CIRCLE_MEMBER_LEAVE = "circle_member_leave",
  CIRCLE_GURU_INVITE = "circle_guru_invite",
}

export interface INotification extends Document {
  type: NotificationType;
  from: mongoose.Types.ObjectId;
  to: mongoose.Types.ObjectId;
  circle?: mongoose.Types.ObjectId;
  post?: mongoose.Types.ObjectId;
  comment?: mongoose.Types.ObjectId;
  message?: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema: Schema = new Schema(
  {
    type: {
      type: String,
      enum: Object.values(NotificationType),
      required: [true, "Notification type is required"],
    },
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Notification sender is required"],
    },
    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Notification receiver is required"],
    },
    circle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Circle",
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CirclePost",
    },
    comment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CircleComment",
    },
    message: {
      type: String,
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<INotification>(
  "Notification",
  notificationSchema
);
