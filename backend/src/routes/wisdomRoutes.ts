import express from "express";
import * as wisdomController from "../controllers/wisdomController";
import * as interactionController from "../controllers/interactionController";
import { protect } from "../middleware/authMiddleware";
import { wrapAsync } from "../middleware/routeHandler";

const router = express.Router();

// All wisdom hall routes require authentication
router.use(protect);

// Wisdom hall routes
router.get("/top-circles", wrapAsync(wisdomController.getTopCircles));
router.get("/top-posts", wrapAsync(wisdomController.getTopPosts));
router.get("/top-rituals", wrapAsync(wisdomController.getTopRituals));
router.get("/feed", wrapAsync(wisdomController.getWisdomFeed));
router.get("/search", wrapAsync(wisdomController.search));
router.post("/interactions", wrapAsync(wisdomController.getUserWisdomInteractions));

// Interaction routes (use the same controller as the forum)
router.post(
  "/content/interactions",
  wrapAsync(interactionController.createInteraction)
);
router.post("/content/comments", wrapAsync(interactionController.addComment));
router.get(
  "/content/comments/:contentType/:contentId",
  wrapAsync(interactionController.getComments)
);
router.post("/content/report", wrapAsync(interactionController.reportContent));
router.post("/content/share", wrapAsync(interactionController.shareContent));
router.post("/content/save", wrapAsync(interactionController.saveContent));

export default router;