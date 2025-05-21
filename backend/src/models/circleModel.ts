import mongoose, { Schema, Document } from "mongoose";

export interface ICircle extends Document {
  name: string;
  image: string;
  bio: string;
  guru: mongoose.Types.ObjectId;
  members: mongoose.Types.ObjectId[];
  posts: mongoose.Types.ObjectId[];
  rituals: mongoose.Types.ObjectId[];
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
    rituals: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Ritual",
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

// Calculate rank based on members, upvotes, and rituals
circleSchema.methods.calculateRank = async function () {
  const CirclePost = mongoose.model("CirclePost");
  const Ritual = mongoose.model("Ritual");
  const Adoption = mongoose.model("Adoption");
  
  const memberCount = this.members.length;

  // Calculate post engagement
  const posts = await CirclePost.find({ circle: this._id });
  let totalPostUpvotes = 0;

  posts.forEach((post) => {
    totalPostUpvotes += post.upvotes.length;
  });

  // Calculate ritual engagement
  const rituals = await Ritual.find({ circle: this._id });
  let totalRitualScore = 0;

  // Get adoption counts for each ritual
  for (const ritual of rituals) {
    const adoptionCount = await Adoption.countDocuments({ 
      ritual: ritual._id, 
      status: { $in: ['active', 'completed'] } 
    });
    
    // Ritual score: upvotes + (adoptions * 3)
    const ritualScore = ritual.stats.upvotes + (adoptionCount * 3);
    totalRitualScore += ritualScore;
  }

  // Comprehensive ranking formula: 
  // member count + post upvotes + ritual score (weighted higher)
  this.rank = memberCount + totalPostUpvotes + (totalRitualScore * 1.5);
  await this.save();

  return this.rank;
};

export default mongoose.model<ICircle>("Circle", circleSchema);
