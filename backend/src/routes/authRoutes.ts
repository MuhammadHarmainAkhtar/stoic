import { Router, Request, Response, NextFunction } from 'express';
import { 
  login, 
  register, 
  verifyCode, 
  resendVerificationCode 
} from '../controllers/authController';
import authMiddleware, { AuthRequest } from '../middleware/authMiddleware';

// Create the router
const router = Router();

// Authentication routes
router.post('/register', (req: Request, res: Response, next: NextFunction) => {
  register(req, res).catch(next);
});

router.post('/login', (req: Request, res: Response, next: NextFunction) => {
  login(req, res).catch(next);
});

router.post('/verify-code', (req: Request, res: Response, next: NextFunction) => {
  verifyCode(req, res).catch(next);
});

router.post('/resend-verification', (req: Request, res: Response, next: NextFunction) => {
  resendVerificationCode(req, res).catch(next);
});

// Protected route using the AuthRequest interface imported from the middleware
router.get('/protected', authMiddleware, (req: AuthRequest, res: Response) => {
  res.json({ message: 'This is a protected route', user: req.user });
});

export default router;