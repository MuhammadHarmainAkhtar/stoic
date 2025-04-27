// src/controllers/authController.ts

import { Request, Response } from 'express';
import crypto from 'crypto'; // To generate random codes
import { sendVerificationEmail } from '../services/emailService';

// Function to send a verification code to the user's email
export const sendVerificationCode = async (req: Request, res: Response) => {
  const { email } = req.body; // Get email from the request body

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    // Generate a random 6-digit verification code
    const verificationCode = crypto.randomInt(100000, 999999).toString();

    // Save the verification code temporarily (you can store it in a database or in-memory for actual use)
    // This is just a placeholder for demo purposes
    // In a real application, you should store it securely and expire it after a set time
    req.app.locals.verificationCode = verificationCode;
    req.app.locals.verificationEmail = email;

    // Send the verification code to the user's email
    await sendVerificationEmail(email, verificationCode);

    return res.status(200).json({ message: 'Verification code sent to email' });
  } catch (error) {
    console.error('Error in sendVerificationCode:', error);
    return res.status(500).json({ message: 'Error sending verification email' });
  }
};

// Function to verify the code entered by the user
export const verifyCode = (req: Request, res: Response) => {
  const { email, verificationCode } = req.body;

  if (!email || !verificationCode) {
    return res.status(400).json({ message: 'Email and verification code are required' });
  }

  // Check if the verification code matches the one sent earlier
  if (
    email === req.app.locals.verificationEmail &&
    verificationCode === req.app.locals.verificationCode
  ) {
    // If the code is correct, allow the user to log in
    return res.status(200).json({ message: 'Verification successful, you can now log in' });
  } else {
    // If the code doesn't match
    return res.status(400).json({ message: 'Invalid verification code' });
  }
};