import { Router, Request, Response, NextFunction } from "express";
import {
  register,
  verifyEmail,
  login,
  sendVerificationCode,
} from "../controllers/authController";
import { body, validationResult } from "express-validator";

const router = Router();

// Input validation middleware
const registerValidation = [
  body("username").trim().isLength({ min: 3 }).escape(),
  body("email").trim().isEmail().normalizeEmail(),
  body("password").isLength({ min: 6 }),
];

const loginValidation = [
  body("email").trim().isEmail().normalizeEmail(),
  body("password").exists(),
];

const verifyEmailValidation = [
  body("email").trim().isEmail().normalizeEmail(),
  body("verificationCode").trim().isLength({ min: 6, max: 6 }),
];

// Validation middleware with proper typing
const validate = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  next();
};

// Routes with proper error handling
router.post(
  "/register",
  registerValidation,
  validate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await register(req, res);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/verify-email",
  verifyEmailValidation,
  validate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await verifyEmail(req, res);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/login",
  loginValidation,
  validate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await login(req, res);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/resend-verification",
  body("email").trim().isEmail().normalizeEmail(),
  validate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await sendVerificationCode(req, res);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
