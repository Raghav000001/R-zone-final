import { NextRequest, NextResponse } from "next/server"
import { authenticateRequest } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    console.log('Trainer /me endpoint called');
    const user = await authenticateRequest(request)
    console.log('Authenticated user:', user);
    
    if (!user || user.role !== "trainer") {
      console.log('User not authenticated as trainer:', user);
      return NextResponse.json({ error: "Not authenticated as trainer" }, { status: 401 })
    }

    const response = NextResponse.json({
      success: true,
      trainer: {
        id: user.userId,
        name: user.name,
        email: user.email,
        role: user.role,
      }
    });
    
    console.log('Returning trainer data:', response);
    return response;
  } catch (error) {
    console.error("Trainer auth check error:", error)
    return NextResponse.json({ error: "Authentication failed" }, { status: 401 })
  }
} 