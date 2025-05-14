import express, { Request, Response } from "express";
import * as circleController from "../controllers/circleController";
import * as circlePostController from "../controllers/circlePostController";
import * as commentController from "../controllers/commentController";
import * as notificationController from "../controllers/notificationController";
import * as meetingController from "../controllers/meetingController";
import * as messageController from "../controllers/messageController";
import {
  protect,
  restrictToAdmin,
  restrictToGuru,
  restrictToCircleMembers,
} from "../middleware/authMiddleware";
import { uploadSingle, uploadMultiple } from "../middleware/uploadMiddleware";
import { wrapAsync } from "../middleware/routeHandler";

const router = express.Router();

// Circle routes
router.get("/circles", protect, wrapAsync(circleController.getAllCircles));
router.get("/circles/:id", protect, wrapAsync(circleController.getCircleById));
router.post(
  "/circles/default",
  protect,
  restrictToAdmin,
  wrapAsync(circleController.createDefaultCircles)
);
router.post(
  "/circles/join/request",
  protect,
  wrapAsync(circleController.requestToJoinCircle)
);
router.post(
  "/circles/request/process",
  protect,
  wrapAsync(circleController.processCircleRequest)
);
router.post(
  "/circles/create/request",
  protect,
  wrapAsync(circleController.requestToCreateCircle)
);
router.post(
  "/circles/invite",
  protect,
  wrapAsync(circleController.inviteUserToCircle)
);
router.post(
  "/circles/invite/process",
  protect,
  wrapAsync(circleController.processCircleInvite)
);
router.post(
  "/circles/members/remove",
  protect,
  wrapAsync(circleController.removeCircleMember)
);
router.post("/circles/leave", protect, wrapAsync(circleController.leaveCircle));
router.get(
  "/circles/ranking",
  protect,
  wrapAsync(circleController.updateCircleRanking)
);
router.get(
  "/user/circles",
  protect,
  wrapAsync(circleController.getUserCircles)
);

// Circle post routes
router.get(
  "/circles/:circleId/posts",
  protect,
  restrictToCircleMembers,
  wrapAsync(circlePostController.getCirclePosts)
);
router.post(
  "/circles/:circleId/posts",
  protect,
  restrictToCircleMembers,
  uploadMultiple("media", 5),
  wrapAsync(circlePostController.createCirclePost)
);
router.get(
  "/posts/:postId",
  protect,
  wrapAsync(circlePostController.getPostById)
);
router.put(
  "/posts/:postId",
  protect,
  wrapAsync(circlePostController.updatePost)
);
router.delete(
  "/posts/:postId",
  protect,
  wrapAsync(circlePostController.deletePost)
);
router.post(
  "/posts/:postId/upvote",
  protect,
  wrapAsync(circlePostController.upvotePost)
);
router.post(
  "/posts/:postId/downvote",
  protect,
  wrapAsync(circlePostController.downvotePost)
);
router.post(
  "/posts/:postId/save",
  protect,
  wrapAsync(circlePostController.savePost)
);
router.post(
  "/posts/:postId/share",
  protect,
  wrapAsync(circlePostController.sharePost)
);
router.get(
  "/user/posts/saved",
  protect,
  wrapAsync(circlePostController.getSavedPosts)
);

// Comment routes
router.get(
  "/posts/:postId/comments",
  protect,
  wrapAsync(commentController.getPostComments)
);
router.post(
  "/posts/:postId/comments",
  protect,
  wrapAsync(commentController.addComment)
);
router.delete(
  "/comments/:commentId",
  protect,
  wrapAsync(commentController.deleteComment)
);
router.post(
  "/comments/:commentId/upvote",
  protect,
  wrapAsync(commentController.upvoteComment)
);

// Notification routes
router.get(
  "/notifications",
  protect,
  wrapAsync(notificationController.getUserNotifications)
);
router.post(
  "/notifications/read",
  protect,
  wrapAsync(notificationController.markNotificationsAsRead)
);
router.post(
  "/notifications/read/all",
  protect,
  wrapAsync(notificationController.markAllNotificationsAsRead)
);
router.get(
  "/notifications/unread/count",
  protect,
  wrapAsync(notificationController.getUnreadNotificationCount)
);

// Meeting routes
router.post("/meetings", protect, wrapAsync(meetingController.createMeeting));
router.get(
  "/circles/:circleId/meetings",
  protect,
  restrictToCircleMembers,
  wrapAsync(meetingController.getCircleMeetings)
);
router.get(
  "/meetings/:meetingId",
  protect,
  wrapAsync(meetingController.getMeetingById)
);
router.post(
  "/meetings/:meetingId/join",
  protect,
  wrapAsync(meetingController.joinMeeting)
);
router.post(
  "/meetings/:meetingId/end",
  protect,
  wrapAsync(meetingController.endMeeting)
);
router.put(
  "/meetings/:meetingId",
  protect,
  wrapAsync(meetingController.updateMeeting)
);
router.delete(
  "/meetings/:meetingId",
  protect,
  wrapAsync(meetingController.deleteMeeting)
);

// Message routes
router.get(
  "/messages/users/:userId",
  protect,
  wrapAsync(messageController.getDirectMessages)
);
router.get(
  "/messages/circles/:circleId",
  protect,
  restrictToCircleMembers,
  wrapAsync(messageController.getCircleMessages)
);
router.post(
  "/messages/direct",
  protect,
  wrapAsync(messageController.sendDirectMessage)
);
router.post(
  "/messages/circle",
  protect,
  wrapAsync(messageController.sendCircleMessage)
);
router.get(
  "/messages/contacts",
  protect,
  wrapAsync(messageController.getMessageContacts)
);

// Upload routes
router.post(
  "/upload/:uploadType",
  protect,
  uploadSingle("file"),
  wrapAsync(async (req: Request, res: Response) => {
    // TypeScript fix: req.file comes from multer middleware
    const uploadedFile = req.file as Express.Multer.File | undefined;

    if (!uploadedFile) {
      return res.status(400).json({
        status: "error",
        message: "No file uploaded",
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        file: uploadedFile.path,
      },
    });
  })
);

export default router;
