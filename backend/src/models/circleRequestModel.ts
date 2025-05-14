import mongoose, { Schema, Document } from "mongoose";

export enum RequestType {
  JOIN = "join",
  CREATE = "create",
  INVITE = "invite",
}

export enum RequestStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
}

export interface ICircleRequest extends Document {
  type: RequestType;
  from: mongoose.Types.ObjectId;
  to?: mongoose.Types.ObjectId; // To user for invites, null for create requests
  circle?: mongoose.Types.ObjectId; // For join or invite requests
  circleName?: string; // For create circle requests
  circleBio?: string; // For create circle requests
  reason: string;
  status: RequestStatus;
  createdAt: Date;
  updatedAt: Date;
}

const circleRequestSchema: Schema = new Schema(
  {
    type: {
      type: String,
      enum: Object.values(RequestType),
      required: [true, "Request type is required"],
    },
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Request sender is required"],
    },
    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    circle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Circle",
    },
    circleName: {
      type: String,
    },
    circleBio: {
      type: String,
    },
    reason: {
      type: String,
      required: [true, "Reason is required"],
    },
    status: {
      type: String,
      enum: Object.values(RequestStatus),
      default: RequestStatus.PENDING,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ICircleRequest>(
  "CircleRequest",
  circleRequestSchema
);
