import express from "express";
import * as ritualController from "../controllers/ritualController";
import * as interactionController from "../controllers/interactionController";
import { protect } from "../middleware/authMiddleware";
import { uploadMultiple } from "../middleware/uploadMiddleware";
import { wrapAsync } from "../middleware/routeHandler";

const router = express.Router();

// All ritual routes require authentication
router.use(protect);

// Ritual routes
router.post(
  "/",
  uploadMultiple("files", 5), // Allow up to 5 files
  wrapAsync(ritualController.createRitual)
);
router.get("/", wrapAsync(ritualController.getRituals));
router.get("/:id", wrapAsync(ritualController.getRitualById));
router.put("/:id", wrapAsync(ritualController.updateRitual));
router.delete("/:id", wrapAsync(ritualController.deleteRitual));

// Adoption routes
router.post("/:ritualId/adopt", wrapAsync(ritualController.adoptRitual));
router.put(
  "/adoption/:adoptionId/progress",
  wrapAsync(ritualController.updateAdoptionProgress)
);
router.patch(
  "/adoption/:adoptionId/abandon",
  wrapAsync(ritualController.abandonAdoption)
);
router.get("/user/adoptions", wrapAsync(ritualController.getUserAdoptions));

// Interaction routes (use the same controller as the forum)
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
router.post("/save", wrapAsync(interactionController.saveContent));
router.get(
  "/user-interaction/:contentType/:contentId",
  wrapAsync(interactionController.getUserInteraction)
);

export default router;
