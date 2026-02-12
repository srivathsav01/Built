import type { Word, Row, InBodyData, PageDimensions } from "./types";
import { flattenLines, clusterWordsIntoRows, calculatePageDimensions, wordRightX, wordBottomY, wordCenterY } from "./wordClustering";
import { getSortedPatterns, createEmptyInBodyData } from "./labelPatterns";
import { normalizeToken, matchesToken, findValueToRight, findValueBelow, findValueBelowRight, findTextBelow } from "./valueExtraction";

type PositionFilter = (word: Word) => boolean;

function createPositionFilters(dimensions: PageDimensions): Record<string, PositionFilter> {
  return {
    bmi: (w: Word) => w.Left < dimensions.width * 0.5,
    pbf: (w: Word) => w.Top < dimensions.height * 0.55,
  };
}

function extractValueForLabel(
  matchedWords: Word[],
  baseRow: Row,
  rows: Row[],
  key: string,
  mode: "right" | "below" | "below-right",
  valueType: "number" | "text"
): number | string | null {
  const labelRight = Math.max(...matchedWords.map(wordRightX));
  const labelLeft = Math.min(...matchedWords.map((w) => w.Left));
  const labelBottom = Math.max(...matchedWords.map(wordBottomY));
  const labelCenterY = matchedWords.reduce((sum, w) => sum + wordCenterY(w), 0) / matchedWords.length;
  const labelCenterX = (labelLeft + labelRight) / 2;

  if (mode === "below") {
    if (valueType === "number") {
      return findValueBelow(labelLeft, labelRight, labelBottom, labelCenterX, baseRow, rows, key);
    }
    return findTextBelow(labelLeft, labelRight, labelBottom, labelCenterX, baseRow, rows);
  }
  
  if (mode === "below-right") {
    return findValueBelowRight(labelRight, labelBottom, labelCenterY, baseRow, rows, key);
  }
  
  return findValueToRight(labelRight, labelCenterY, baseRow, rows, key);
}

function findPatternMatch(
  tokens: string[],
  pattern: string[],
  startIndex: number
): boolean {
  for (let j = 0; j < pattern.length; j++) {
    if (!matchesToken(tokens[startIndex + j], pattern[j])) {
      return false;
    }
  }
  return true;
}

export function extractInBodyData(lines: Word[][]): InBodyData {
  const allWords = flattenLines(lines);
  const dimensions = calculatePageDimensions(allWords);
  const rows = clusterWordsIntoRows(allWords);
  const result = createEmptyInBodyData();
  const labelPatterns = getSortedPatterns();
  const positionFilters = createPositionFilters(dimensions);

  for (const row of rows) {
    const tokens = row.words.map((w) => normalizeToken(w.WordText));

    for (const { key, patterns, mode, valueType } of labelPatterns) {
      if (result[key] !== null) continue;

      for (const pattern of patterns) {
        if (result[key] !== null) break;

        for (let i = 0; i <= tokens.length - pattern.length; i++) {
          if (!findPatternMatch(tokens, pattern, i)) continue;

          const matchedWords = row.words.slice(i, i + pattern.length);
          
          const positionFilter = positionFilters[key];
          if (positionFilter && !matchedWords.every(positionFilter)) {
            continue;
          }

          const value = extractValueForLabel(matchedWords, row, rows, key, mode, valueType);
          
          if (value !== null) {
            (result as Record<string, unknown>)[key] = value;
            break;
          }
        }
      }
    }
  }

  return result;
}
