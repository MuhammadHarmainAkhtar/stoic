import express from "express";
import * as userController from "../controllers/userController";
import { protect } from "../middleware/authMiddleware";
import { uploadSingle } from "../middleware/uploadMiddleware";
import { wrapAsync } from "../middleware/routeHandler";

const router = express.Router();

// Base protection - all user routes require authentication
router.use(protect);

// Get user profile
router.get("/profile", wrapAsync(userController.getUserProfile));

// Update user profile
router.put("/profile", wrapAsync(userController.updateUserProfile));

// Update profile picture
router.patch(
  "/profile/picture",
  uploadSingle("file"),
  wrapAsync(userController.updateProfilePicture)
);

export default router;
