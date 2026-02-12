export type Word = {
  WordText: string;
  Left: number;
  Top: number;
  Width: number;
  Height: number;
};

export type Row = {
  centerY: number;
  height: number;
  words: Word[];
};

export type InBodyData = {
  totalBodyWater: number | null;
  protein: number | null;
  mineral: number | null;
  bodyFatMass: number | null;
  skeletalMuscleMass: number | null;
  bmi: number | null;
  weight: number | null;
  height: number | null;
  age: number | null;
  pbf: number | null;
  testDateTime: string | null;
};

export type ExtractionMode = "right" | "below" | "below-right";
export type ValueType = "number" | "text";

export type LabelPattern = {
  key: keyof InBodyData;
  patterns: string[][];
  mode: ExtractionMode;
  valueType: ValueType;
};

export type ValidRange = {
  min: number;
  max: number;
};

export type PageDimensions = {
  width: number;
  height: number;
};
