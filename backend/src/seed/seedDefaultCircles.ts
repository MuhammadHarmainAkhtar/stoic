import mongoose from "mongoose";
import dotenv from "dotenv";
import Circle from "../models/circleModel";
import User from "../models/userModel";

dotenv.config({ path: ".env.local" });

const seedDefaultCircles = async () => {
  try {
    // Connect to MongoDB
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is not defined in environment variables");
    }

    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Check if an admin user exists
    let adminUser = await User.findOne({ isAdmin: true });

    if (!adminUser) {
      console.log("Creating admin user...");
      adminUser = await User.create({
        username: "admin",
        email: "admin@stoic.com",
        password: "Admin@123456",
        name: "Admin",
        isAdmin: true,
        verified: true,
      });
      console.log("Admin user created");
    }

    // Check if default circles already exist
    const existingDefaultCircles = await Circle.find({ isDefault: true });
    if (existingDefaultCircles.length > 0) {
      console.log("Default circles already exist. Skipping...");
      process.exit(0);
    }

    // Default circle data
    const defaultCircles = [
      {
        name: "Discipline & Focus",
        bio: "Master your mind and actions through stoic discipline and focus techniques",
        image: "default-discipline-image.jpg",
        guru: adminUser._id,
        isDefault: true,
      },
      {
        name: "Being a better parent",
        bio: "Apply stoic principles to parenthood and family relationships",
        image: "default-parent-image.jpg",
        guru: adminUser._id,
        isDefault: true,
      },
      {
        name: "Career and Purpose",
        bio: "Find meaning and direction in work through stoic purpose-seeking",
        image: "default-career-image.jpg",
        guru: adminUser._id,
        isDefault: true,
      },
      {
        name: "Heartbreak and healing",
        bio: "Navigate difficult emotions and relationships with stoic resilience",
        image: "default-heartbreak-image.jpg",
        guru: adminUser._id,
        isDefault: true,
      },
      {
        name: "Psychological Facts",
        bio: "Explore psychological insights through the lens of stoic philosophy",
        image: "default-psychology-image.jpg",
        guru: adminUser._id,
        isDefault: true,
      },
    ];

    // Create default circles
    const circles = await Circle.create(defaultCircles);
    console.log(`${circles.length} default circles created`);

    // Update admin user to be guru of these circles
    await User.findByIdAndUpdate(adminUser._id, {
      $push: { isGuru: { $each: circles.map((circle: any) => circle._id) } },
    });
    console.log("Admin user updated as guru of default circles");

    console.log("Seed completed successfully");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding default circles:", error);
    process.exit(1);
  }
};

seedDefaultCircles();
