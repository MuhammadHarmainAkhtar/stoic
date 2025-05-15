import mongoose from "mongoose";
import dotenv from "dotenv";
import Circle from "../models/circleModel";
import User from "../models/userModel";

dotenv.config({ path: ".env" });

/**
 * This script verifies that the admin protection features are properly set up:
 * 1. Verifies the main admin exists
 * 2. Confirms the main admin is a member of all circles
 * 3. Confirms the main admin is the guru of all default circles
 */
const verifyAdminProtections = async () => {
  try {
    // Connect to MongoDB
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is not defined in environment variables");
    }

    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Verify main admin exists
    const MAIN_ADMIN_ID = "682499455e350516d6b68915";
    const adminUser = await User.findById(MAIN_ADMIN_ID);
    
    if (!adminUser) {
      console.error(`❌ CRITICAL: Main admin with ID ${MAIN_ADMIN_ID} not found!`);
      process.exit(1);
    }
    
    console.log(`✅ Main admin found: ${adminUser.username} (${adminUser._id})`);
    if (!adminUser.isAdmin) {
      console.error(`❌ ERROR: User with ID ${MAIN_ADMIN_ID} exists but doesn't have admin privileges!`);
    } else {
      console.log(`✅ Main admin has proper admin privileges`);
    }
    
    // Get all circles
    const allCircles = await Circle.find();
    console.log(`Found ${allCircles.length} circles in the database`);
    
    // 1. Verify admin is member of all circles
    const circlesWithAdminMissing = [];
    
    for (const circle of allCircles) {
      const isMember = circle.members.some(
        (member) => member.toString() === MAIN_ADMIN_ID
      );
      
      if (!isMember) {
        circlesWithAdminMissing.push({
          id: circle._id,
          name: circle.name
        });
      }
    }
    
    if (circlesWithAdminMissing.length > 0) {
      console.error(`❌ Admin is missing from ${circlesWithAdminMissing.length} circles:`);
      circlesWithAdminMissing.forEach(circle => {
        console.error(`  - ${circle.name} (${circle.id})`);
      });
      console.log("Run update-circle-configs.ts script to fix this issue");
    } else {
      console.log(`✅ Admin is a member of all circles`);
    }
    
    // 2. Verify admin is guru of all default circles
    const defaultCircles = await Circle.find({ isDefault: true });
    const defaultCirclesWithWrongGuru = [];
    
    for (const circle of defaultCircles) {
      if (circle.guru.toString() !== MAIN_ADMIN_ID) {
        defaultCirclesWithWrongGuru.push({
          id: circle._id,
          name: circle.name,
          guruId: circle.guru
        });
      }
    }
    
    if (defaultCirclesWithWrongGuru.length > 0) {
      console.error(`❌ Admin is not guru of ${defaultCirclesWithWrongGuru.length} default circles:`);
      defaultCirclesWithWrongGuru.forEach(circle => {
        console.error(`  - ${circle.name} (${circle.id}), current guru: ${circle.guruId}`);
      });
      console.log("Run update-circle-configs.ts script to fix this issue");
    } else {
      console.log(`✅ Admin is guru of all ${defaultCircles.length} default circles`);
    }

    console.log("\nAdmin protection verification completed");
    process.exit(0);
  } catch (error) {
    console.error("Error verifying admin protections:", error);
    process.exit(1);
  }
};

// Run the verification
verifyAdminProtections();
