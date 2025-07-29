import { NextResponse } from "next/server"

export async function POST() {
  try {
    // Create response with success message
    const response = NextResponse.json({
      success: true,
      message: "Logged out successfully"
    })

    // Clear the trainer token cookie
    response.cookies.set("trainer-token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0, // Expire immediately
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Trainer logout error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 