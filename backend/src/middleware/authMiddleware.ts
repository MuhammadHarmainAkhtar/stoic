import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

// Extend the Request type to include user
export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    [key: string]: any;
  };
}

interface JWTPayload extends JwtPayload {
  userId: string;
}

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.substring(7)
      : null;

    if (!token) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Verify token with proper type assertion
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-default-secret"
    ) as JWTPayload;

    if (!decoded.userId) {
      return res.status(401).json({ message: "Invalid token format" });
    }

    // Assign user data to request, excluding userId from spread to avoid duplication
    const { userId, ...rest } = decoded;
    (req as AuthenticatedRequest).user = {
      userId,
      ...rest,
    };

    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

export const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || "your-default-secret", {
    expiresIn: "7d", // Token expires in 7 days
  });
};
