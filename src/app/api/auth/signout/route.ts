import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "../../../lib/supabase";

export async function POST(request: NextRequest) {
  try {
    // Parse the request body (could be form data or JSON)
    const contentType = request.headers.get("content-type") || "";
    let sessionId: string | null = null;

    if (contentType.includes("application/json")) {
      const body = await request.json();
      sessionId = body.sessionId;
    } else {
      const formData = await request.formData();
      sessionId = formData.get("sessionId") as string;
    }

    if (sessionId && supabaseAdmin) {
      // Delete the session from Supabase if you're storing sessions there
      await supabaseAdmin.from("sessions").delete().eq("id", sessionId);
    }

    // Create response with cookies to clear
    const response = NextResponse.json(
      { message: "Signed out successfully" },
      { status: 200 }
    );

    // Clear NextAuth session cookie
    response.cookies.set("next-auth.session-token", "", {
      expires: new Date(0),
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    response.cookies.set("next-auth.csrf-token", "", {
      expires: new Date(0),
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    return response;
  } catch (error) {
    console.error("Sign out error:", error);
    return NextResponse.json(
      { error: "Failed to sign out" },
      { status: 500 }
    );
  }
}