/**
 * API utilities for authentication endpoints
 */

import { NextRequest, NextResponse } from 'next/server';
import { VerifyEmailData } from '../types';

export interface SignupRequestBody {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginRequestBody {
  email: string;
  password: string;
}

export interface ChangePasswordRequestBody {
  oldPassword: string;
  newPassword: string;
}

export interface ForgotPasswordTokenRequestBody {
  email: string;
}

export interface ForgotPasswordVerifyRequestBody {
  email: string;
  providedToken: string;
  newPassword: string;
}

// Get backend API URL from environment variables or use empty string (which will use relative URLs)
const BACKEND_API_URL = process.env.BACKEND_API_URL || "";

/**
 * Handler for signup API requests
 */
export async function handleSignup(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json() as SignupRequestBody;
    const { username, email, password, confirmPassword } = body;
    
    // Validate request body
    if (!username || !email || !password || !confirmPassword) {
      return NextResponse.json(
        { success: false, message: "All fields are required" },
        { status: 400 }
      );
    }
    
    if (password !== confirmPassword) {
      return NextResponse.json(
        { success: false, message: "Passwords do not match" },
        { status: 400 }
      );
    }
    
    // Send request to backend API
    const backendResponse = await fetch(`${BACKEND_API_URL}/api/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // Include confirmPassword in the request to backend API
      body: JSON.stringify({ username, email, password, confirmPassword }),
    });
    
    const responseData = await backendResponse.json();
    
    if (backendResponse.ok) {
      return NextResponse.json(
        { 
          success: true, 
          message: "User created successfully",
          data: responseData.data
        },
        { status: 201 }
      );
    } else {
      return NextResponse.json(
        { 
          success: false, 
          message: responseData.message || "Failed to create user" 
        },
        { status: backendResponse.status }
      );
    }
    
  } catch (error) {
    console.error("Signup API error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Handler for login API requests
 */
export async function handleLogin(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json() as LoginRequestBody;
    const { email, password } = body;
    
    // Validate request body
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required" },
        { status: 400 }
      );
    }
    
    // Send request to backend API
    const backendResponse = await fetch(`${BACKEND_API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    
    const responseData = await backendResponse.json();
    
    if (backendResponse.ok) {
      return NextResponse.json(
        { 
          success: true, 
          message: "Login successful",
          data: responseData.data
        },
        { 
          status: 200,
          headers: backendResponse.headers // This forwards cookies if any
        }
      );
    } else {
      return NextResponse.json(
        { 
          success: false, 
          message: responseData.message || "Invalid credentials" 
        },
        { status: backendResponse.status }
      );
    }
    
  } catch (error) {
    console.error("Login API error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Handler for email verification API requests
 */
export async function handleVerifyEmail(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json() as VerifyEmailData;
    const { email, verificationToken } = body;
    
    // Validate request body
    if (!email || !verificationToken) {
      return NextResponse.json(
        { success: false, message: "Email and verification token are required" },
        { status: 400 }
      );
    }
    
    // Send request to backend API
    const backendResponse = await fetch(`${BACKEND_API_URL}/api/auth/verifyToken`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, verificationToken }),
    });
    
    const responseData = await backendResponse.json();
    
    if (backendResponse.ok) {
      return NextResponse.json(
        { 
          success: true, 
          message: responseData.message || "Email verified successfully"
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { 
          success: false, 
          message: responseData.message || "Failed to verify email" 
        },
        { status: backendResponse.status }
      );
    }
    
  } catch (error) {
    console.error("Email verification API error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Handler for sending verification email
 */
export async function handleSendVerificationEmail(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const { email } = body;
    
    // Validate request body
    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email is required" },
        { status: 400 }
      );
    }
    
    // Send request to backend API
    const backendResponse = await fetch(`${BACKEND_API_URL}/api/auth/sendVerificationToken`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });
    
    const responseData = await backendResponse.json();
    
    if (backendResponse.ok) {
      return NextResponse.json(
        { 
          success: true, 
          message: responseData.message || "Verification email sent successfully"
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { 
          success: false, 
          message: responseData.message || "Failed to send verification email" 
        },
        { status: backendResponse.status }
      );
    }
    
  } catch (error) {
    console.error("Send verification email API error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Handler for checking availability of username or email
 */
export async function handleCheckAvailability(req: NextRequest): Promise<NextResponse> {
  try {
    const url = new URL(req.url);
    const username = url.searchParams.get('username');
    const email = url.searchParams.get('email');
    
    if (!username && !email) {
      return NextResponse.json(
        { available: false, message: "Either username or email must be provided" },
        { status: 400 }
      );
    }
    
    const checkType = username ? 'username' : 'email';
    const checkValue = username || email;
    
    // Send request to backend API
    const backendResponse = await fetch(
      `${BACKEND_API_URL}/api/auth/check-availability?${checkType}=${encodeURIComponent(checkValue as string)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    
    const responseData = await backendResponse.json();
    
    return NextResponse.json(responseData, { status: backendResponse.ok ? 200 : 400 });
    
  } catch (error) {
    console.error("Availability check API error:", error);
    return NextResponse.json(
      {
        available: false,
        message: "Error checking availability"
      },
      { status: 500 }
    );
  }
}

/**
 * Handler for change password API requests
 */
export async function handleChangePassword(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json() as ChangePasswordRequestBody;
    const { oldPassword, newPassword } = body;
    
    // Validate request body
    if (!oldPassword || !newPassword) {
      return NextResponse.json(
        { success: false, message: "Old and new passwords are required" },
        { status: 400 }
      );
    }
    
    // Forward the Authorization cookie from the request
    const authCookie = req.cookies.get('Authorization')?.value;
    
    if (!authCookie) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }
    
    // Send request to backend API
    const backendResponse = await fetch(`${BACKEND_API_URL}/api/auth/changePassword`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authCookie
      },
      body: JSON.stringify({ oldPassword, newPassword }),
    });
    
    const responseData = await backendResponse.json();
    
    if (backendResponse.ok) {
      return NextResponse.json(
        { 
          success: true, 
          message: responseData.message || "Password changed successfully"
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { 
          success: false, 
          message: responseData.message || "Failed to change password" 
        },
        { status: backendResponse.status }
      );
    }
    
  } catch (error) {
    console.error("Change password API error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Handler for sending forgot password token
 */
export async function handleSendForgotPasswordToken(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json() as ForgotPasswordTokenRequestBody;
    const { email } = body;
    
    // Validate request body
    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email is required" },
        { status: 400 }
      );
    }
    
    // Send request to backend API
    const backendResponse = await fetch(`${BACKEND_API_URL}/api/auth/sendFPToken`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });
    
    const responseData = await backendResponse.json();
    
    if (backendResponse.ok) {
      return NextResponse.json(
        { 
          success: true, 
          message: responseData.message || "Password reset token sent successfully"
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { 
          success: false, 
          message: responseData.message || "Failed to send password reset token" 
        },
        { status: backendResponse.status }
      );
    }
    
  } catch (error) {
    console.error("Send forgot password token API error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Handler for verifying forgot password token and resetting password
 */
export async function handleVerifyForgotPasswordToken(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json() as ForgotPasswordVerifyRequestBody;
    const { email, providedToken, newPassword } = body;
    
    // Validate request body
    if (!email || !providedToken || !newPassword) {
      return NextResponse.json(
        { success: false, message: "Email, token and new password are required" },
        { status: 400 }
      );
    }
    
    // Send request to backend API
    const backendResponse = await fetch(`${BACKEND_API_URL}/api/auth/verifyFPToken`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, providedToken, newPassword }),
    });
    
    const responseData = await backendResponse.json();
    
    if (backendResponse.ok) {
      return NextResponse.json(
        { 
          success: true, 
          message: responseData.message || "Password reset successful"
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { 
          success: false, 
          message: responseData.message || "Failed to reset password" 
        },
        { status: backendResponse.status }
      );
    }
    
  } catch (error) {
    console.error("Verify forgot password token API error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}