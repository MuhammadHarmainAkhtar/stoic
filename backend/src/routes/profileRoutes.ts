import express from "express";
import * as profileController from "../controllers/profileController";
import { protect } from "../middleware/authMiddleware";
import { wrapAsync } from "../middleware/routeHandler";

const router = express.Router();

// All profile routes require authentication
router.use(protect);

// Profile routes
router.get("/", wrapAsync(profileController.getUserProfile));

// Saved items routes
router.get("/saved", wrapAsync(profileController.getSavedItems));

// Archived items routes
router.get("/archived", wrapAsync(profileController.getArchivedItems));

// Activity routes
router.get("/activity", wrapAsync(profileController.getUserActivity));

// Archive/unarchive routes
router.patch("/posts/:postId/archive", wrapAsync(profileController.archivePost));
router.patch("/rituals/:ritualId/archive", wrapAsync(profileController.archiveRitual));

// Recently visited circles
router.post("/circles/:circleId/visit", wrapAsync(profileController.updateRecentlyVisitedCircle));

export default router;