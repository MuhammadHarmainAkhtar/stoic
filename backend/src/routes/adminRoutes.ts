import express from "express";
import * as adminController from "../controllers/adminController";
import { protect, restrictToAdmin } from "../middleware/authMiddleware";
import { wrapAsync } from "../middleware/routeHandler";

const router = express.Router();

// Base protection middleware
router.use(protect);

// User-facing route for processing guru invites (not admin-restricted)
// IMPORTANT: This must be defined BEFORE the adminRouter to prevent admin restrictions
router.post(
  "/circles/guru/invite/process",
  wrapAsync(adminController.processGuruInvite)
);

// Admin-specific routes
const adminRouter = express.Router();
adminRouter.use(restrictToAdmin);

// Circle management routes (admin only)
adminRouter.post(
  "/circles/guru/remove", 
  wrapAsync(adminController.removeGuruFromCircle)
);

adminRouter.post(
  "/circles/content/remove", 
  wrapAsync(adminController.removeCircleContent)
);

adminRouter.post(
  "/circles/guru/invite", 
  wrapAsync(adminController.inviteUserAsGuru)
);

// Register admin routes
router.use(adminRouter);

export default router;
