import { Request, Response } from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { sendVerificationEmail } from '../services/emailService';

// Interface for verification code storage with expiration
interface VerificationData {
  code: string;
  email: string;
  expires: Date;
}

// Store for verification codes (in production, use Redis or database)
const verificationStore: Record<string, VerificationData> = {};

// Function to register a new user
export const register = async (req: Request, res: Response) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Username, email and password are required' });
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [
        { email: email },
        { username: username }
      ] 
    });

    if (existingUser) {
      return res.status(400).json({ 
        message: 'User already exists with this email or username' 
      });
    }

    // Create new user
    const newUser = new User({
      username,
      email,
      password
    });

    // Generate verification code
    const verificationCode = crypto.randomInt(100000, 999999).toString();
    
    // Store code with 1-hour expiration
    const expiration = new Date(new Date().getTime() + 3600000);
    expiration.setHours(expiration.getHours() + 1);
    
    verificationStore[email] = {
      code: verificationCode,
      email: email,
      expires: expiration
    };

    // Save the user to database
    await newUser.save();
    
    // Try to send verification code to email
    try {
      await sendVerificationEmail(email, verificationCode);
      console.log('Verification email sent to:', email);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      
      // For development only - remove in production!
      if (process.env.NODE_ENV !== 'production') {
        return res.status(201).json({ 
          message: 'Registration successful. Please check your email for verification code.',
          userId: newUser._id,
          // REMOVE THIS IN PRODUCTION - only for testing when email doesn't work
          dev_verification_code: verificationCode
        });
      }
    }

    return res.status(201).json({ 
      message: 'Registration successful. Please check your email for verification code.',
      userId: newUser._id
    });
  } catch (error) {
    console.error('Error in register:', error);
    return res.status(500).json({ message: 'Error during registration' });
  }
};
// Function to log in a user
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '1d' }
    );

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Error in login:', error);
    return res.status(500).json({ message: 'Error during login' });
  }
};

// Function to verify code and activate user account
export const verifyCode = async (req: Request, res: Response) => {
  const { email, verificationCode } = req.body;

  if (!email || !verificationCode) {
    return res.status(400).json({ message: 'Email and verification code are required' });
  }

  try {
    // Check if verification data exists and is valid
    const verification = verificationStore[email];
    
    if (!verification) {
      return res.status(400).json({ message: 'No verification code found for this email' });
    }
    
    // Check if code has expired
    if (new Date() > verification.expires) {
      // Remove expired code
      delete verificationStore[email];
      return res.status(400).json({ message: 'Verification code has expired' });
    }
    
    // Check if code matches
    if (verificationCode !== verification.code) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }
    
    // Find the user
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Generate JWT token for automatic login
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '1d' }
    );
    
    // Remove verification code after successful verification
    delete verificationStore[email];
    
    return res.status(200).json({
      message: 'Verification successful, you are now logged in',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Error in verifyCode:', error);
    return res.status(500).json({ message: 'Error during verification' });
  }
};

// Resend verification code
export const resendVerificationCode = async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    // Check if user exists
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Generate new verification code
    const verificationCode = crypto.randomInt(100000, 999999).toString();
    
    // Update verification code with new expiration
    const expiration = new Date();
    expiration.setHours(expiration.getHours() + 1);
    
    verificationStore[email] = {
      code: verificationCode,
      email: email,
      expires: expiration
    };
    
    // Send verification code to email
    await sendVerificationEmail(email, verificationCode);
    
    return res.status(200).json({ 
      message: 'New verification code sent to email' 
    });
  } catch (error) {
    console.error('Error in resendVerificationCode:', error);
    return res.status(500).json({ message: 'Error sending verification email' });
  }
};