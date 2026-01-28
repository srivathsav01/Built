"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLoading } from "@/lib/context/LoadingContext";
import { useState, useTransition } from "react";

type Word = {
  WordText: string
  Left: number
  Top: number
  Width: number
  Height: number
}

type InBodyData = {
  totalBodyWater?: number
  protein?: number
  mineral?: number
  bodyFatMass?: number
  skeletalMuscleMass?: number
  bmi?: number
  weight?: number
}

function extractInBodyData(lines: Word[][]): InBodyData {
  type Row = {
    centerY: number
    height: number
    words: Word[]
  }

  const allWords: Word[] = lines.flat().filter((w) => w && w.WordText);

  const normalizeToken = (text: string): string =>
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "")
      .trim();

  const matchesToken = (wordToken: string, patternToken: string): boolean => {
    if (!wordToken || !patternToken) return false;
    if (wordToken === patternToken) return true;
    if (wordToken.length >= 3 && patternToken.length >= 3) {
      return wordToken.startsWith(patternToken) || patternToken.startsWith(wordToken);
    }
    return false;
  };

  const extractNumber = (text: string): number | null => {
    const cleaned = text.replace(/\s+/g, "");
    const match = cleaned.match(/-?\d{1,3}(?:,\d{3})*(?:\.\d+)?|-?\d+(?:\.\d+)?/);
    if (!match) return null;
    const numeric = match[0].replace(/,/g, "");
    const n = Number(numeric);
    return Number.isFinite(n) ? n : null;
  };

  const wordCenterY = (w: Word) => w.Top + w.Height / 2;
  const wordRightX = (w: Word) => w.Left + w.Width;

  const clusterRows = (words: Word[]): Row[] => {
    const sorted = [...words].sort((a, b) => wordCenterY(a) - wordCenterY(b));
    const rows: Row[] = [];

    for (const w of sorted) {
      const cy = wordCenterY(w);
      const last = rows[rows.length - 1];

      if (!last) {
        rows.push({ centerY: cy, height: w.Height, words: [w] });
        continue;
      }

      const tolerance = Math.max(last.height, w.Height) * 0.7;
      if (Math.abs(cy - last.centerY) <= tolerance) {
        const count = last.words.length;
        last.centerY = (last.centerY * count + cy) / (count + 1);
        last.height = Math.max(last.height, w.Height);
        last.words.push(w);
      } else {
        rows.push({ centerY: cy, height: w.Height, words: [w] });
      }
    }

    for (const row of rows) {
      row.words.sort((a, b) => a.Left - b.Left);
    }

    return rows;
  };

  const labelPatterns: Array<{ key: keyof InBodyData; patterns: string[][] }> = [
    { key: "totalBodyWater", patterns: [["total", "body", "water"], ["body", "water"]] },
    { key: "protein", patterns: [["protein"]] },
    { key: "mineral", patterns: [["mineral"]] },
    { key: "bodyFatMass", patterns: [["body", "fat", "mass"], ["fat", "mass"]] },
    { key: "skeletalMuscleMass", patterns: [["skeletal", "muscle", "mass"], ["muscle", "mass"]] },
    { key: "bmi", patterns: [["bmi"]] },
    { key: "weight", patterns: [["weight"]] },
  ];

  // Prefer longer phrases first so we don't match "Body Water" inside "Total Body Water".
  for (const entry of labelPatterns) {
    entry.patterns.sort((a, b) => b.length - a.length);
  }

  const rows = clusterRows(allWords);
  const result: InBodyData = {};

  const findNearestValueToRight = (labelRight: number, labelCenterY: number, baseRow: Row): number | null => {
    const candidateRows = rows
      .map((r) => ({ r, yDelta: Math.abs(r.centerY - labelCenterY) }))
      .filter(({ yDelta }) => yDelta <= Math.max(baseRow.height, 10) * 1.2)
      .sort((a, b) => a.yDelta - b.yDelta)
      .slice(0, 3)
      .map(({ r }) => r);

    const isNumericFragment = (text: string): boolean => {
      const cleaned = text.replace(/\s+/g, "");
      return /^[0-9.,+-]+$/.test(cleaned);
    };

    const isJoinable = (a: Word, b: Word, rowHeight: number): boolean => {
      const gap = b.Left - wordRightX(a);
      const maxH = Math.max(a.Height, b.Height, rowHeight);
      const yOk = Math.abs(wordCenterY(a) - wordCenterY(b)) <= maxH * 0.6;
      // OCR sometimes inserts a small space inside numbers (e.g. "43." + "2").
      const gapOk = gap >= -1 && gap <= Math.max(8, maxH * 0.65);
      return yOk && gapOk;
    };

    let best: { value: number; score: number; span: number; textLen: number } | null = null;
    for (const row of candidateRows) {
      const yDelta = Math.abs(row.centerY - labelCenterY);

      for (let i = 0; i < row.words.length; i++) {
        const w0 = row.words[i];
        if (w0.Left <= labelRight) continue;
        if (!isNumericFragment(w0.WordText)) continue;

        let combined = w0.WordText;
        let last = w0;

        // Try 1..3 word spans for split decimals/thousands (e.g. "43." + "2", "1," + "234").
        for (let span = 1; span <= 3; span++) {
          if (span > 1) {
            const next = row.words[i + span - 1];
            if (!next) break;
            if (!isNumericFragment(next.WordText)) break;
            if (!isJoinable(last, next, row.height)) break;
            combined = `${combined}${next.WordText}`;
            last = next;
          }

          const value = extractNumber(combined);
          if (value === null) continue;

          const dx = w0.Left - labelRight;
          const score = dx + yDelta * 8;

          if (
            !best ||
            score < best.score ||
            (score === best.score && span > best.span) ||
            (score === best.score && span === best.span && combined.length > best.textLen)
          ) {
            best = { value, score, span, textLen: combined.length };
          }
        }
      }
    }

    return best?.value ?? null;
  };

  for (const row of rows) {
    const tokens = row.words.map((w) => normalizeToken(w.WordText));

    for (const { key, patterns } of labelPatterns) {
      if (result[key] !== undefined) continue;

      for (const pattern of patterns) {
        if (result[key] !== undefined) break;

        for (let i = 0; i <= tokens.length - pattern.length; i++) {
          let ok = true;
          for (let j = 0; j < pattern.length; j++) {
            if (!matchesToken(tokens[i + j], pattern[j])) {
              ok = false;
              break;
            }
          }
          if (!ok) continue;

          const matchedWords = row.words.slice(i, i + pattern.length);
          const labelRight = Math.max(...matchedWords.map(wordRightX));
          const labelCenterY = matchedWords.reduce((sum, w) => sum + wordCenterY(w), 0) / matchedWords.length;

          const value = findNearestValueToRight(labelRight, labelCenterY, row);
          if (value !== null) {
            result[key] = value;
            break;
          }
        }
      }
    }
  }

  return result;
}

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isPending, startTransition] = useTransition();
  const { setIsLoading } = useLoading();

  const submit = async () => {
    if (!file) return;

    startTransition(async () => {
      const formData = new FormData();
      formData.append("image", file);
      try {
        setIsLoading(true);
        const res = await fetch("/api/inbody/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (!res.ok || data.result.ParsedResults[0].FileParseExitCode != 1) throw new Error(data.result.ParsedResults[0].ErrorMessage || "Upload failed");
        const lines = data.result.ParsedResults[0].TextOverlay.Lines.map((l: { Words: Word[] }) => l.Words) as Word[][];
        console.log("OCR Lines:", lines);
        // Extract InBody data using spatial matching
        const inBodyData = extractInBodyData(lines);
        console.log("Extracted InBody Data:", inBodyData);
      }
      catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        console.error("Error parsing file:", message);
      }
      finally{
        setIsLoading(false);
        setFile(null);
      }
    });
  };

  return (
    <div className="relative flex flex-col h-full items-center justify-center gap-6">
      {isPending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="text-lg font-medium">Uploading...</p>
          </div>
        </div>
      )}
      <div className={isPending ? "blur-sm pointer-events-none" : ""}>
        <h1 className="text-xl font-bold mb-3 flex items-center justify-center">Upload InBody Report</h1>
        <div className="flex flex-col items-center gap-4">
          <Input
            // key={file?.name || 'empty'}
            type="file"
            accept="image/*"
            className="cursor-pointer"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            disabled={isPending}
          />
          <Button
            onClick={submit}
            disabled={!file || isPending}
            className="p-2 cursor-pointer"
          >
            {isPending ? "Uploading..." : "Upload"}
          </Button>
        </div>
      </div>
    </div>
  );
}