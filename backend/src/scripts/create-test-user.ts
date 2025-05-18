// Create a test user with known credentials
import mongoose from "mongoose";
import bcrypt from "bcrypt";

// Define MongoDB URI - use the same one that your server is using
const MONGODB_URI = "mongodb://localhost:27017/stoic";

interface UserDocument extends mongoose.Document {
  username: string;
  email: string;
  password: string;
  verified: boolean;
  isAdmin: boolean;
}

async function createTestUser(): Promise<void> {
  try {
    // Connect to MongoDB
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    // Define a simple user schema (enough for our test)
    const UserSchema = new mongoose.Schema({
      username: String,
      email: String,
      password: String,
      verified: Boolean,
      isAdmin: Boolean,
    });

    // Create or get the User model
    const User = mongoose.models.User as mongoose.Model<UserDocument> || 
      mongoose.model<UserDocument>("User", UserSchema);

    // Check if test user already exists
    const existingUser = await User.findOne({ email: "test@example.com" });

    if (existingUser) {
      console.log("Test user already exists, updating password...");

      // Hash the password manually
      const hashedPassword = await bcrypt.hash("Test@123456", 10);

      // Update the user
      await User.updateOne(
        { email: "test@example.com" },
        {
          password: hashedPassword,
          verified: true,
        }
      );

      console.log("Test user updated successfully");
    } else {
      console.log("Creating new test user...");

      // Hash the password manually
      const hashedPassword = await bcrypt.hash("Test@123456", 10);

      // Create a new test user
      await User.create({
        username: "testuser",
        email: "test@example.com",
        password: hashedPassword,
        verified: true,
        isAdmin: false,
      });

      console.log("Test user created successfully");
    }

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");

    console.log("\nTest User Credentials:");
    console.log("Email: test@example.com");
    console.log("Password: Test@123456");
  } catch (error) {
    console.error("Error creating test user:", error instanceof Error ? error.message : error);
  }
}

createTestUser();
