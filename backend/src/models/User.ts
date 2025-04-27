import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

// Define the User interface extending Mongoose Document
interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  comparePassword: (password: string) => Promise<boolean>;  // Password comparison method
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
      match: [/\S+@\S+\.\S+/, 'is invalid'],
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true, // This will automatically create `createdAt` and `updatedAt` fields
  }
);

// Pre-save hook to hash the password before saving
UserSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password')) return next();  // Only hash if password is modified or new

  const salt = await bcrypt.genSalt(10);  // Generate salt for password hashing
  this.password = await bcrypt.hash(this.password, salt);  // Hash the password

  next();
});

// Method to compare passwords during login
UserSchema.methods.comparePassword = async function (password: string) {
  return await bcrypt.compare(password, this.password);  // Compare provided password with stored hash
};

// Create the model
const User = mongoose.model<IUser>('User', UserSchema);

export default User;
