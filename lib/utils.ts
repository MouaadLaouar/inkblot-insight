import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatSToMS(seconds: number | null | undefined): string {
  if (seconds === null || seconds === undefined) return "-";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}'${remainingSeconds.toString().padStart(2, "0")}"`;
}

export function getLineLevel(
  percentage: number,
  label: string
): "below" | "normal" | "above" {
  const ranges: Record<string, { min: number; max: number }> = {
    G: { min: 20, max: 30 },
    D: { min: 60, max: 68 },
    Dd: { min: 6, max: 10 },
    Dbl: { min: 0, max: 4 },
    "F+": { min: 80, max: 85 },
    A: { min: 35, max: 50 },
    H: { min: 15, max: 20 },
  };

  const range = ranges[label];
  if (!range) return "normal";

  if (percentage < range.min) return "below";
  if (percentage > range.max) return "above";
  return "normal";
}
