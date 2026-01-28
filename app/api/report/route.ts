import { supabaseServer } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  const supabase = await supabaseServer();

  const { data, error } = await supabase.from("InbodyReport").insert({
    user_id: user.id,
    scan_date: body.scan_date,
    weight: body.weight,
    skeletal_muscle_mass: body.skeletal_muscle_mass,
    body_fat_percentage: body.body_fat_percentage,
    body_water: body.body_water,
    bmi: body.bmi,
    image_url: body.image_url,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
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


