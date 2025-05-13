import mongoose, { Schema } from "mongoose";

const CircleSchema: Schema = new Schema({
  name: { type: String, required: true, unique: true },
  bio: { type: String, required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  admin: { type: Schema.Types.ObjectId, ref: "User", required: true },
  members: [{ type: Schema.Types.ObjectId, ref: "User" }],
  isDefault: { type: Boolean, default: false },
  upvotes: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  category: { type: String, required: true },
  pendingMembers: [{ type: Schema.Types.ObjectId, ref: "User" }],
  approvedAt: { type: Date },
  rejectedAt: { type: Date },
},{
  timestamps: true,
});

const Circles =
  mongoose.models.Circles || mongoose.model("Circles", CircleSchema);
export default Circles;
