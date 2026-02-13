import { supabaseServer } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  const supabase = await supabaseServer();

  const { data, error } = await supabase.from("InbodyReport").insert({
    userId: user.id,
    date: body.testDateTime,
    weight: body.weight,
    height: body.height,
    age: body.age,
    skeletalMuscleMass: body.skeletalMuscleMass,
    bodyFatPct: body.pbf,
    bodyFatMass: body.bodyFatMass,
    totalBodyWater: body.totalBodyWater,
    protein: body.protein,
    mineral: body.mineral,
    bodyMassIndex: body.bmi,
  }).select();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, data });
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const supabase = await supabaseServer();

  const { data, error } = await supabase
    .from("InbodyReport")
    .select("*")
    .order("date", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}


