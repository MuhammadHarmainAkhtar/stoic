import express from "express";
import * as adminController from "../controllers/adminController";
import { protect, restrictToAdmin } from "../middleware/authMiddleware";
import { wrapAsync } from "../middleware/routeHandler";

const router = express.Router();

// Base protection middleware
router.use(protect);

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

// Report management routes (admin only)
adminRouter.get(
  "/reports",
  wrapAsync(adminController.getReports)
);

adminRouter.get(
  "/reports/:id",
  wrapAsync(adminController.getReportById)
);

adminRouter.patch(
  "/reports/:id",
  wrapAsync(adminController.updateReportStatus)
);

// Register admin routes
router.use(adminRouter);

export default router;
