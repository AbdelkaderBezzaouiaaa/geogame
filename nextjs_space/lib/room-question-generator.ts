import { filterCountriesByDifficulty, generateCapitalQuestions, generateFlagQuestions, generateMapQuestions, shuffleArray, COUNTRIES } from '@/lib/countries';
import { COUNTRY_STATS, getCountryStatsBatch } from '@/lib/country-stats';
import { GDP_PER_CAPITA } from '@/lib/gdp-per-capita';
import { GEODLE_FACTS } from '@/lib/geodle-facts';
import { TOTAL_QUESTIONS } from '@/lib/room-utils';

export const GAME_MODES = ['CAPITALS', 'FLAGS', 'POPULATION', 'AREA_SORT', 'GDP_SORT', 'GEODLE', 'MIX', 'MAP_GUESS'] as const;
export const CONTINENTS = ['All', 'Africa', 'Asia', 'Europe', 'North America', 'South America', 'Oceania'] as const;
export const DIFFICULTIES = ['All', 'Easy', 'Medium', 'Hard'] as const;

export type LobbySettingsInput = {
  mode: string;
  roundCount?: number;
  continent?: string;
  difficulty?: string;
  answerTime?: number;
};

export function normalizeLobbySettings(input: LobbySettingsInput) {
  const mode = GAME_MODES.includes(input.mode as any) ? input.mode : 'CAPITALS';
  const rawRoundCount = Number(input.roundCount ?? TOTAL_QUESTIONS);
  const rawAnswerTime = Number(input.answerTime ?? 15);
  const roundCount = Math.min(20, Math.max(1, Number.isFinite(rawRoundCount) ? Math.floor(rawRoundCount) : TOTAL_QUESTIONS));
  const effectiveRoundCount = mode === 'MIX' ? Math.max(7, roundCount) : roundCount;
  const answerTime = Math.min(60, Math.max(5, Number.isFinite(rawAnswerTime) ? Math.floor(rawAnswerTime) : 15));
  const continent = typeof input.continent === 'string' ? input.continent.trim() : 'All';
  const difficulty = typeof input.difficulty === 'string' ? input.difficulty.trim() : 'All';
  const selectedContinent = CONTINENTS.includes(continent as any) ? continent : 'All';
  const selectedDifficulty = DIFFICULTIES.includes(difficulty as any) ? difficulty : 'All';

  return { mode, roundCount, effectiveRoundCount, answerTime, selectedContinent, selectedDifficulty };
}

export async function generateRoomQuestions(input: LobbySettingsInput) {
  const settings = normalizeLobbySettings(input);
  const { mode, effectiveRoundCount, selectedContinent, selectedDifficulty } = settings;

  const continentPool = selectedContinent === 'All'
    ? COUNTRIES
    : COUNTRIES.filter((country) => country.continent === selectedContinent);
  const countryPool = filterCountriesByDifficulty(continentPool, selectedDifficulty);

  if (countryPool.length < 4) {
    throw new Error('Not enough countries for this continent and difficulty. Try All difficulty or All continents.');
  }

  if (mode === 'CAPITALS') return { settings, questions: generateCapitalQuestions(effectiveRoundCount, countryPool) };
  if (mode === 'FLAGS') return { settings, questions: generateFlagQuestions(effectiveRoundCount, countryPool) };
  if (mode === 'MAP_GUESS') return { settings, questions: generateMapQuestions(effectiveRoundCount, countryPool) };

  if (mode === 'POPULATION' || mode === 'AREA_SORT') {
    const neededCountries = mode === 'POPULATION' ? effectiveRoundCount : effectiveRoundCount * 10;
    const selected = shuffleArray(countryPool.filter((country) => COUNTRY_STATS[country.name])).slice(0, neededCountries);
    const stats = await getCountryStatsBatch(selected.map((country) => country.name));
    if (stats.length < neededCountries) throw new Error('Country statistics are temporarily unavailable for this continent. Try All continents or choose fewer rounds.');

    const questions = mode === 'POPULATION'
      ? stats.slice(0, effectiveRoundCount).map(({ name, stats }) => ({ type: 'population', questionText: `Guess the population of ${name}`, correctAnswer: String(stats.population), options: [], population: stats.population, countryCode: COUNTRIES.find((country) => country.name === name)?.code }))
      : Array.from({ length: effectiveRoundCount }, (_, roundIndex) => {
          const roundStats = stats.slice(roundIndex * 10, roundIndex * 10 + 10);
          return { type: 'area_sort', questionText: 'Sort these countries from largest to smallest area', correctAnswer: '', options: roundStats.map(({ name, stats }) => ({ name, area: stats.area })) };
        });

    return { settings, questions };
  }

  if (mode === 'GDP_SORT') {
    const neededCountries = effectiveRoundCount * 10;
    const selected = shuffleArray(countryPool.filter((country) => GDP_PER_CAPITA[country.name])).slice(0, neededCountries);
    if (selected.length < neededCountries) throw new Error('GDP per capita data is temporarily unavailable for this continent. Try All continents or choose fewer rounds.');
    return {
      settings,
      questions: Array.from({ length: effectiveRoundCount }, (_, roundIndex) => {
        const roundCountries = selected.slice(roundIndex * 10, roundIndex * 10 + 10);
        return {
          type: 'gdp_sort',
          questionText: 'Sort these countries from highest to lowest GDP per capita',
          correctAnswer: '',
          options: roundCountries.map((country) => ({ name: country.name, gdpPerCapita: GDP_PER_CAPITA[country.name] })),
        };
      }),
    };
  }

  if (mode === 'GEODLE') {
    const selected = shuffleArray(countryPool.filter((country) => GEODLE_FACTS[country.name])).slice(0, effectiveRoundCount);
    if (selected.length < effectiveRoundCount) throw new Error('Geodle data is unavailable for this continent/difficulty. Try All.');
    return {
      settings,
      questions: selected.map((country) => ({
        type: 'geodle',
        questionText: 'Guess the hidden country in 6 attempts',
        correctAnswer: country.name,
        countryCode: country.code,
        facts: GEODLE_FACTS[country.name],
      })),
    };
  }

  const statCountries = countryPool.filter((country) => COUNTRY_STATS[country.name]);
  const gdpCountries = countryPool.filter((country) => GDP_PER_CAPITA[country.name]);
  const geodleCountries = countryPool.filter((country) => GEODLE_FACTS[country.name]);
  if (statCountries.length < 10 || gdpCountries.length < 10 || geodleCountries.length < 1) {
    throw new Error('Mix Mode needs enough population, area, and GDP data. Try All continents or choose another mode.');
  }

  const mixModes = shuffleArray(['CAPITALS', 'FLAGS', 'MAP_GUESS', 'POPULATION', 'AREA_SORT', 'GDP_SORT', 'GEODLE']);
  const questions = [];
  for (let i = 0; i < effectiveRoundCount; i++) {
    const nextMode = mixModes[i % mixModes.length];
    if (nextMode === 'CAPITALS') questions.push(generateCapitalQuestions(1, countryPool)[0]);
    else if (nextMode === 'FLAGS') questions.push(generateFlagQuestions(1, countryPool)[0]);
    else if (nextMode === 'MAP_GUESS') questions.push(generateMapQuestions(1, countryPool)[0]);
    else if (nextMode === 'POPULATION') {
      const country = shuffleArray(statCountries).slice(0, 1)[0];
      const stats = (await getCountryStatsBatch([country.name]))[0]?.stats;
      if (!stats) throw new Error('Country statistics are temporarily unavailable');
      questions.push({ type: 'population', questionText: `Guess the population of ${country.name}`, correctAnswer: String(stats.population), options: [], population: stats.population, countryCode: country.code });
    } else if (nextMode === 'AREA_SORT') {
      const selected = shuffleArray(statCountries).slice(0, 10);
      const stats = await getCountryStatsBatch(selected.map((country) => country.name));
      if (stats.length < 10) throw new Error('Country statistics are temporarily unavailable');
      questions.push({ type: 'area_sort', questionText: 'Sort these countries from largest to smallest area', correctAnswer: '', options: stats.map(({ name, stats }) => ({ name, area: stats.area })) });
    } else if (nextMode === 'GDP_SORT') {
      const selected = shuffleArray(gdpCountries).slice(0, 10);
      questions.push({ type: 'gdp_sort', questionText: 'Sort these countries from highest to lowest GDP per capita', correctAnswer: '', options: selected.map((country) => ({ name: country.name, gdpPerCapita: GDP_PER_CAPITA[country.name] })) });
    } else {
      const country = shuffleArray(geodleCountries).slice(0, 1)[0];
      questions.push({ type: 'geodle', questionText: 'Guess the hidden country in 6 attempts', correctAnswer: country.name, countryCode: country.code, facts: GEODLE_FACTS[country.name] });
    }
  }

  return { settings, questions };
}
