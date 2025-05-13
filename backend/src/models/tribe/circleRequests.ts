import mongoose, { Schema } from "mongoose";

const CircleRequestSchema: Schema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  proposedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  justification: { type: String, required: true },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  adminFeedback: { type: String },
  createdAt: { type: Date, default: Date.now },
  reviewedAt: { type: Date },
  reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
});

const CircleRequest =
  mongoose.models.CircleRequest || 
  mongoose.model("CircleRequest", CircleRequestSchema);
export default CircleRequest;