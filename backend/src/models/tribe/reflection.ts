import mongoose, { Schema } from "mongoose";

const ReflectionSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    prompt: String,
    content: String,
    quoteAttached: String,
    ritualTag: String,
  },
  {
    timestamps: true,
  }
);

const Reflection =
  mongoose.models.Reflection || mongoose.model("Reflection", ReflectionSchema);
export default Reflection;
