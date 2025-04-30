import mongoose, { Document, Schema, Types } from "mongoose";
import bcrypt from "bcryptjs";

// Define the User interface extending Mongoose Document
// interface IUser extends Document {
//   _id: Types.ObjectId;
//   username: string;
//   email: string;
//   password: string;
//   // comparePassword: (password: string) => Promise<boolean>;
// }

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
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to hash the password before saving
// UserSchema.pre<IUser>('save', async function (next) {
//   if (!this.isModified('password')) return next();

//   try {
//     const salt = await bcrypt.genSalt(10);
//     this.password = await bcrypt.hash(this.password, salt);
//     next();
//   } catch (error: any) {
//     next(error);
//   }
// });

// // Method to compare passwords during login
// UserSchema.methods.comparePassword = async function (password: string) {
//   return await bcrypt.compare(password, this.password);
// };

// Create the model
// const User = mongoose.model<IUser>('User', UserSchema);

// export default User;
module.exports = mongoose.model("User", UserSchema);
