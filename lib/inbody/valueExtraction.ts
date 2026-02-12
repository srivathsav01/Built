import type { Word, Row } from "./types";
import { wordCenterY, wordRightX } from "./wordClustering";
import { isValueInRange } from "./labelPatterns";

export function extractNumber(text: string): number | null {
  const cleaned = text.replace(/\s+/g, "");
  const match = cleaned.match(/-?\d{1,3}(?:,\d{3})*(?:\.\d+)?|-?\d+(?:\.\d+)?/);
  if (!match) return null;
  const numeric = match[0].replace(/,/g, "");
  const n = Number(numeric);
  return Number.isFinite(n) ? n : null;
}

export function normalizeToken(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "").trim();
}

export function matchesToken(wordToken: string, patternToken: string): boolean {
  if (!wordToken || !patternToken) return false;
  if (wordToken === patternToken) return true;
  if (wordToken.length >= 3 && patternToken.length >= 3) {
    return wordToken.startsWith(patternToken) || patternToken.startsWith(wordToken);
  }
  return false;
}

function isNumericFragment(text: string): boolean {
  const cleaned = text.replace(/\s+/g, "");
  if (!/^[-+]?\d/.test(cleaned)) return false;
  return /^[0-9.,+-]+[a-z%°]*$/i.test(cleaned);
}

function isJoinable(a: Word, b: Word, rowHeight: number, maxGapMultiplier: number): boolean {
  const gap = b.Left - wordRightX(a);
  const maxH = Math.max(a.Height, b.Height, rowHeight);
  const yOk = Math.abs(wordCenterY(a) - wordCenterY(b)) <= maxH * 0.6;
  const gapOk = gap >= -1 && gap <= Math.max(8, maxH * maxGapMultiplier);
  return yOk && gapOk;
}

export function findValueToRight(
  labelRight: number,
  labelCenterY: number,
  baseRow: Row,
  rows: Row[],
  key: string
): number | null {
  const candidateRows = rows
    .map((r) => ({ r, yDelta: Math.abs(r.centerY - labelCenterY) }))
    .filter(({ yDelta }) => yDelta <= Math.max(baseRow.height, 10) * 1.2)
    .sort((a, b) => a.yDelta - b.yDelta)
    .slice(0, 3)
    .map(({ r }) => r);

  let best: { value: number; score: number; span: number; textLen: number } | null = null;
  
  for (const row of candidateRows) {
    const yDelta = Math.abs(row.centerY - labelCenterY);

    for (let i = 0; i < row.words.length; i++) {
      const firstWord = row.words[i];
      if (firstWord.Left <= labelRight) continue;
      if (!isNumericFragment(firstWord.WordText)) continue;

      let combined = firstWord.WordText;
      let last = firstWord;

      for (let span = 1; span <= 3; span++) {
        if (span > 1) {
          const next = row.words[i + span - 1];
          if (!next) break;
          if (!isNumericFragment(next.WordText)) break;
          if (!isJoinable(last, next, row.height, 0.65)) break;
          combined = `${combined}${next.WordText}`;
          last = next;
        }

        const value = extractNumber(combined);
        if (value === null) continue;
        if (!isValueInRange(key, value)) continue;

        const dx = firstWord.Left - labelRight;
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
}

export function findValueBelow(
  labelLeft: number,
  labelRight: number,
  labelBottom: number,
  labelCenterX: number,
  baseRow: Row,
  rows: Row[],
  key: string
): number | null {
  const maxRowDelta = Math.max(baseRow.height, 10) * 4;
  const candidateRows = rows
    .filter((r) => r.centerY > labelBottom)
    .map((r) => ({ r, yDelta: r.centerY - labelBottom }))
    .filter(({ yDelta }) => yDelta >= 0 && yDelta <= maxRowDelta)
    .sort((a, b) => a.yDelta - b.yDelta)
    .slice(0, 4)
    .map(({ r }) => r);

  const overlapsHorizontally = (word: Word, left: number, right: number, pad: number): boolean => {
    const wLeft = word.Left;
    const wRight = wordRightX(word);
    return wRight >= left - pad && wLeft <= right + pad;
  };

  let best: { value: number; score: number } | null = null;
  
  for (const row of candidateRows) {
    const yDelta = Math.max(0, row.centerY - labelBottom);
    const pad = Math.max(10, row.height * 1.2);

    for (const word of row.words) {
      if (!overlapsHorizontally(word, labelLeft, labelRight, pad)) continue;
      if (!isNumericFragment(word.WordText)) continue;

      const value = extractNumber(word.WordText);
      if (value === null) continue;
      if (!isValueInRange(key, value)) continue;

      const wCenterX = word.Left + word.Width / 2;
      const xDelta = Math.abs(wCenterX - labelCenterX);
      const score = yDelta * 12 + xDelta;

      if (!best || score < best.score) {
        best = { value, score };
      }
    }
  }

  return best?.value ?? null;
}

export function findValueBelowRight(
  labelRight: number,
  labelBottom: number,
  labelCenterY: number,
  baseRow: Row,
  rows: Row[],
  key: string
): number | null {
  const maxRowDelta = Math.max(baseRow.height, 10) * 3;
  const candidateRows = rows
    .filter((r) => r.centerY >= labelCenterY - baseRow.height * 0.5)
    .map((r) => ({ r, yDelta: Math.abs(r.centerY - labelCenterY) }))
    .filter(({ yDelta }) => yDelta <= maxRowDelta)
    .sort((a, b) => a.yDelta - b.yDelta)
    .slice(0, 5)
    .map(({ r }) => r);

  let best: { value: number; score: number; span: number } | null = null;
  
  for (const row of candidateRows) {
    const yDelta = Math.abs(row.centerY - labelCenterY);

    for (let i = 0; i < row.words.length; i++) {
      const firstWord = row.words[i];
      if (firstWord.Left <= labelRight) continue;
      if (!isNumericFragment(firstWord.WordText)) continue;

      let combined = firstWord.WordText;
      let last = firstWord;

      for (let span = 1; span <= 3; span++) {
        if (span > 1) {
          const next = row.words[i + span - 1];
          if (!next) break;
          if (!isNumericFragment(next.WordText)) break;
          if (!isJoinable(last, next, row.height, 0.8)) break;
          combined = `${combined}${next.WordText}`;
          last = next;
        }

        const value = extractNumber(combined);
        if (value === null) continue;
        if (!isValueInRange(key, value)) continue;

        const dx = firstWord.Left - labelRight;
        const score = yDelta * 5 + dx;

        if (!best || score < best.score || (score === best.score && span > best.span)) {
          best = { value, score, span };
        }
      }
    }
  }

  return best?.value ?? null;
}

export function findTextBelow(
  labelLeft: number,
  labelRight: number,
  labelBottom: number,
  labelCenterX: number,
  baseRow: Row,
  rows: Row[]
): string | null {
  const maxRowDelta = Math.max(baseRow.height, 10) * 5;
  const candidateRows = rows
    .filter((r) => r.centerY > labelBottom)
    .map((r) => ({ r, yDelta: r.centerY - labelBottom }))
    .filter(({ yDelta }) => yDelta >= 0 && yDelta <= maxRowDelta)
    .sort((a, b) => a.yDelta - b.yDelta)
    .slice(0, 4)
    .map(({ r }) => r);

  const rowText = (r: Row): string =>
    r.words.map((w) => w.WordText).join(" ").replace(/\s+/g, " ").trim();
    
  const rowCenterX = (r: Row): number => {
    const left = Math.min(...r.words.map((w) => w.Left));
    const right = Math.max(...r.words.map(wordRightX));
    return (left + right) / 2;
  };

  const parseTestDateTime = (text: string): string | null => {
    const cleaned = text.replace(/\s+/g, " ").trim();
    const patterns: RegExp[] = [
      /(\b\d{1,2}\.\s*\d{1,2}\.\s*\d{2,4}\s+\d{1,2}:\d{2}(?::\d{2})?\b)/i,
      /(\b\d{1,2}\/\d{1,2}\/\d{2,4}\b(?:\s+\d{1,2}:\d{2}(?::\d{2})?(?:\s*[AP]M)?)?)/i,
      /(\b\d{4}-\d{1,2}-\d{1,2}\b(?:\s+\d{1,2}:\d{2}(?::\d{2})?)?)/i,
    ];
    for (const re of patterns) {
      const m = cleaned.match(re);
      if (m?.[1]) {
        return m[1].trim().replace(/\.\s+/g, ".");
      }
    }
    return null;
  };

  let best: { text: string; score: number } | null = null;
  
  for (const row of candidateRows) {
    const text = rowText(row);
    if (!text) continue;

    const yDelta = Math.max(0, row.centerY - labelBottom);
    const xDelta = Math.abs(rowCenterX(row) - labelCenterX);
    const score = yDelta * 10 + xDelta;

    const parsed = parseTestDateTime(text);
    if (!parsed) continue;

    if (!best || score < best.score) {
      best = { text: parsed, score };
    }
  }

  return best?.text ?? null;
}
