import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Plot-safe [lo, hi]: sorts swapped bounds and widens an empty span, so min > max or min = max never blanks a chart.
export function ordered([a, b]: number[]): [number, number] {
  const lo = Math.min(a, b)
  const hi = Math.max(a, b)
  return [lo, hi === lo ? lo + 1 : hi]
}

// Grid point count: integer in [5, 200], so a half-typed or absurd value never breaks or freezes a render.
export function clampSteps(n: number) {
  return Math.min(200, Math.max(5, Math.round(n) || 5))
}
