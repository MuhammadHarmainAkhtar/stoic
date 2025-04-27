import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";

// Define the User interface extending Mongoose Document
interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  username: string;
  email: string;
  password: string;
  isVerified: boolean;
  verificationCode?: string; // Make verificationCode optional
  verificationCodeExpires?: Date; // Make verificationCodeExpires optional
  comparePassword: (password: string) => Promise<boolean>;
}

// Create User schema
const UserSchema: Schema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: [/\S+@\S+\.\S+/, "is invalid"],
    },
    password: {
      type: String,
      required: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationCode: {
      type: String,
      required: false,
    },
    verificationCodeExpires: {
      type: Date,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to hash the password before saving
UserSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);

  next();
});

// Method to compare passwords during login
UserSchema.methods.comparePassword = async function (password: string) {
  return await bcrypt.compare(password, this.password);
};

// Create the model
const User = mongoose.model<IUser>("User", UserSchema);

export default User;
