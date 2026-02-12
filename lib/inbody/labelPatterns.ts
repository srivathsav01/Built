import type { LabelPattern, ValidRange, InBodyData } from "./types";

export const LABEL_PATTERNS: LabelPattern[] = [
  { key: "totalBodyWater", patterns: [["total", "body", "water"], ["body", "water"]], mode: "right", valueType: "number" },
  { key: "protein", patterns: [["protein"]], mode: "right", valueType: "number" },
  { key: "mineral", patterns: [["mineral"]], mode: "right", valueType: "number" },
  { key: "bodyFatMass", patterns: [["body", "fat", "mass"], ["fat", "mass"]], mode: "right", valueType: "number" },
  { key: "skeletalMuscleMass", patterns: [["smm"]], mode: "right", valueType: "number" },
  { key: "bmi", patterns: [["bmi"]], mode: "below-right", valueType: "number" },
  { key: "weight", patterns: [["weight"]], mode: "right", valueType: "number" },
  { key: "pbf", patterns: [["pbf"]], mode: "below-right", valueType: "number" },
  { key: "height", patterns: [["height"]], mode: "below", valueType: "number" },
  { key: "age", patterns: [["age"]], mode: "below", valueType: "number" },
  { key: "testDateTime", patterns: [["test", "date", "time"], ["test", "date"], ["date", "time"]], mode: "below", valueType: "text" },
];

export const VALID_RANGES: Record<string, ValidRange> = {
  totalBodyWater: { min: 15, max: 80 },
  protein: { min: 3, max: 25 },
  mineral: { min: 1, max: 10 },
  bodyFatMass: { min: 1, max: 100 },
  skeletalMuscleMass: { min: 8, max: 70 },
  bmi: { min: 10, max: 60 },
  weight: { min: 25, max: 300 },
  height: { min: 100, max: 250 },
  age: { min: 5, max: 120 },
  pbf: { min: 2, max: 70 },
};

export function isValueInRange(key: string, value: number): boolean {
  const range = VALID_RANGES[key];
  if (!range) return true;
  return value >= range.min && value <= range.max;
}

export function createEmptyInBodyData(): InBodyData {
  return {
    totalBodyWater: null,
    protein: null,
    mineral: null,
    bodyFatMass: null,
    skeletalMuscleMass: null,
    bmi: null,
    weight: null,
    height: null,
    age: null,
    pbf: null,
    testDateTime: null,
  };
}

export function getSortedPatterns(): LabelPattern[] {
  return LABEL_PATTERNS.map((entry) => ({
    ...entry,
    patterns: [...entry.patterns].sort((a, b) => b.length - a.length),
  }));
}
