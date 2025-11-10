import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatSToMS(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}'${seconds}"`;
}

// TODO: refine the line level logic as needed
export function getLineLevel(percentage) {
  if (percentage >= 10 && percentage < 20) return 1;
  if (percentage >= 20 && percentage < 30) return 2;
  if (percentage >= 30 && percentage < 40) return 3;
  if (percentage >= 50 && percentage < 60) return 3;
  if (percentage >= 60 && percentage < 70) return -2;
  if (percentage >= 70 && percentage < 80) return -3;
  return -3; // default: no line
}