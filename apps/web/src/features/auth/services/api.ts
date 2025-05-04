/**
 * API utilities for authentication endpoints
 */

import { NextRequest, NextResponse } from 'next/server';
import { LoginCredentials, VerifyEmailData } from '../types';

// Types
interface ApiResponse {
  success: boolean;
  message: string;
  data?: any;
}

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
    
    // Get backend API URL from environment variables or use default
    const backendUrl = process.env.BACKEND_API_URL || "http://localhost:9000";
    
    // Send request to backend API
    const backendResponse = await fetch(`${backendUrl}/api/auth/signup`, {
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
    
    // Get backend API URL from environment variables or use default
    const backendUrl = process.env.BACKEND_API_URL || "http://localhost:9000";
    
    // Send request to backend API
    const backendResponse = await fetch(`${backendUrl}/api/auth/login`, {
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
    
    // Get backend API URL from environment variables or use default
    const backendUrl = process.env.BACKEND_API_URL || "http://localhost:9000";
    
    // Send request to backend API
    const backendResponse = await fetch(`${backendUrl}/api/auth/verifyToken`, {
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
    
    // Get backend API URL from environment variables or use default
    const backendUrl = process.env.BACKEND_API_URL || "http://localhost:9000";
    
    // Send request to backend API
    const backendResponse = await fetch(`${backendUrl}/api/auth/sendVerificationToken`, {
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
    
    // Get backend API URL from environment variables or use default
    const backendUrl = process.env.BACKEND_API_URL || "http://localhost:9000";
    const checkType = username ? 'username' : 'email';
    const checkValue = username || email;
    
    // Send request to backend API
    const backendResponse = await fetch(
      `${backendUrl}/api/auth/check-availability?${checkType}=${encodeURIComponent(checkValue as string)}`,
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