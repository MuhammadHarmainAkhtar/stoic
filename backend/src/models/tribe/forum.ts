import mongoose, { Schema } from "mongoose";

const ForumSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["reflection", "struggle", "virtue", "quote", "win"],
      required: true,
    },
    content: { type: String, required: true },
    promptUsed: { type: String }, // Optional: "What would Marcus Aurelius advise…"
    upvotes: { type: Number, default: 0 },
    usersWhoUpvoted: [{ type: Schema.Types.ObjectId, ref: "User" }],
    visibility: { type: String, enum: ["public", "private"], default: "public" },
    comments: [
      {
        userId: { type: Schema.Types.ObjectId, ref: "User" },
        content: String,
        upvotes: { type: Number, default: 0 },
        usersWhoUpvoted: [{ type: Schema.Types.ObjectId, ref: "User" }],
        createdAt: { type: Date, default: Date.now },
      },
    ],
    tags: [{ type: String }],
  },
  {
    timestamps: true,
  }
);

const Forum = mongoose.models.Forum || mongoose.model("Forum", ForumSchema);
export default Forum;
