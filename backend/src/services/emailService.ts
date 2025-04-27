import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables from .env.local

// Create a Nodemailer transporter using Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER, // your Gmail email address
    pass: process.env.GMAIL_PASS, // your Gmail app password
  },
});

// Define the email sending function
const sendVerificationEmail = async (recipientEmail: string, verificationCode: string) => {
  try {
    const mailOptions = {
      from: process.env.GMAIL_USER, // Sender address
      to: recipientEmail,           // Recipient address
      subject: 'Hey Stoic, Here is Your Login Verification Code', // Subject line
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <title>Your Login Verification Code</title>
          </head>
          <body style="font-family: Arial, sans-serif; color: #333; background-color: #f7f7f7; padding: 20px;">
            <table style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; padding: 20px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
              <tr>
                <td>
                  <h2 style="text-align: center; color: #333;">Login Verification</h2>
                  <p style="font-size: 16px; line-height: 1.5;">Hello,</p>
                  <p style="font-size: 16px; line-height: 1.5;">Please use the following code to complete your login process:</p>
                  <p style="font-size: 24px; font-weight: bold; text-align: center; padding: 10px; background-color: #e9ecef; border-radius: 6px;">
                    <strong>${verificationCode}</strong>
                  </p>
                  <p style="font-size: 16px; line-height: 1.5;">If you did not request this login, please ignore this email or contact support immediately.</p>
                  <p style="font-size: 14px; color: #666; text-align: center;">
                    <small>If you are having trouble receiving this email, check your spam folder.</small>
                  </p>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
    };

    // Send the email
    await transporter.sendMail(mailOptions);
    console.log('Verification email sent successfully!');
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

export { sendVerificationEmail };