import { clsx, type ClassValue } from "clsx";
import {
  formatDuration as dfFormatDuration,
  format,
  formatDistanceToNow,
  intervalToDuration,
} from "date-fns";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDuration(seconds: number): string {
  const duration = intervalToDuration({
    start: 0,
    end: seconds * 1000,
  });

  return dfFormatDuration(duration, {
    format: ["minutes", "seconds"],
  });
}

export function formatDate(date: string): string {
  return format(new Date(date), "MMM d, yyyy HH:mm");
}

export function formatTimeAgo(date: string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}
