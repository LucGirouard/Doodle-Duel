import bcrypt from "bcryptjs";
import { supabaseAdmin } from "../../../lib/supabase";

export async function POST(request: Request) {
  try {
    if (!supabaseAdmin) {
      return Response.json(
        { error: "Supabase not configured" },
        { status: 500 }
      );
    }

    const { email, password, confirmPassword } = await request.json();

    if (!email || !password || !confirmPassword) {
      return Response.json(
        { error: "Email and password required" },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return Response.json(
        { error: "Passwords do not match" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const { data: existingUser } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (existingUser) {
      return Response.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user in Supabase
    const { data: newUser, error } = await supabaseAdmin
      .from("users")
      .insert([
        {
          email,
          password_hash: passwordHash,
        },
      ])
      .select()
      .single();

    if (error) {
      return Response.json(
        { error: "Failed to create user" },
        { status: 400 }
      );
    }

    return Response.json(
      { message: "User created successfully", user: newUser },
      { status: 201 }
    );
  } catch (error) {
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
