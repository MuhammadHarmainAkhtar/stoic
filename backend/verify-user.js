const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config({ path: ".env.local" });

if (!process.env.MONGODB_URI) {
  console.error("MONGODB_URI is not defined");
  process.exit(1);
}

mongoose
  .connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log("Connected to MongoDB");

    // Get the User model
    const User = mongoose.model(
      "User",
      new mongoose.Schema({}, { strict: false })
    );

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
    console.log("Disconnected from MongoDB");
  })
  .catch((err) => {
    console.error("Error:", err);
  });
