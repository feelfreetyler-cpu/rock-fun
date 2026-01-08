import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines tailwind classes using clsx and tailwind-merge to prevent
 * class duplication. Use this helper when adding conditional classes.
 */
export function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}
