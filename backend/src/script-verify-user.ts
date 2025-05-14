import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/userModel";

dotenv.config({ path: ".env.local" });

const verifyTestUser = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is not defined");
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Find and update the test user
    const result = await User.findOneAndUpdate(
      { email: "postman@test.com" },
      { verified: true },
      { new: true }
    );

    if (result) {
      console.log("User verified successfully:", result.email);
    } else {
      console.log("User not found");
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error("Error:", error);
  }
};

verifyTestUser();
