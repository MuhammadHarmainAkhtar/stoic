import mongoose, { Schema, Document } from "mongoose";

export interface ICircleComment extends Document {
  content: string;
  user: mongoose.Types.ObjectId;
  post: mongoose.Types.ObjectId;
  upvotes: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const circleCommentSchema: Schema = new Schema(
  {
    content: {
      type: String,
      required: [true, "Comment content is required"],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CirclePost",
      required: [true, "Post is required"],
    },
    upvotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ICircleComment>(
  "CircleComment",
  circleCommentSchema
);
