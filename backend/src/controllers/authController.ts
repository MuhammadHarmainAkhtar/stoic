const User = require("../models/userModel");
import { doHash, doHashValidation, hmacProcess } from "../lib/hashing";
import {
  schemaSignup,
  schemaLogin,
  schemaAcceptToken,
} from "../middleware/validator";
import jwt from "jsonwebtoken";
import * as crypto from "crypto";
import { transport } from "../services/sendEmail";

export const signup = async (req: any, res: any) => {
  const { username, email, password } = req.body;
  try {
    const { error, value } = await schemaSignup.validateAsync({
      username,
      email,
      password,
    });
    if (error) {
      return res.status(401).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const existingUser = await User.findOne({ username, email });
    if (existingUser) {
      return res
        .status(401)
        .json({ success: false, message: "User already exists" });
    }
    const hashedPassword = await doHash(password, 12);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });
    const result = await newUser.save();
    result.password = undefined; // Remove password from the response
    res
      .status(201)
      .json({ success: true, message: "User created successfully", result });
  } catch (error) {
    console.error("Error in signup:", error);
    return res.status(500).json({ message: "Error during signup" });
  }

  res.json({ message: "Signup successful" });
};

export const login = async (req: any, res: any) => {
  const { email, password } = req.body;
  try {
    const { error, value } = await schemaLogin.validateAsync({
      email,
      password,
    });
    if (error) {
      return res.status(401).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }
    const result = await doHashValidation(password, user.password);
    if (!result) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        verified: user.verified,
      },
      process.env.JWT_SECRET || "secret",
      {
        expiresIn: "2d",
      }
    );
    console.log("token", token);
    res
      .cookie("Authorization", "Bearer" + token, {
        expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
        httpOnly: process.env.NODE_ENV === "production",
        secure: process.env.NODE_ENV === "production", // Set to true in production
      })
      .json({
        success: true,
        message: "Login successful",
        token,
      });
    res.status(200).json({ success: true, message: "Login successful", user });
  } catch (error) {
    console.error("Error in login:", error);
  }
};

export const logout = async (req: any, res: any) => {
  res.clearCookie("Authorization").status(200).json({
    success: true,
    message: "Logout successful",
  });
};

export const sendVerificationToken = async (req: any, res: any) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    if (user.verified) {
      return res.status(400).json({
        success: false,
        message: "User already verified",
      });
    }

    const verificationToken = crypto.randomBytes(3).toString("hex");
    const info = await transport.sendMail({
      from: process.env.GMAIL_USER,
      to: user.email,
      subject: "Verification Token",
      html: `<p>Your verification token is: <strong>${verificationToken}</strong></p>`,
    });

    if (info.accepted[0] === user.email) {
      const hashedCodedToken = hmacProcess(
        verificationToken,
        process.env.HMAC_VERIFICATION_KEY || "hMac_verification_#token"
      );
      user.verificationToken = hashedCodedToken;
      user.verificationTokenValidation = Date.now();
      await user.save();
      return res.status(200).json({
        success: true,
        message: "Verification Token has been sent to your email",
      });
    }

    return res.status(400).json({
      success: false,
      message: "Failed to send verification token",
    });
  } catch (error) {
    console.error("Error in sendVerificationToken:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const verifyVerificationToken = async (req: any, res: any) => {
  const { email, verificationToken } = req.body;
  try {
    verificationToken;
    const { error, value } = await schemaAcceptToken.validateAsync({
      email,
      verificationToken,
    });
    if (error) {
      return res.status(401).json({
        success: false,
        message: error.details[0].message,
      });
    }
    const token = verificationToken.toString();
    const user = await User.findOne({ email }).select(
      "+verificationToken +verificationTokenValidation"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    if (user.verified) {
      return res.status(400).json({
        success: false,
        message: "User already verified",
      });
    }
    if (!user.verificationToken || !user.verificationTokenValidation) {
      return res.status(400).json({
        success: false,
        message: "Verification token not found",
      });
    }
    if (Date.now() - user.verificationTokenValidation > 5 * 60 * 1000) {
      return res.status(400).json({
        success: false,
        message: "Verification token expired",
      });
    }

    const hashedTokenVal = hmacProcess(
      token,
      process.env.HMAC_VERIFICATION_KEY || "hMac_verification_#token"
    );
    if (hashedTokenVal === user.verificationToken) {
      user.verified = true;
      user.verificationToken = undefined;
      user.verificationTokenValidation = undefined;
      await user.save();
      return res.status(200).json({
        success: true,
        message: "User verified successfully",
      });
    }
  } catch (error) {
    console.error("Error in verifyVerificationToken:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
