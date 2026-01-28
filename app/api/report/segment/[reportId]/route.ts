
import { supabaseServer } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(
  req: Request,
  { params }: { params: { reportId: string } }
) {
    const reportId = await params;
    console.log(reportId.reportId)
  const supabase = await supabaseServer()

  const { data, error } = await supabase
    .from("SegmentMeasurement")
    .select("*")
    .eq("reportId", reportId.reportId)
    .order("segment")

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data) 
}
