import mongoose from "mongoose";
import dotenv from "dotenv";
import Circle from "../models/circleModel";
import User from "../models/userModel";

dotenv.config({ path: ".env" });

/**
 * This script performs the following actions:
 * 1. Makes specific admin with ID 682499455e350516d6b68915 a member of all circles
 * 2. Verifies this admin is the guru of all default circles
 * 3. Auto-deletes any empty circles (except default ones)
 */
const updateCircleConfigs = async () => {
  try {
    // Connect to MongoDB
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is not defined in environment variables");
    }

    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Find the specific admin user
    const adminUser = await User.findOne({ 
      _id: "682499455e350516d6b68915",
      isAdmin: true 
    });
    
    if (!adminUser) {
      console.log("Specific admin user not found. Aborting script.");
      process.exit(1);
    }
    
    console.log(`Found admin user: ${adminUser.username}`);
    
    // Get all circles
    const allCircles = await Circle.find();
    console.log(`Found ${allCircles.length} circles in the database`);
    
    // 1. Make admin a member of all circles
    let circlesMembershipAdded = 0;
    for (const circle of allCircles) {
      const isMember = circle.members.some(
        (member) => member.toString() === adminUser._id.toString()
      );
      
      if (!isMember) {
        circle.members.push(adminUser._id);
        await circle.save();
        circlesMembershipAdded++;
      }
      
      // Update admin's joinedCircles array
      await User.findByIdAndUpdate(adminUser._id, {
        $addToSet: { joinedCircles: circle._id },
      });
    }
    console.log(`Added admin to ${circlesMembershipAdded} circles as a member`);
    
    // 2. Make admin the guru of all default circles
    const defaultCircles = await Circle.find({ isDefault: true });
    let guruUpdated = 0;
    
    for (const circle of defaultCircles) {
      if (circle.guru.toString() !== adminUser._id.toString()) {
        // Keep track of old guru to update their guruCircles array
        const oldGuruId = circle.guru;
        
        // Update circle guru
        circle.guru = adminUser._id;
        await circle.save();
        guruUpdated++;
        
        // Remove circle from old guru's guruCircles array
        if (oldGuruId) {
          await User.findByIdAndUpdate(oldGuruId, {
            $pull: { isGuru: circle._id },
          });
        }
        
        // Add circle to admin's guruCircles array
        await User.findByIdAndUpdate(adminUser._id, {
          $addToSet: { isGuru: circle._id },
        });
      }
    }
    console.log(`Updated ${guruUpdated} default circles to have admin as guru`);
    
    // 3. Find and delete empty circles (except default ones)
    const emptyCircles = await Circle.find({
      members: { $size: 0 },
      isDefault: false
    });
    
    if (emptyCircles.length > 0) {
      await Circle.deleteMany({ 
        _id: { $in: emptyCircles.map(c => c._id) }
      });
      console.log(`Deleted ${emptyCircles.length} empty circles`);
    } else {
      console.log("No empty circles found to delete");
    }

    console.log("Circle configuration update completed successfully");
    process.exit(0);
  } catch (error) {
    console.error("Error updating circle configurations:", error);
    process.exit(1);
  }
};

// Run the script
updateCircleConfigs();
