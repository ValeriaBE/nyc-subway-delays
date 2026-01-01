// src/lineMeta.ts
export type QueensLine = "R" | "7" | "M" | "F" | "E";

export const QUEENS_LINES: QueensLine[] = ["7", "E", "F", "M", "R"];

// Approx standard trunk colors (good enough visually; bullets will handle a lot)
export const LINE_COLORS: Record<QueensLine, string> = {
  "7": "#B933AD", // purple
  "E": "#FF6319", // orange
  "F": "#FF6319",
  "M": "#FF6319",
  "R": "#FCCC0A", // yellow
};

export const LINE_NAMES: Record<QueensLine, string> = {
  "7": "7",
  "E": "E",
  "F": "F",
  "M": "M",
  "R": "R",
};
