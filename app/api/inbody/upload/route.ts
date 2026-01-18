export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { ocrSpace } from "ocr-space-api-wrapper";
export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("image") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const base64Image = buffer.toString('base64');
    const base64String = `data:${file.type};base64,${base64Image}`;
    const result = await ocrSpace(base64String, { apiKey: process.env.OCR_KEY, isOverlayRequired: true, scale:true });

    return NextResponse.json({
      result
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}