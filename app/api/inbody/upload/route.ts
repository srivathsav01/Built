export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { extractWordsFromImage, extractInBodyData } from "@/lib/inbody";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("image") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const apiKey = process.env.OCR_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "OCR API key not configured" }, { status: 500 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const base64Image = buffer.toString("base64");

    const ocrResult = await extractWordsFromImage(base64Image, file.type, apiKey);

    if (!ocrResult.success) {
      return NextResponse.json({ error: ocrResult.error }, { status: 400 });
    }

    const inBodyData = extractInBodyData(ocrResult.lines);

    return NextResponse.json({ data: inBodyData });
  } catch (error: unknown) {
    console.error(error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}