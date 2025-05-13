import mongoose, { Schema } from "mongoose";

const ProfileLogSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  rituals: [{ type: Schema.Types.ObjectId, ref: "Ritual" }],
  reflections: [{ type: Schema.Types.ObjectId, ref: "Reflection" }],
  favoriteQuotes: [String],
  circlesJoined: [{ type: Schema.Types.ObjectId, ref: "Circle" }],
});

const ProfileLog =
  mongoose.models.ProfileLog || mongoose.model("ProfileLog", ProfileLogSchema);
export default ProfileLog;
