import express from "express";
import * as postController from "../controllers/postController";
import * as interactionController from "../controllers/interactionController";
import { protect } from "../middleware/authMiddleware";
import { uploadMultiple } from "../middleware/uploadMiddleware";
import { wrapAsync } from "../middleware/routeHandler";

const router = express.Router();

// All forum routes require authentication
router.use(protect);

// Post routes
router.post(
  "/",
  uploadMultiple("files", 5), // Allow up to 5 files
  wrapAsync(postController.createPost)
);
router.get("/", wrapAsync(postController.getPosts));
router.get("/:id", wrapAsync(postController.getPostById));
router.put("/:id", wrapAsync(postController.updatePost));
router.delete("/:id", wrapAsync(postController.deletePost));
router.get("/user/:userId", wrapAsync(postController.getUserPosts));

// Interaction routes
router.post(
  "/interactions",
  wrapAsync(interactionController.createInteraction)
);
router.post("/comments", wrapAsync(interactionController.addComment));
router.get(
  "/comments/:contentType/:contentId",
  wrapAsync(interactionController.getComments)
);
router.delete(
  "/comments/:commentId",
  wrapAsync(interactionController.deleteComment)
);
router.post("/report", wrapAsync(interactionController.reportContent));
router.post("/share", wrapAsync(interactionController.shareContent));
router.get(
  "/user-interaction/:contentType/:contentId",
  wrapAsync(interactionController.getUserInteraction)
);

export default router;
