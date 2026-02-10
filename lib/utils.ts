import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Formatea una fecha ISO (solo día) sin desfase por zona horaria. */
export function formatDateOnly(
  isoDate: string | null,
  options?: Intl.DateTimeFormatOptions
): string {
  if (!isoDate) return ""
  const datePart = isoDate.slice(0, 10)
  return new Date(datePart + "T12:00:00").toLocaleDateString("es-UY", options)
}
