import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username");
    const email = searchParams.get("email");

    if (!username && !email) {
      return NextResponse.json(
        { success: false, message: "Please provide either username or email" },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/check-availability${request.url.split("/check-availability")[1]}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error checking availability:", error);
    return NextResponse.json(
      { success: false, message: "Error checking availability" },
      { status: 500 }
    );
  }
}