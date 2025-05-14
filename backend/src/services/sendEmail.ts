import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
  throw new Error(
    "Missing required email configuration. Please check your .env file."
  );
}

export const transport = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

transport.verify((error) => {
  if (error) {
    console.error("Error with email configuration:", error);
  } else {
    console.log("Server is ready to send emails");
  }
});
