import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    weekday: "short",
    day: "numeric",
    year: "numeric",
  }

  // Format like "Wed 23, 2024"
  const formatted = date.toLocaleDateString("en-US", options)

  // Split the formatted date to rearrange it
  const parts = formatted.split(", ")
  const dayPart = parts[0].split(" ")

  return `${dayPart[0]} ${dayPart[1]}, ${parts[1]}`
}
