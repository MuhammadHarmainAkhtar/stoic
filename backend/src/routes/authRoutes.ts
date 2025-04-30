import { Router } from "express";
import {
  signup,
  login,
  logout,
  sendVerificationToken,
  verifyVerificationToken,
} from "../controllers/authController";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.patch("/sendVerificationToken", sendVerificationToken);
router.patch("/verifyToken", verifyVerificationToken);

export default router;
