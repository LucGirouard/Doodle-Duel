import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { supabaseAdmin } from "../../../lib/supabase";

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Type guard to ensure id exists
    const userId = (session.user as { id?: string; email: string }).id;
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if Supabase is configured
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Supabase not configured" },
        { status: 500 }
      );
    }

    const { artScore, pvpScore, artistScore } = await request.json();

    // Validate that at least one score is provided
    if (artScore === undefined && pvpScore === undefined && artistScore === undefined) {
      return NextResponse.json(
        { error: "At least one score must be provided" },
        { status: 400 }
      );
    }

    // Build update object
    const updateData: Record<string, number> = {};
    if (artScore !== undefined) updateData.art_score = artScore;
    if (pvpScore !== undefined) updateData.pvp_score = pvpScore;
    if (artistScore !== undefined) updateData.artist_score = artistScore;

    // Get user email from session
    const userEmail = session.user.email;

    // First, check if the user already has a leaderboard entry
    const { data: existingEntry } = await supabaseAdmin
      .from("leaderboard")
      .select("id")
      .eq("user_id", userId)
      .single();

    let result;
    if (existingEntry) {
      // Update existing entry
      result = await supabaseAdmin
        .from("leaderboard")
        .update(updateData)
        .eq("user_id", userId);
    } else {
      // Create new entry with user_id and email
      const insertData = {
        user_id: userId,
        email: userEmail || `user_${userId}`,
        ...updateData
      };
      result = await supabaseAdmin
        .from("leaderboard")
        .insert(insertData);
    }

    if (result.error) {
      console.error("Leaderboard operation error:", result.error);
      return NextResponse.json(
        { error: "Failed to update leaderboard" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Leaderboard updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Leaderboard update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}