import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";

// Find and load the .env.local file
const envPath = path.resolve(__dirname, "../.env.local");
dotenv.config({ path: envPath });

// Fallback to alternative locations if needed
if (!process.env.MONGODB_URI) {
  const alternativePaths = [
    path.resolve(__dirname, "../../.env.local"),
    path.resolve(__dirname, "../.env"),
    path.resolve(__dirname, "../../.env"),
  ];

  for (const altPath of alternativePaths) {
    if (fs.existsSync(altPath)) {
      dotenv.config({ path: altPath });
      break;
    }
  }
}

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/stoic-tribe";

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("Successfully connected to MongoDB.");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  });

mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});

export default mongoose;
