import mongoose, { Schema, Document } from "mongoose";

export interface ICircle extends Document {
  name: string;
  image: string;
  bio: string;
  guru: mongoose.Types.ObjectId;
  members: mongoose.Types.ObjectId[];
  posts: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  rank?: number;
  isDefault: boolean;
  calculateRank(): Promise<number>;
}

const circleSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Circle name is required"],
      unique: true,
      trim: true,
    },
    image: {
      type: String,
      required: [true, "Circle image is required"],
    },
    bio: {
      type: String,
      required: [true, "Circle bio is required"],
    },
    guru: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Circle must have a guru"],
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    posts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CirclePost",
      },
    ],
    rank: {
      type: Number,
      default: 0,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Calculate rank based on members and upvotes
circleSchema.methods.calculateRank = async function () {
  const CirclePost = mongoose.model("CirclePost");
  const memberCount = this.members.length;

  const posts = await CirclePost.find({ circle: this._id });
  let totalUpvotes = 0;

  posts.forEach((post) => {
    totalUpvotes += post.upvotes.length;
  });

  // Simple ranking formula: member count + total upvotes
  this.rank = memberCount + totalUpvotes;
  await this.save();

  return this.rank;
};

export default mongoose.model<ICircle>("Circle", circleSchema);
