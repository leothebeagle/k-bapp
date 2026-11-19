// Numeric columns are cast to float8 in SQL so both drivers (pg and PGlite)
// return JS numbers; pg returns `numeric` as a string. IDs are bigint, which
// pg also returns as a string, so they go through Number() in the data functions.
// Timestamps come back as Date objects and are converted to ISO strings there.

/** A bigint column as returned by either driver. */
export type BigintValue = number | string

export function toIso(value: Date | string): string {
  return new Date(value).toISOString()
}

/** "YYYY-MM-DD" in UTC, matching the UTC formatting used in app/restock/format.ts. */
export function toDate(value: Date | string): string {
  return toIso(value).slice(0, 10)
}
