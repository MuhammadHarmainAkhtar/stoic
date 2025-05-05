import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ 
        success: false, 
        message: "No authorization token provided" 
      }, { status: 401 });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Get backend API URL from environment variables or use default
    const backendUrl = process.env.BACKEND_API_URL || "http://localhost:9000";
    
    // Forward request to backend for validation
    const backendResponse = await fetch(`${backendUrl}/api/auth/validate-token`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    const responseData = await backendResponse.json();
    
    if (backendResponse.ok) {
      return NextResponse.json({ 
        success: true,
        message: "Token is valid",
        data: responseData.data
      }, { status: 200 });
    } else {
      return NextResponse.json({ 
        success: false, 
        message: responseData.message || "Invalid token" 
      }, { status: backendResponse.status });
    }
    
  } catch (error) {
    console.error("Token validation API error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}