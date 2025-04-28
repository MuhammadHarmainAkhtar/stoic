import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Define the email sending function
const sendVerificationEmail = async (recipientEmail: string, verificationCode: string) => {
  try {
    console.log(`Preparing to send verification code ${verificationCode} to ${recipientEmail}`);
    
    // Create Gmail transporter with OAuth2
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD, // This should be an App Password, not your regular password
      },
    });
    
    // Verify the connection
    await transporter.verify();
    console.log('Email transporter verified');
    
    const mailOptions = {
      from: `"Auth Service" <${process.env.GMAIL_USER}>`,
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

// const sendVerificationEmail = async (recipientEmail: string, verificationCode: string) => {
//   try {
//     console.log(`Preparing to send verification code ${verificationCode} to ${recipientEmail}`);
    
//     // Create Gmail transporter with OAuth2
//     const transporter = nodemailer.createTransport({
//       service: 'gmail',
//       auth: {
//         user: process.env.GMAIL_USER,
//         pass: process.env.GMAIL_PASS,
//       },
//     });
    
//     // Verify the connection
//     const verify = await transporter.verify();
//     if (verify) {
//       console.log('Email transporter verified');
//     } else {
//       console.error('Email transporter verification failed');
//     }
    
//     const mailOptions = {
//       from: `"Auth Service" <${process.env.GMAIL_USER}>`,
//       to: recipientEmail,
//       subject: 'Your Login Verification Code',
//       html: `
//         <h2>Login Verification</h2>
//         <p>Your verification code is: <strong>${verificationCode}</strong></p>
//         <p>This code will expire in 1 hour.</p>
//       `,
//     };

//     // Send the email
//     const info = await transporter.sendMail(mailOptions);
//     console.log('Email sent:', info.messageId);
//     return info;
//   } catch (error) {
//     console.error('Failed to send email:', error);
//     throw error;
//   }
// };


export { sendVerificationEmail };