import mongoose, { Schema, Document } from "mongoose";

export enum MessageType {
  TEXT = "text",
  IMAGE = "image",
  VIDEO = "video",
}

export interface IMessage extends Document {
  sender: mongoose.Types.ObjectId;
  receiver?: mongoose.Types.ObjectId; // For direct messages
  circle?: mongoose.Types.ObjectId; // For circle messages
  type: MessageType;
  content: string;
  media?: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema: Schema = new Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Sender is required"],
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    circle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Circle",
    },
    type: {
      type: String,
      enum: Object.values(MessageType),
      default: MessageType.TEXT,
    },
    content: {
      type: String,
      required: [true, "Message content is required"],
    },
    media: {
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

// Validation to ensure either receiver or circle is provided
messageSchema.pre("save", function (next) {
  if (!this.receiver && !this.circle) {
    next(new Error("Message must have either a receiver or a circle"));
  } else if (this.receiver && this.circle) {
    next(new Error("Message cannot have both receiver and circle"));
  } else {
    next();
  }
});

export default mongoose.model<IMessage>("Message", messageSchema);
