import mongoose from "mongoose";
import dotenv from "dotenv";
import Circle from "../models/circleModel";
import User from "../models/userModel";

// Load environment variables
dotenv.config({ path: ".env" });

async function updateDefaultCircleGurus() {
  try {
    // Connect to MongoDB
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is not defined in environment variables");
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Find the admin user
    const adminUser = await User.findOne({ 
      _id: "682499455e350516d6b68915",
      isAdmin: true 
    });

    if (!adminUser) {
      throw new Error("Admin user not found");
    }

    console.log(`Found admin user: ${adminUser.username} (${adminUser._id})`);

    // Find all default circles
    const defaultCircles = await Circle.find({ isDefault: true });
    console.log(`Found ${defaultCircles.length} default circles`);

    if (defaultCircles.length === 0) {
      console.log("No default circles found");
      process.exit(0);
    }

    // Update circles to use admin as guru and add admin as member
    const updatePromises = defaultCircles.map(async (circle) => {
      console.log(`Updating circle: ${circle.name}`);
      
      // Update the guru to be the admin user
      circle.guru = adminUser._id;

      // Make sure the admin user is in the members array
      if (!circle.members.some(member => member.toString() === adminUser._id.toString())) {
        circle.members.push(adminUser._id);
      }
      
      return circle.save();
    });

    await Promise.all(updatePromises);
    console.log("All circles updated successfully");

    // Add circle IDs to admin's isGuru array if not already there
    const circleIds = defaultCircles.map(circle => circle._id);
    await User.findByIdAndUpdate(adminUser._id, {
      $addToSet: { isGuru: { $each: circleIds } }
    });

    console.log("Admin user updated as guru for all default circles");

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
    
    process.exit(0);
  } catch (error: any) {
    console.error("Error updating circle gurus:", error.message);
    process.exit(1);
  }
}

updateDefaultCircleGurus();
