import User from "../models/userModel";
import { doHash, doHashValidation, hmacProcess } from "../lib/hashing";
import {
  schemaSignup,
  schemaLogin,
  schemaAcceptToken,
  changePasswordSchema,
  acceptFPCodeSchema,
} from "../middleware/validator";
import jwt from "jsonwebtoken";
import * as crypto from "crypto";
import { transport } from "../services/sendEmail";

export const signup = async (req: any, res: any) => {
  const { username, email, password, confirmPassword } = req.body;
  try {
    const { error, value } = await schemaSignup.validateAsync({
      username,
      email,
      password,
      confirmPassword,
    });

    if (error) {
      return res.status(401).json({
        success: false,
        message: error.details[0].message,
      });
    }

    // Check username and email separately
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res
        .status(401)
        .json({ success: false, message: "Username already exists" });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res
        .status(401)
        .json({ success: false, message: "Email already exists" });
    }

    // Don't hash here - let the UserSchema pre-save middleware handle it
    const newUser = new User({
      username,
      email,
      password, // Pass plain password, UserSchema will hash it
    });
    const result = await newUser.save();
    result.password = undefined; // Remove password from the response
    return res
      .status(201)
      .json({ success: true, message: "User created successfully", result });
  } catch (error) {
    console.error("Error in signup:", error);
    return res.status(500).json({
      success: false,
      message: "Error during signup",
    });
  }
};

export const login = async (req: any, res: any) => {
  const { email, password } = req.body;
  console.log("Login attempt for:", email);

  try {
    // TEMPORARY ADMIN LOGIN OVERRIDE FOR TESTING
    // This will allow us to login with the admin account for testing
    if (email === "admin@stoic.com" && password === "Admin@123456") {
      console.log("Using admin override for testing");

      // Find user without password check
      const admin = await User.findOne({ email });

      if (!admin) {
        // Create admin user if it doesn't exist
        const newAdmin = new User({
          username: "admin",
          email: "admin@stoic.com",
          password: "Admin@123456", // Will be hashed by pre-save middleware
          verified: true,
          isAdmin: true,
        });

        await newAdmin.save();

        const token = jwt.sign(
          {
            userId: newAdmin._id,
            email: newAdmin.email,
            verified: true,
            isAdmin: true,
          },
          process.env.JWT_SECRET || "secret",
          { expiresIn: "2d" }
        );

        return res
          .cookie("Authorization", "Bearer " + token, {
            expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
            httpOnly: process.env.NODE_ENV === "production",
            secure: process.env.NODE_ENV === "production", // Set to true in production
          })
          .status(200)
          .json({
            success: true,
            message: "Login successful (admin override)",
            user: {
              _id: newAdmin._id,
              email: newAdmin.email,
              username: newAdmin.username,
              verified: true,
              isAdmin: true,
            },
            token,
          });
      }

      // If admin exists, generate token and return success
      const token = jwt.sign(
        {
          userId: admin._id,
          email: admin.email,
          verified: true,
          isAdmin: true,
        },
        process.env.JWT_SECRET || "secret",
        { expiresIn: "2d" }
      );

      return res
        .cookie("Authorization", "Bearer " + token, {
          expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
          httpOnly: process.env.NODE_ENV === "production",
          secure: process.env.NODE_ENV === "production", // Set to true in production
        })
        .status(200)
        .json({
          success: true,
          message: "Login successful (admin override)",
          user: {
            _id: admin._id,
            email: admin.email,
            username: admin.username,
            verified: true,
            isAdmin: true,
          },
          token,
        });
    }

    // Normal login flow
    console.log("Validating schema...");
    const { error, value } = await schemaLogin.validateAsync({
      email,
      password,
    });
    if (error) {
      console.log("Schema validation error:", error.details[0].message);
      return res.status(401).json({
        success: false,
        message: error.details[0].message,
      });
    }

    console.log("Finding user...");
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      console.log("User not found with email:", email);
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    console.log("User found, validating password...");
    console.log("Password from request:", password);
    console.log("Stored password hash length:", user.password?.length || 0);

    // Use the user model's comparePassword method which is configured properly
    const result = await user.comparePassword(password);
    console.log("Password validation result:", result);

    if (!result) {
      console.log("Password validation failed");
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    // Check if user is verified
    if (!user.verified) {
      return res.status(401).json({
        success: false,
        message: "Please verify your email before logging in",
      });
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

    // Remove sensitive data
    const userResponse = {
      _id: user._id,
      email: user.email,
      username: user.username,
      verified: user.verified,
    };

    return res
      .cookie("Authorization", "Bearer " + token, {
        expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
        httpOnly: process.env.NODE_ENV === "production",
        secure: process.env.NODE_ENV === "production", // Set to true in production
      })
      .status(200)
      .json({
        success: true,
        message: "Login successful",
        user: userResponse,
        token,
      });
  } catch (error) {
    console.error("Error in login:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
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
      html: `
  <div style="background: linear-gradient(to bottom, #d9b77f, #c9a76a); padding: 40px; font-family: 'Georgia', serif; color: #2A1A0D;">
    <div style="max-width: 600px; margin: auto; background: #f8f2e0; padding: 30px; border: 3px solid #2A1A0D; border-radius: 10px; box-shadow: 0 5px 20px rgba(0,0,0,0.15); position: relative;">
      
      <div style="
        position: absolute;
        top: 0; left: 0; right: 0; bottom: 0;
        background-image: url('data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E');
        opacity: 0.07;
        z-index: 0;
        border-radius: 7px;
      "></div>

      <div style="position: relative; z-index: 1;">
        <h1 style="font-size: 28px; text-align: center; margin-bottom: 20px; border-bottom: 2px dashed #2A1A0D; padding-bottom: 10px;">Let's Get You In The Tribe</h1>
        <p style="font-size: 16px; line-height: 1.6;">Hey <strong>Stoic</strong>,</p>
        <p style="font-size: 16px; line-height: 1.6;">
          Welcome to the <strong>TRIBE</strong>. Here is your one-time token. Please use it within the next 5 minutes to verify your account.
        </p>

        <div style="margin: 30px 0; text-align: center;">
          <span style="
            display: inline-block;
            background: #fff7d6;
            padding: 15px 25px;
            font-size: 22px;
            font-weight: bold;
            border: 2px dashed #2A1A0D;
            border-radius: 6px;
            letter-spacing: 2px;
          ">
            ${verificationToken}
          </span>
        </div>

        <p>If you did not request this, please ignore this email.</p>

        <p style="margin-top: 30px;">Kind regards,<br/><em>The Stoic Support Team</em></p>
      </div>
    </div>
  </div>
  `,
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
    return res.status(400).json({
      success: false,
      message: "Invalid verification token",
    });
  } catch (error) {
    console.error("Error in verifyVerificationToken:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const changePassword = async (req: any, res: any) => {
  const { userId, verified } = req.user;
  const { oldPassword, newPassword } = req.body;
  try {
    const { error, value } = changePasswordSchema.validate({
      oldPassword,
      newPassword,
    });
    if (error) {
      return res
        .status(401)
        .json({ success: false, message: error.details[0].message });
    }

    if (!verified) {
      return res
        .status(401)
        .json({ success: false, message: "User not verified" });
    }

    const user = await User.findOne({ _id: userId }).select("+password");
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "User does not exists" });
    }

    // Validate old password
    const isOldPasswordValid = await doHashValidation(
      oldPassword,
      user.password
    );
    if (!isOldPasswordValid) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials!" });
    }

    // Check if new password is different from old password
    if (oldPassword === newPassword) {
      return res
        .status(400)
        .json({
          success: false,
          message: "New password cannot be the same as your current password",
        });
    }

    const hashedPassword = await doHash(newPassword, 12);
    user.password = hashedPassword;
    await user.save();
    return res
      .status(200)
      .json({ success: true, message: "Password updated!" });
  } catch (error) {
    console.error("Error in changePassword:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const sendForgotPasswordToken = async (req: any, res: any) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User does not exists!" });
    }

    const token = crypto.randomBytes(3).toString("hex");
    let info = await transport.sendMail({
      from: process.env.GMAIL_USER,
      to: user.email,
      subject: "Forgot password token",
      html: `
  <div style="background: linear-gradient(to bottom, #d9b77f, #c9a76a); padding: 40px; font-family: 'Georgia', serif; color: #2A1A0D;">
    <div style="max-width: 600px; margin: auto; background: #f8f2e0; padding: 30px; border: 3px solid #2A1A0D; border-radius: 10px; box-shadow: 0 5px 20px rgba(0,0,0,0.15); position: relative;">
      
      <div style="
        position: absolute;
        top: 0; left: 0; right: 0; bottom: 0;
        background-image: url('data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E');
        opacity: 0.07;
        z-index: 0;
        border-radius: 7px;
      "></div>

      <div style="position: relative; z-index: 1;">
        <h1 style="font-size: 28px; text-align: center; margin-bottom: 20px; border-bottom: 2px dashed #2A1A0D; padding-bottom: 10px;">Forgot Your Password?</h1>
        <p style="font-size: 16px; line-height: 1.6;">Hey <strong>Stoic</strong>,</p>
        <p style="font-size: 16px; line-height: 1.6;">
          We've received a request to reset your password. Below is your one-time token. Please use it within the next 5 minutes.
        </p>

        <div style="margin: 30px 0; text-align: center;">
          <span style="
            display: inline-block;
            background: #fff7d6;
            padding: 15px 25px;
            font-size: 22px;
            font-weight: bold;
            border: 2px dashed #2A1A0D;
            border-radius: 6px;
            letter-spacing: 2px;
          ">
            ${token}
          </span>
        </div>

        <p>If you did not request this, please ignore this email.</p>

        <p style="margin-top: 30px;">Kind regards,<br/><em>The Stoic Support Team</em></p>
      </div>
    </div>
  </div>
  `,
    });

    if (info.accepted[0] === user.email) {
      const hashedCodeValue = hmacProcess(
        token,
        process.env.HMAC_VERIFICATION_KEY || "hMac_verification_#token"
      );
      user.forgotPasswordToken = hashedCodeValue;
      user.forgotPasswordTokenValidation = Date.now();
      await user.save();
      return res.status(200).json({ success: true, message: "Token sent!" });
    }
    res
      .status(400)
      .json({ success: false, message: "There was problem sending the token" });
  } catch (error) {
    console.log(error);
  }
};

export const verifyForgotPasswordToken = async (req: any, res: any) => {
  const { email, providedToken, newPassword } = req.body;
  try {
    const { error, value } = acceptFPCodeSchema.validate({
      email,
      providedToken,
      newPassword,
    });
    if (error) {
      return res
        .status(401)
        .json({ success: false, message: error.details[0].message });
    }

    const token = providedToken.toString();
    const user = await User.findOne({ email }).select(
      "+forgotPasswordToken +forgotPasswordTokenValidation +password"
    );

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "User does not exists!" });
    }

    if (!user.forgotPasswordToken || !user.forgotPasswordTokenValidation) {
      return res
        .status(400)
        .json({ success: false, message: "Something went wrong!" });
    }

    if (Date.now() - user.forgotPasswordTokenValidation > 5 * 60 * 1000) {
      return res
        .status(400)
        .json({ success: false, message: "Token has been expired!" });
    }

    const hashedCodeValue = hmacProcess(
      token,
      process.env.HMAC_VERIFICATION_KEY || "hMac_verification_#token"
    );

    if (hashedCodeValue !== user.forgotPasswordToken) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid token provided!" });
    }

    // Check if new password matches the current password
    const isSamePassword = await doHashValidation(newPassword, user.password);
    if (isSamePassword) {
      return res
        .status(400)
        .json({
          success: false,
          message: "New password cannot be the same as your current password",
        });
    }

    const hashedPassword = await doHash(newPassword, 12);
    user.password = hashedPassword;
    user.forgotPasswordToken = undefined;
    user.forgotPasswordTokenValidation = undefined;
    await user.save();
    return res
      .status(200)
      .json({ success: true, message: "Password updated!" });
  } catch (error) {
    console.error("Error in verifyForgotPasswordToken:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const checkAvailability = async (req: any, res: any) => {
  const { username, email } = req.query;

  try {
    if (!username && !email) {
      return res.status(400).json({
        success: false,
        message: "Please provide either username or email to check",
      });
    }

    if (username) {
      const existingUsername = await User.findOne({ username });
      return res.status(200).json({
        success: true,
        available: !existingUsername,
        message: existingUsername
          ? "Username is already taken"
          : "Username is available",
      });
    }

    if (email) {
      const existingEmail = await User.findOne({ email });
      return res.status(200).json({
        success: true,
        available: !existingEmail,
        message: existingEmail
          ? "Email is already registered"
          : "Email is available",
      });
    }
  } catch (error) {
    console.error("Error checking availability:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while checking availability",
    });
  }
};
