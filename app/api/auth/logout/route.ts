import { NextResponse } from "next/server"

export async function POST() {
  try {
    console.log('Processing logout request...');
    
    // Create response with success message
    const response = NextResponse.json({
      success: true,
      message: "Logged out successfully"
    });

    // Clear the auth token cookie with all possible configurations
    const cookieConfigs = [
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax" as const,
        maxAge: 0,
        path: "/",
      },
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", 
        sameSite: "lax" as const,
        maxAge: 0,
        path: "/admin",
      },
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax" as const, 
        maxAge: 0,
        path: "/api",
      }
    ];

    // Clear cookies with different path variations
    cookieConfigs.forEach((config, index) => {
      response.cookies.set("auth-token", "", config);
    });

    // Also clear trainer token if it exists
    response.cookies.set("trainer-token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    });

    // Add cache control headers to prevent caching
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    console.log('Logout successful - cookies cleared');
    
    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}