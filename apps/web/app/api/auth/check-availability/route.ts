import { NextRequest, NextResponse } from 'next/server';
import { AvailabilityCheck } from '../../../../src/features/auth/types';

/**
 * Handler for checking username or email availability
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const url = new URL(req.url);
    const username = url.searchParams.get('username');
    const email = url.searchParams.get('email');
    
    if (!username && !email) {
      return NextResponse.json(
        { success: false, message: "Either username or email must be provided" },
        { status: 400 }
      );
    }
    
    // Call your backend API to check availability
    const API_URL = process.env.BACKEND_API_URL || "http://localhost:9000";
    const checkType = username ? 'username' : 'email';
    const checkValue = username || email;
    
    const response = await fetch(
      `${API_URL}/api/auth/check-availability?${checkType}=${encodeURIComponent(checkValue as string)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    
    const data = await response.json() as AvailabilityCheck;
    
    return NextResponse.json(data, { status: response.ok ? 200 : 400 });
    
  } catch (error) {
    console.error("Availability check error:", error);
    return NextResponse.json(
      {
        available: false,
        message: "Error checking availability"
      },
      { status: 500 }
    );
  }
}