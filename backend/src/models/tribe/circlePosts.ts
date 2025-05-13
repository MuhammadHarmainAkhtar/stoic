import mongoose, { Schema } from "mongoose";
const CirclePostSchema: Schema = new Schema(
  {
    circleId: { type: Schema.Types.ObjectId, ref: "Circles", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    type: {
      type: String,
      enum: ["discussion", "challenge", "poll", "reflection", "struggle"],
      required: true,
    },
    upvotes: { type: Number, default: 0 },
    usersWhoUpvoted: [{ type: Schema.Types.ObjectId, ref: "User" }],
    isModerated: { type: Boolean, default: false },
    moderationReason: { type: String },
    comments: [
      {
        userId: { type: Schema.Types.ObjectId, ref: "User" },
        content: String,
        upvotes: { type: Number, default: 0 },
        usersWhoUpvoted: [{ type: Schema.Types.ObjectId, ref: "User" }],
        createdAt: { type: Date, default: Date.now },
      },
    ],
    attachments: [{ type: String }], // Could store URLs to images or other media
  },
  {
    timestamps: true,
  }
);

const CirclePosts =
  mongoose.models.CirclePosts ||
  mongoose.model("CirclePosts", CirclePostSchema);
export default CirclePosts;
