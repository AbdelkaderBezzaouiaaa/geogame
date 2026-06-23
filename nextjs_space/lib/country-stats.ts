// Server-only country statistics lookup for competitive modes.
// Values are fetched once when a room is created, then stored in its questions.
export type CountryStats = { population: number; area: number };

export async function getCountryStats(countryName: string): Promise<CountryStats | null> {
  const token = process.env.REST_COUNTRIES_API_TOKEN;
  try {
    const response = token
      ? await fetch(`https://api.restcountries.com/countries/v5?q=${encodeURIComponent(countryName)}`, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' })
      : await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(countryName)}?fullText=true&fields=population,area`, { cache: 'no-store' });
    if (!response.ok) throw new Error('Primary statistics lookup failed');
    const data = await response.json();
    const country = Array.isArray(data) ? data[0] : data;
    const population = Number(country?.population);
    const area = Number(country?.area);
    if (Number.isFinite(population) && Number.isFinite(area)) return { population, area };
  } catch {}

  try {
    const response = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(countryName)}?fullText=true&fields=population,area`, { cache: 'no-store' });
    if (!response.ok) return null;
    const country = (await response.json())?.[0];
    const population = Number(country?.population);
    const area = Number(country?.area);
    return Number.isFinite(population) && Number.isFinite(area) ? { population, area } : null;
  } catch { return null; }
}

export async function getCountryStatsBatch(countryNames: string[]) {
  const results = await Promise.all(countryNames.map(async (name) => ({ name, stats: await getCountryStats(name) })));
  return results.filter((item): item is { name: string; stats: CountryStats } => item.stats !== null);
}
