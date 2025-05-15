import express from "express";
import helmet from "helmet";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { createServer } from "http";
import authRouter from "./routes/authRoutes";
// Use dynamic import to work around module resolution issues
// This is a cleaner approach than using require
import circleRoutes from "./routes/circleRoutes";
import adminRoutes from "./routes/adminRoutes";
import cookieParser from "cookie-parser";
import SocketManager from "./lib/socketManager";

// Load environment variables
dotenv.config({ path: ".env.local" });
const PORT = process.env.PORT || 8000;

const app = express();

// Get allowed origins from environment variable or use defaults
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : ["http://localhost:3000", "https://stoic-web-five.vercel.app"];

// Configure CORS with multiple origins
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) === -1) {
        const msg =
          "The CORS policy for this site does not allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true, // Allow credentials (cookies)
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "credentials"],
  })
);

app.use(helmet());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Note: express.json() and express.urlencoded() already include body-parser functionality
// so we don't need the extra body-parser lines that were duplicating this functionality

if (!process.env.MONGODB_URI) {
  throw new Error("MONGODB_URI is not defined in environment variables");
}

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err);
    process.exit(1); // Exit the app if DB connection fails
  });

// Routes
app.use("/api/auth", authRouter);
app.use("/api", circleRoutes);
app.use("/api/admin", adminRoutes);

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

// Create HTTP server
const httpServer = createServer(app);

// Setup Socket.IO with the server
const socketManager = new SocketManager(httpServer);

// Export socket manager for use in other files
export { socketManager };

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`API endpoints available at http://localhost:${PORT}/api`);
});

export default app;
