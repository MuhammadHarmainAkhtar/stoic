import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcrypt";

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  profilePicture?: string;
  bio?: string;
  verified: boolean;
  verificationToken?: string;
  verificationTokenValidation?: number;
  forgotPasswordToken?: string;
  forgotPasswordTokenValidation?: number;
  joinedCircles: mongoose.Types.ObjectId[];
  savedPosts: mongoose.Types.ObjectId[];
  adoptedRituals: mongoose.Types.ObjectId[];
  isGuru: mongoose.Types.ObjectId[];
  isAdmin: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// Create User schema
const UserSchema: Schema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
    profilePicture: {
      type: String,
      default: "uploads/profiles/Profile.png"
    },
    bio: {
      type: String,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
      select: false,
    },
    verificationTokenValidation: {
      type: Number,
      select: false,
    },
    forgotPasswordToken: {
      type: String,
      select: false,
    },
    forgotPasswordTokenValidation: {
      type: Number,
      select: false,
    },
    // Circle functionality fields
    joinedCircles: [
      {
        type: Schema.Types.ObjectId,
        ref: "Circle",
      },
    ],
    savedPosts: [
      {
        type: Schema.Types.ObjectId,
        ref: "CirclePost",
      },
    ],
    adoptedRituals: [
      {
        type: Schema.Types.ObjectId,
        ref: "Ritual",
      },
    ],
    isGuru: [
      {
        type: Schema.Types.ObjectId,
        ref: "Circle",
      },
    ], // Circles where user is Guru
    isAdmin: {
      type: Boolean,
      default: false,
    }, // Main admin status
  },
  {
    timestamps: true,
  }
);

// Password hashing middleware
UserSchema.pre("save", async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified("password")) return next();

  try {
    // Generate a salt
    const salt = await bcrypt.genSalt(10);

    // Hash the password along with the new salt
    // Add type assertion to make TypeScript happy
    this.password = await bcrypt.hash(this.password as string, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Method to compare password for login
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
export default User;
