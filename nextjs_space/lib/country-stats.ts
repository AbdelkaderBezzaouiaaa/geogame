// Server-only country statistics lookup for competitive modes.
// Values are fetched once when a room is created, then stored in its questions.
export type CountryStats = { population: number; area: number };

// Stable gameplay snapshot: prevents a live API outage from breaking a match.
export const COUNTRY_STATS: Record<string, CountryStats> = {
  Algeria: { population: 45600000, area: 2381741 }, Argentina: { population: 46000000, area: 2780400 }, Australia: { population: 27000000, area: 7692024 },
  Brazil: { population: 213000000, area: 8515767 }, Canada: { population: 41000000, area: 9984670 }, China: { population: 1410000000, area: 9596961 },
  Egypt: { population: 114000000, area: 1002450 }, France: { population: 68000000, area: 551695 }, Germany: { population: 84000000, area: 357022 },
  India: { population: 1450000000, area: 3287263 }, Indonesia: { population: 282000000, area: 1904569 }, Italy: { population: 59000000, area: 301340 },
  Japan: { population: 123000000, area: 377975 }, Kazakhstan: { population: 20000000, area: 2724900 }, Mexico: { population: 131000000, area: 1964375 },
  Nigeria: { population: 229000000, area: 923768 }, Pakistan: { population: 252000000, area: 881913 }, Russia: { population: 144000000, area: 17098242 },
  Saudi Arabia: { population: 34000000, area: 2149690 }, South Africa: { population: 64000000, area: 1221037 }, Spain: { population: 49000000, area: 505990 },
  Sudan: { population: 50000000, area: 1886068 }, Tanzania: { population: 69000000, area: 945087 }, Thailand: { population: 72000000, area: 513120 },
  Turkey: { population: 87000000, area: 783562 }, Ukraine: { population: 38000000, area: 603628 }, 'United Kingdom': { population: 69000000, area: 243610 },
  'United States': { population: 347000000, area: 9833517 }, Vietnam: { population: 101000000, area: 331212 },
};

export async function getCountryStats(countryName: string): Promise<CountryStats | null> {
  if (COUNTRY_STATS[countryName]) return COUNTRY_STATS[countryName];
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
