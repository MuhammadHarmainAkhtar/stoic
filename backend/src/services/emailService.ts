import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Define the email sending function
const sendVerificationEmail = async (recipientEmail: string, verificationCode: string) => {
  try {
    console.log(`Preparing to send verification code ${verificationCode} to ${recipientEmail}`);
    
    // Choose which email service to use
    const useService = process.env.EMAIL_SERVICE || 'gmail';
    let transporter;
    
    if (useService === 'sendgrid') {
      // SendGrid setup
      transporter = nodemailer.createTransport({
        host: 'smtp.sendgrid.net',
        port: 587,
        secure: false,
        auth: {
          user: 'apikey', // Always 'apikey' for SendGrid
          pass: process.env.SENDGRID_API_KEY,
        },
      });
    } else {
      // Default Gmail setup
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_PASS,
        },
      });
    }
    
    // Verify the connection
    await transporter.verify();
    console.log('Email transporter verified');
    
    const mailOptions = {
      from: process.env.FROM_EMAIL || process.env.GMAIL_USER,
      to: recipientEmail,
      subject: 'Your Login Verification Code',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <title>Your Login Verification Code</title>
          </head>
          <body style="font-family: Arial, sans-serif;">
            <h2>Login Verification</h2>
            <p>Your verification code is: <strong>${verificationCode}</strong></p>
            <p>This code will expire in 1 hour.</p>
          </body>
        </html>
      `,
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Failed to send email:', error);
    throw error;
  }
};

export { sendVerificationEmail };