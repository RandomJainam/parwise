import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = "₹"): string {
  return `${currency}${amount.toLocaleString("en-IN")}`;
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export function getAvailabilityColor(available: number, total: number): string {
  const ratio = available / total;
  if (ratio > 0.5) return "#22c55e";   // green
  if (ratio > 0.2) return "#f59e0b";   // yellow
  return "#ef4444";                     // red
}

export function getAvailabilityLabel(available: number, total: number): string {
  const ratio = available / total;
  if (ratio > 0.5) return "Available";
  if (ratio > 0.2) return "Filling Up";
  return "Almost Full";
}

export function generateSlotId(row: string, col: number): string {
  return `${row}${col}`;
}

export function estimateCost(hours: number, hourlyRate: number): number {
  return Math.ceil(hours) * hourlyRate;
}
