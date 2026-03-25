/** Convert city name + state to a URL slug: "Austin, TX" → "austin-tx" */
export function toCitySlug(cityName: string, state?: string): string {
  const parts = state ? `${cityName} ${state}` : cityName;
  return parts
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}
