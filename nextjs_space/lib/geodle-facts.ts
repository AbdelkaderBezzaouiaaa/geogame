export type GeodleFact = {
  name: string;
  code: string;
  continent: string;
  population: number;
  landlocked: boolean;
  religion: string;
  temperature: number;
  government: string;
  area: number | null;
  gdpPerCapita: number | null;
};

import { COUNTRIES } from './countries';
import { COUNTRY_STATS } from './country-stats';
import { GDP_PER_CAPITA } from './gdp-per-capita';

const KNOWN_GEODLE_FACTS: Record<string, Omit<GeodleFact, 'area' | 'gdpPerCapita'>> = {
  Algeria: { name: 'Algeria', code: 'DZ', continent: 'Africa', population: 45600000, landlocked: false, religion: 'Muslim', temperature: 22, government: 'Republic' },
  Argentina: { name: 'Argentina', code: 'AR', continent: 'South America', population: 46000000, landlocked: false, religion: 'Christian', temperature: 15, government: 'Republic' },
  Australia: { name: 'Australia', code: 'AU', continent: 'Oceania', population: 27000000, landlocked: false, religion: 'Christian', temperature: 22, government: 'Parliamentary monarchy' },
  Brazil: { name: 'Brazil', code: 'BR', continent: 'South America', population: 213000000, landlocked: false, religion: 'Christian', temperature: 25, government: 'Republic' },
  Canada: { name: 'Canada', code: 'CA', continent: 'North America', population: 41000000, landlocked: false, religion: 'Christian', temperature: -5, government: 'Parliamentary monarchy' },
  China: { name: 'China', code: 'CN', continent: 'Asia', population: 1410000000, landlocked: false, religion: 'Mixed/None', temperature: 7, government: 'One-party republic' },
  Egypt: { name: 'Egypt', code: 'EG', continent: 'Africa', population: 114000000, landlocked: false, religion: 'Muslim', temperature: 23, government: 'Republic' },
  France: { name: 'France', code: 'FR', continent: 'Europe', population: 68000000, landlocked: false, religion: 'Christian', temperature: 12, government: 'Republic' },
  Germany: { name: 'Germany', code: 'DE', continent: 'Europe', population: 84000000, landlocked: false, religion: 'Christian', temperature: 9, government: 'Parliamentary republic' },
  India: { name: 'India', code: 'IN', continent: 'Asia', population: 1450000000, landlocked: false, religion: 'Hindu', temperature: 24, government: 'Parliamentary republic' },
  Indonesia: { name: 'Indonesia', code: 'ID', continent: 'Asia', population: 282000000, landlocked: false, religion: 'Muslim', temperature: 26, government: 'Republic' },
  Italy: { name: 'Italy', code: 'IT', continent: 'Europe', population: 59000000, landlocked: false, religion: 'Christian', temperature: 14, government: 'Parliamentary republic' },
  Japan: { name: 'Japan', code: 'JP', continent: 'Asia', population: 123000000, landlocked: false, religion: 'Shinto/Buddhist', temperature: 12, government: 'Parliamentary monarchy' },
  Kazakhstan: { name: 'Kazakhstan', code: 'KZ', continent: 'Asia', population: 20000000, landlocked: true, religion: 'Muslim', temperature: 6, government: 'Republic' },
  Mexico: { name: 'Mexico', code: 'MX', continent: 'North America', population: 131000000, landlocked: false, religion: 'Christian', temperature: 21, government: 'Republic' },
  Nigeria: { name: 'Nigeria', code: 'NG', continent: 'Africa', population: 229000000, landlocked: false, religion: 'Muslim/Christian', temperature: 27, government: 'Republic' },
  Pakistan: { name: 'Pakistan', code: 'PK', continent: 'Asia', population: 252000000, landlocked: false, religion: 'Muslim', temperature: 21, government: 'Parliamentary republic' },
  Russia: { name: 'Russia', code: 'RU', continent: 'Europe', population: 144000000, landlocked: false, religion: 'Christian', temperature: -5, government: 'Federal republic' },
  'Saudi Arabia': { name: 'Saudi Arabia', code: 'SA', continent: 'Asia', population: 34000000, landlocked: false, religion: 'Muslim', temperature: 25, government: 'Absolute monarchy' },
  'South Africa': { name: 'South Africa', code: 'ZA', continent: 'Africa', population: 64000000, landlocked: false, religion: 'Christian', temperature: 17, government: 'Republic' },
  Spain: { name: 'Spain', code: 'ES', continent: 'Europe', population: 49000000, landlocked: false, religion: 'Christian', temperature: 14, government: 'Parliamentary monarchy' },
  Sudan: { name: 'Sudan', code: 'SD', continent: 'Africa', population: 50000000, landlocked: false, religion: 'Muslim', temperature: 27, government: 'Republic' },
  Tanzania: { name: 'Tanzania', code: 'TZ', continent: 'Africa', population: 69000000, landlocked: false, religion: 'Christian/Muslim', temperature: 23, government: 'Republic' },
  Thailand: { name: 'Thailand', code: 'TH', continent: 'Asia', population: 72000000, landlocked: false, religion: 'Buddhist', temperature: 27, government: 'Constitutional monarchy' },
  Turkey: { name: 'Turkey', code: 'TR', continent: 'Asia', population: 87000000, landlocked: false, religion: 'Muslim', temperature: 12, government: 'Republic' },
  Ukraine: { name: 'Ukraine', code: 'UA', continent: 'Europe', population: 38000000, landlocked: false, religion: 'Christian', temperature: 9, government: 'Republic' },
  'United Kingdom': { name: 'United Kingdom', code: 'GB', continent: 'Europe', population: 69000000, landlocked: false, religion: 'Christian', temperature: 10, government: 'Parliamentary monarchy' },
  'United States': { name: 'United States', code: 'US', continent: 'North America', population: 347000000, landlocked: false, religion: 'Christian', temperature: 9, government: 'Federal republic' },
  Vietnam: { name: 'Vietnam', code: 'VN', continent: 'Asia', population: 101000000, landlocked: false, religion: 'Folk/Buddhist', temperature: 24, government: 'One-party republic' },
};

const LANDLOCKED = new Set([
  'Afghanistan', 'Andorra', 'Armenia', 'Austria', 'Azerbaijan', 'Belarus', 'Bhutan', 'Bolivia', 'Botswana',
  'Burkina Faso', 'Burundi', 'Central African Republic', 'Chad', 'Czech Republic', 'Eswatini', 'Ethiopia',
  'Hungary', 'Kazakhstan', 'Kyrgyzstan', 'Laos', 'Lesotho', 'Liechtenstein', 'Luxembourg', 'Malawi', 'Mali',
  'Moldova', 'Mongolia', 'Nepal', 'Niger', 'North Macedonia', 'Paraguay', 'Rwanda', 'San Marino', 'Serbia',
  'Slovakia', 'South Sudan', 'Switzerland', 'Tajikistan', 'Turkmenistan', 'Uganda', 'Uzbekistan', 'Vatican City',
  'Zambia', 'Zimbabwe',
]);

const RELIGION_BY_CONTINENT: Record<string, string> = {
  Africa: 'Mixed',
  Asia: 'Mixed',
  Europe: 'Christian',
  'North America': 'Christian',
  'South America': 'Christian',
  Oceania: 'Christian',
};

const TEMP_BY_CONTINENT: Record<string, number> = {
  Africa: 24,
  Asia: 18,
  Europe: 9,
  'North America': 12,
  'South America': 21,
  Oceania: 23,
};

const GOVERNMENT_BY_CONTINENT: Record<string, string> = {
  Africa: 'Republic',
  Asia: 'Republic',
  Europe: 'Parliamentary republic',
  'North America': 'Republic',
  'South America': 'Republic',
  Oceania: 'Parliamentary republic',
};

const POPULATION_FALLBACK: Record<string, number> = {
  Azerbaijan: 10200000, Albania: 2800000, Armenia: 3000000, Austria: 9100000, Belgium: 11800000, Chile: 20000000,
  Colombia: 52000000, Croatia: 3900000, Cuba: 11000000, Denmark: 6000000, Finland: 5600000, Greece: 10400000,
  Iran: 90000000, Iraq: 45000000, Ireland: 5300000, Israel: 9800000, Malaysia: 34000000, Netherlands: 18000000,
  'New Zealand': 5300000, Norway: 5600000, Peru: 34000000, Poland: 38000000, Portugal: 10400000, Qatar: 3000000,
  Romania: 19000000, Serbia: 6600000, Sweden: 10600000, Switzerland: 9000000, 'United Arab Emirates': 10000000,
  Uruguay: 3500000,
};

export const GEODLE_FACTS: Record<string, GeodleFact> = Object.fromEntries(
  COUNTRIES.map((country) => {
    const known = KNOWN_GEODLE_FACTS[country.name];
    if (known) return [country.name, { ...known, area: COUNTRY_STATS[country.name]?.area ?? null, gdpPerCapita: GDP_PER_CAPITA[country.name] ?? null }];
    return [country.name, {
      name: country.name,
      code: country.code,
      continent: country.continent,
      population: POPULATION_FALLBACK[country.name] ?? 10000000,
      landlocked: LANDLOCKED.has(country.name),
      religion: RELIGION_BY_CONTINENT[country.continent] ?? 'Mixed',
      temperature: TEMP_BY_CONTINENT[country.continent] ?? 18,
      government: GOVERNMENT_BY_CONTINENT[country.continent] ?? 'Republic',
      area: COUNTRY_STATS[country.name]?.area ?? null,
      gdpPerCapita: GDP_PER_CAPITA[country.name] ?? null,
    }];
  })
);

export function normalizeCountryName(value: unknown) {
  return String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

function distance(a: string, b: string) {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
  }
  return dp[a.length][b.length];
}

export function findGeodleFact(countryName: string) {
  const normalized = normalizeCountryName(countryName);
  const aliases: Record<string, string> = {
    usa: 'United States',
    us: 'United States',
    america: 'United States',
    uk: 'United Kingdom',
    britain: 'United Kingdom',
    uae: 'United Arab Emirates',
    korea: 'South Korea',
    czechia: 'Czech Republic',
  };
  if (aliases[normalized]) return GEODLE_FACTS[aliases[normalized]] ?? null;
  const exact = Object.values(GEODLE_FACTS).find((fact) => normalizeCountryName(fact.name) === normalized);
  if (exact) return exact;

  const close = Object.values(GEODLE_FACTS)
    .map((fact) => ({ fact, distance: distance(normalized, normalizeCountryName(fact.name)) }))
    .sort((a, b) => a.distance - b.distance)[0];
  if (close && close.distance <= Math.max(2, Math.floor(normalized.length * 0.18))) return close.fact;

  return null;
}
