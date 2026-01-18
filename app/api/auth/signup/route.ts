import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SignUpDTOSchema } from "@/lib/schemas/auth.dto";
import { CreateUserDTO, CreateUserDTOSchema, UserDTOSchema } from "@/lib/schemas/user.dto";
import { supabaseServer } from '@/lib/supabase/server';

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const supabase = await supabaseServer();
    const validationResult = SignUpDTOSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { email, password, name } = validationResult.data;
    const userData: CreateUserDTO = {
      email,
      name: name || undefined,
    };

    const userValidation = CreateUserDTOSchema.safeParse(userData);
    if (!userValidation.success) {
      return NextResponse.json(
        { error: "Invalid user data", details: userValidation.error.issues },
        { status: 400 }
      );
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {display_name: `${name}`}
      }
    });

    if (error || !data.user) {
      return NextResponse.json(
        { error: "Signup failed", details: error?.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: "Account created successfully",
      user : data.user,
    }, { status: 201 });
  } catch (error: any) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
