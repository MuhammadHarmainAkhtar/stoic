import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables from .env.local

// Create a test account using Ethereal for development
// For production, you should use real SMTP credentials
const createTestAccount = async () => {
  const testAccount = await nodemailer.createTestAccount();
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
};

// Initialize transporter
let transporter: nodemailer.Transporter;
const initializeTransporter = async () => {
  if (process.env.NODE_ENV === 'production') {
    // Use your production SMTP configuration
    transporter = nodemailer.createTransport({
      // Configure your production SMTP settings here
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // Use Ethereal for development
    transporter = await createTestAccount();
  }
};

// Send verification email
export const sendVerificationEmail = async (email: string, code: string) => {
  if (!transporter) {
    await initializeTransporter();
  }

  const mailOptions = {
    from: '"Stoic Tribe" <noreply@stoictribe.com>',
    to: email,
    subject: 'Verify Your Email - Stoic Tribe',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2A1A0D;">Welcome to Stoic Tribe</h2>
        <p>Thank you for joining our community. To complete your registration, please use the following verification code:</p>
        <div style="background-color: #f8f0d9; padding: 20px; text-align: center; border-radius: 5px; margin: 20px 0;">
          <h1 style="color: #2A1A0D; font-size: 32px; letter-spacing: 5px;">${code}</h1>
        </div>
        <p>This code will expire in 30 minutes.</p>
        <p>If you didn't request this verification, please ignore this email.</p>
        <hr style="border-top: 1px solid #2A1A0D; margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">Stoic Tribe - Embrace the Ancient Spirit</p>
      </div>
    `,
  };

  const info = await transporter.sendMail(mailOptions);

  if (process.env.NODE_ENV !== 'production') {
    // Log preview URL in development (Ethereal)
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  }

  return info;
};
