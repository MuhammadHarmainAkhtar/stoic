import { Router } from "express";
import {
  signup,
  login,
  logout,
  sendVerificationToken,
  verifyVerificationToken,
  changePassword,
  sendForgotPasswordToken,
  verifyForgotPasswordToken,
} from "../controllers/authController";
import { identifier } from "../middleware/identifier";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.patch("/sendVerificationToken", sendVerificationToken);
router.patch("/verifyToken", verifyVerificationToken);
router.patch("/changePassword", identifier, changePassword);
router.patch("/sendFPToken", sendForgotPasswordToken);
router.patch("/verifyFPToken", verifyForgotPasswordToken);

export default router;
