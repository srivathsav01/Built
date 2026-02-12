import type { Word, Row, PageDimensions } from "./types";

export function wordCenterY(word: Word): number {
  return word.Top + word.Height / 2;
}

export function wordRightX(word: Word): number {
  return word.Left + word.Width;
}

export function wordBottomY(word: Word): number {
  return word.Top + word.Height;
}

export function calculatePageDimensions(words: Word[]): PageDimensions {
  return {
    height: Math.max(...words.map((w) => w.Top + w.Height)),
    width: Math.max(...words.map((w) => w.Left + w.Width)),
  };
}

export function clusterWordsIntoRows(words: Word[]): Row[] {
  const sorted = [...words].sort((a, b) => wordCenterY(a) - wordCenterY(b));
  const rows: Row[] = [];

  for (const word of sorted) {
    const centerY = wordCenterY(word);
    const lastRow = rows[rows.length - 1];

    if (!lastRow) {
      rows.push({ centerY, height: word.Height, words: [word] });
      continue;
    }

    const tolerance = Math.max(lastRow.height, word.Height) * 0.7;
    if (Math.abs(centerY - lastRow.centerY) <= tolerance) {
      const count = lastRow.words.length;
      lastRow.centerY = (lastRow.centerY * count + centerY) / (count + 1);
      lastRow.height = Math.max(lastRow.height, word.Height);
      lastRow.words.push(word);
    } else {
      rows.push({ centerY, height: word.Height, words: [word] });
    }
  }

  for (const row of rows) {
    row.words.sort((a, b) => a.Left - b.Left);
  }

  return rows;
}

export function flattenLines(lines: Word[][]): Word[] {
  return lines.flat().filter((w) => w && w.WordText);
}
