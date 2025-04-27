import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import { authenticate } from "./middleware/authMiddleware";
import "./lib/mongoose"; // Initialize MongoDB connection

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Body parser error handling
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    if (err instanceof SyntaxError && "body" in err) {
      return res.status(400).json({ message: "Invalid JSON payload" });
    }
    if (err.type === "entity.too.large") {
      return res.status(413).json({ message: "Request entity too large" });
    }
    next(err);
  }
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", authenticate, userRoutes); // Protected routes

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

// Error handling middleware
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(err.stack);
    res.status(500).json({ message: "Something went wrong!" });
  }
);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
