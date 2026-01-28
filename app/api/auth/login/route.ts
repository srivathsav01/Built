import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { LoginDTOSchema } from "@/lib/schemas/auth.dto";
import { UserDTOSchema } from "@/lib/schemas/user.dto";
import { supabaseServer } from '@/lib/supabase/server';
export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Validate request body
    const validationResult = LoginDTOSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { email, password } = validationResult.data;

    const supabase = await supabaseServer();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
  
    if (error) {
      return NextResponse.json(
        { error: "Unable to Login", details: error?.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: "Login successful",
      user:email,
    });
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
