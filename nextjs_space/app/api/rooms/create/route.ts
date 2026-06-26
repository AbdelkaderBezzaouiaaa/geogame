export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import { generateRoomCode, TOTAL_QUESTIONS } from '@/lib/room-utils';
import { filterCountriesByDifficulty, generateCapitalQuestions, generateFlagQuestions, generateMapQuestions } from '@/lib/countries';
import { COUNTRY_STATS, getCountryStatsBatch } from '@/lib/country-stats';
import { GDP_PER_CAPITA } from '@/lib/gdp-per-capita';
import { shuffleArray, COUNTRIES } from '@/lib/countries';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { mode, friendId } = body ?? {};
    const rawRoundCount = Number(body?.roundCount ?? TOTAL_QUESTIONS);
    const rawAnswerTime = Number(body?.answerTime ?? 15);
    const continent = typeof body?.continent === 'string' ? body.continent.trim() : 'All';
    const difficulty = typeof body?.difficulty === 'string' ? body.difficulty.trim() : 'All';
    const roundCount = Math.min(20, Math.max(1, Number.isFinite(rawRoundCount) ? Math.floor(rawRoundCount) : TOTAL_QUESTIONS));
    const effectiveRoundCount = mode === 'MIX' ? Math.max(6, roundCount) : roundCount;
    const answerTime = Math.min(60, Math.max(5, Number.isFinite(rawAnswerTime) ? Math.floor(rawAnswerTime) : 15));
    const allowedContinents = ['All', 'Africa', 'Asia', 'Europe', 'North America', 'South America', 'Oceania'];
    const selectedContinent = allowedContinents.includes(continent) ? continent : 'All';
    const allowedDifficulties = ['All', 'Easy', 'Medium', 'Hard'];
    const selectedDifficulty = allowedDifficulties.includes(difficulty) ? difficulty : 'All';

    if (!mode || !['CAPITALS', 'FLAGS', 'POPULATION', 'AREA_SORT', 'GDP_SORT', 'MIX', 'MAP_GUESS'].includes(mode)) {
      return NextResponse.json({ error: 'Invalid game mode' }, { status: 400 });
    }

    const userId = (session.user as any).id;

    if (friendId) {
      const friendship = await prisma.friendship.findFirst({ where: { status: 'ACCEPTED', OR: [{ requesterId: userId, addresseeId: friendId }, { requesterId: friendId, addresseeId: userId }] } });
      if (!friendship) return NextResponse.json({ error: 'You can only invite accepted friends' }, { status: 403 });
    }

    // Generate unique room code
    let roomCode = generateRoomCode();
    let existing = await prisma.room.findUnique({ where: { roomCode } });
    while (existing) {
      roomCode = generateRoomCode();
      existing = await prisma.room.findUnique({ where: { roomCode } });
    }

    const continentPool = selectedContinent === 'All'
      ? COUNTRIES
      : COUNTRIES.filter((country) => country.continent === selectedContinent);
    const countryPool = filterCountriesByDifficulty(continentPool, selectedDifficulty);

    if (countryPool.length < 4) {
      return NextResponse.json({ error: 'Not enough countries for this continent and difficulty. Try All difficulty or All continents.' }, { status: 400 });
    }

    // Generate questions
    let questions: any[];
    if (mode === 'CAPITALS') {
      questions = generateCapitalQuestions(effectiveRoundCount, countryPool);
    } else if (mode === 'FLAGS') {
      questions = generateFlagQuestions(effectiveRoundCount, countryPool);
    } else if (mode === 'POPULATION' || mode === 'AREA_SORT') {
      const neededCountries = mode === 'POPULATION' ? effectiveRoundCount : effectiveRoundCount * 10;
      const selected = shuffleArray(countryPool.filter((country) => COUNTRY_STATS[country.name])).slice(0, neededCountries);
      const stats = await getCountryStatsBatch(selected.map((country) => country.name));
      if (stats.length < neededCountries) return NextResponse.json({ error: 'Country statistics are temporarily unavailable for this continent. Try All continents or choose fewer rounds.' }, { status: 503 });
      questions = mode === 'POPULATION'
        ? stats.slice(0, effectiveRoundCount).map(({ name, stats }) => ({ type: 'population', questionText: `Guess the population of ${name}`, correctAnswer: String(stats.population), options: [], population: stats.population, countryCode: COUNTRIES.find((country) => country.name === name)?.code }))
        : Array.from({ length: effectiveRoundCount }, (_, roundIndex) => {
            const roundStats = stats.slice(roundIndex * 10, roundIndex * 10 + 10);
            return { type: 'area_sort', questionText: 'Sort these countries from largest to smallest area', correctAnswer: '', options: roundStats.map(({ name, stats }) => ({ name, area: stats.area })) };
          });
    } else if (mode === 'GDP_SORT') {
      const neededCountries = effectiveRoundCount * 10;
      const selected = shuffleArray(countryPool.filter((country) => GDP_PER_CAPITA[country.name])).slice(0, neededCountries);
      if (selected.length < neededCountries) return NextResponse.json({ error: 'GDP per capita data is temporarily unavailable for this continent. Try All continents or choose fewer rounds.' }, { status: 503 });
      questions = Array.from({ length: effectiveRoundCount }, (_, roundIndex) => {
        const roundCountries = selected.slice(roundIndex * 10, roundIndex * 10 + 10);
        return {
          type: 'gdp_sort',
          questionText: 'Sort these countries from highest to lowest GDP per capita',
          correctAnswer: '',
          options: roundCountries.map((country) => ({ name: country.name, gdpPerCapita: GDP_PER_CAPITA[country.name] })),
        };
      });
    } else if (mode === 'MIX') {
      const statCountries = countryPool.filter((country) => COUNTRY_STATS[country.name]);
      const gdpCountries = countryPool.filter((country) => GDP_PER_CAPITA[country.name]);
      if (statCountries.length < 10 || gdpCountries.length < 10) {
        return NextResponse.json({ error: 'Mix Mode needs enough population, area, and GDP data. Try All continents or choose another mode.' }, { status: 503 });
      }

      const mixModes = shuffleArray(['CAPITALS', 'FLAGS', 'MAP_GUESS', 'POPULATION', 'AREA_SORT', 'GDP_SORT']);
      questions = [];
      for (let i = 0; i < effectiveRoundCount; i++) {
        const nextMode = mixModes[i % mixModes.length];
        if (nextMode === 'CAPITALS') {
          questions.push(generateCapitalQuestions(1, countryPool)[0]);
        } else if (nextMode === 'FLAGS') {
          questions.push(generateFlagQuestions(1, countryPool)[0]);
        } else if (nextMode === 'MAP_GUESS') {
          questions.push(generateMapQuestions(1, countryPool)[0]);
        } else if (nextMode === 'POPULATION') {
          const country = shuffleArray(statCountries).slice(0, 1)[0];
          const stats = (await getCountryStatsBatch([country.name]))[0]?.stats;
          if (!stats) return NextResponse.json({ error: 'Country statistics are temporarily unavailable' }, { status: 503 });
          questions.push({ type: 'population', questionText: `Guess the population of ${country.name}`, correctAnswer: String(stats.population), options: [], population: stats.population, countryCode: country.code });
        } else if (nextMode === 'AREA_SORT') {
          const selected = shuffleArray(statCountries).slice(0, 10);
          const stats = await getCountryStatsBatch(selected.map((country) => country.name));
          if (stats.length < 10) return NextResponse.json({ error: 'Country statistics are temporarily unavailable' }, { status: 503 });
          questions.push({ type: 'area_sort', questionText: 'Sort these countries from largest to smallest area', correctAnswer: '', options: stats.map(({ name, stats }) => ({ name, area: stats.area })) });
        } else {
          const selected = shuffleArray(gdpCountries).slice(0, 10);
          questions.push({ type: 'gdp_sort', questionText: 'Sort these countries from highest to lowest GDP per capita', correctAnswer: '', options: selected.map((country) => ({ name: country.name, gdpPerCapita: GDP_PER_CAPITA[country.name] })) });
        }
      }
    } else {
      questions = generateMapQuestions(effectiveRoundCount, countryPool);
    }

    const room = await prisma.room.create({
      data: {
        roomCode,
        hostId: userId,
        mode,
        status: 'WAITING',
        questions: JSON.parse(JSON.stringify(questions)),
        totalQuestions: questions.length,
        continent: selectedContinent === 'All' ? null : selectedContinent,
        difficulty: selectedDifficulty === 'All' ? null : selectedDifficulty,
        answerTime,
        players: {
          create: friendId ? [{ userId }, { userId: friendId }] : [{ userId }],
        },
      },
      include: {
        players: { include: { user: { select: { id: true, username: true } } } },
      },
    });

    return NextResponse.json({
      id: room.id,
      roomCode: room.roomCode,
      mode: room.mode,
      status: room.status,
      players: room.players?.map((p: any) => ({
        id: p?.user?.id,
        username: p?.user?.username,
        score: p?.score ?? 0,
      })) ?? [],
    });
  } catch (error: any) {
    console.error('Create room error:', error);
    return NextResponse.json({ error: 'Failed to create room' }, { status: 500 });
  }
}
