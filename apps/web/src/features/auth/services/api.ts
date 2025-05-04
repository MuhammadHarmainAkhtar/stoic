/**
 * API utilities for authentication endpoints
 */

import { NextRequest, NextResponse } from 'next/server';

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
    // This makes it work both locally and in production
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