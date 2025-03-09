import { clsx, ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to combine Tailwind CSS classes
 *
 * This function merges class names using clsx and tailwind-merge, which helps
 * prevent class conflicts when using Tailwind utilities.
 *
 * @param inputs - Class values to be merged
 * @returns Merged class string
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
