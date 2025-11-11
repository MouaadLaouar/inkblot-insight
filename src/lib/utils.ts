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

type LabelType = "G" | "D" | "Dd" | "Dbl";

export function getLineLevel(label: LabelType, percentage: number) {
  if (label === "G") {
    switch (true) {
      case percentage >= 0 && percentage <= 5:
        return 3;
      case percentage > 5 && percentage <= 10:
        return 2;
      case percentage > 10 && percentage <= 20:
        return 1;
      case percentage > 20 && percentage <= 30:
        return 0;
      case percentage > 31 && percentage <= 45:
        return -1;
      case percentage >= 46 && percentage <= 60:
        return -2;
      case percentage > 60:
        return -3;
      default:
        return 0;
    }
  }

  if (label === "D") {
    switch (true) {
      case percentage >= 0 && percentage <= 34:
        return 3;
      case percentage > 35 && percentage <= 50:
        return 2;
      case percentage > 51 && percentage <= 59:
        return 1;
      case percentage > 60 && percentage <= 68:
        return 0;
      case percentage > 69 && percentage <= 85:
        return -1;
      case percentage >= 86 && percentage <= 90:
        return -2;
      case percentage > 90:
        return -3;
      default:
        return 0;
    }
  }

  if (label === "Dd") {
    switch (true) {
      case percentage >= 6 && percentage <= 10:
        return 0;
      case percentage > 11 && percentage <= 15:
        return -1;
      case percentage > 16 && percentage <= 25:
        return -2;
      case percentage > 25:
        return -3;
      default:
        return 0;
    }
  }

  if (label === "Dbl") {
    switch (true) {
      case percentage >= 0 && percentage <= 3:
        return 0;
      case percentage > 4 && percentage <= 6:
        return -1;
      case percentage > 7 && percentage <= 12:
        return -2;
      case percentage > 12:
        return -3;
      default:
        return 0;
    }
  }
  
  return 0;
}