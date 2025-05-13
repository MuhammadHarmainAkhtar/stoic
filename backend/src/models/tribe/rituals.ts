import mongoose, { Schema } from "mongoose";

const RitualSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: String,
    media: String, // URL to image/video
    daysStreak: Number,
    adoptedBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  {
    timestamps: true,
  }
);

const Rituals =
  mongoose.models.rituals || mongoose.model("Rituals", RitualSchema);
export default Rituals;
