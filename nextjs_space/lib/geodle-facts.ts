export type GeodleFact = {
  name: string;
  code: string;
  continent: string;
  population: number;
  landlocked: boolean;
  religion: string;
  temperature: number;
  government: string;
};

export const GEODLE_FACTS: Record<string, GeodleFact> = {
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

export function normalizeCountryName(value: unknown) {
  return String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

export function findGeodleFact(countryName: string) {
  const normalized = normalizeCountryName(countryName);
  return Object.values(GEODLE_FACTS).find((fact) => normalizeCountryName(fact.name) === normalized) ?? null;
}

