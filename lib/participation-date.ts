const URUGUAY_TZ = "America/Montevideo";

/**
 * Fecha de hoy (solo día) en Uruguay, en formato YYYY-MM-DD.
 */
export function getTodayInUruguay(): string {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: URUGUAY_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(now); // "YYYY-MM-DD"
}

/**
 * Compara si raffle_date (YYYY-MM-DD o ISO string) es el mismo día que hoy en Uruguay.
 */
export function isParticipationAllowed(raffleDate: string | null): boolean {
  if (!raffleDate) return false;
  const day = raffleDate.slice(0, 10); // "YYYY-MM-DD"
  const today = getTodayInUruguay();
  return day === today;
}
