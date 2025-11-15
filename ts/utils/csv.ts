// src/utils/csv.ts
export function parseCsv(text: string): string[][] {
  const lines = text.split(/\r?\n/).filter(l => l.trim() !== "");
  return lines.map(l => l.split(",").map(c => c.trim()));
}
