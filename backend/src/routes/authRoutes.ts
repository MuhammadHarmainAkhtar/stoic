import { Router, Request, Response, NextFunction } from 'express';
import { sendVerificationCode, verifyCode } from '../controllers/authController';

const router = Router();

// Example POST route for authentication (login)
router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Handle login logic here
    res.json({ message: 'Login successful!' });
  } catch (error) {
    next(error); // Pass errors to error handling middleware
  }
});

// Example POST route for user registration
router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Handle user registration logic here
    res.json({ message: 'Registration successful!' });
  } catch (error) {
    next(error);
  }
});

// Route to send verification code to user's email
router.post('/send-verification', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await sendVerificationCode(req, res); // Call the controller function
  } catch (error) {
    next(error);
  }
});

// Route to verify the code entered by the user
router.post('/verify-code', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await verifyCode(req, res); // Call the controller function
  } catch (error) {
    next(error);
  }
});

export default router;
