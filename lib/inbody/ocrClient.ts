import { ocrSpace } from "ocr-space-api-wrapper";
import type { Word } from "./types";

export type OcrResult = {
  success: true;
  lines: Word[][];
} | {
  success: false;
  error: string;
};

export async function extractWordsFromImage(
  base64Image: string,
  mimeType: string,
  apiKey: string
): Promise<OcrResult> {
  const base64String = `data:${mimeType};base64,${base64Image}`;
  
  const result = await ocrSpace(base64String, {
    apiKey,
    isOverlayRequired: true,
    scale: true,
  });

  if (!result?.ParsedResults?.[0] || result.ParsedResults[0].FileParseExitCode !== 1) {
    return {
      success: false,
      error: result?.ParsedResults?.[0]?.ErrorMessage || "OCR processing failed",
    };
  }

  const lines = result.ParsedResults[0].TextOverlay.Lines.map(
    (l: { Words: Word[] }) => l.Words
  ) as Word[][];

  return { success: true, lines };
}
