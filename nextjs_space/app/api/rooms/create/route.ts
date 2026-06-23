export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import { generateRoomCode, TOTAL_QUESTIONS } from '@/lib/room-utils';
import { generateCapitalQuestions, generateFlagQuestions, generateMixQuestions, generateMapQuestions } from '@/lib/countries';
import { getCountryStatsBatch } from '@/lib/country-stats';
import { shuffleArray, COUNTRIES } from '@/lib/countries';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { mode, friendId } = body ?? {};

    if (!mode || !['CAPITALS', 'FLAGS', 'POPULATION', 'AREA_SORT', 'MIX', 'MAP_GUESS'].includes(mode)) {
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

    // Generate questions
    let questions: any[];
    if (mode === 'CAPITALS') {
      questions = generateCapitalQuestions(TOTAL_QUESTIONS);
    } else if (mode === 'FLAGS') {
      questions = generateFlagQuestions(TOTAL_QUESTIONS);
    } else if (mode === 'POPULATION' || mode === 'AREA_SORT') {
      const selected = shuffleArray(COUNTRIES).slice(0, mode === 'POPULATION' ? 5 : 10);
      const stats = await getCountryStatsBatch(selected.map((country) => country.name));
      if (stats.length < (mode === 'POPULATION' ? 5 : 10)) return NextResponse.json({ error: 'Country statistics are temporarily unavailable' }, { status: 503 });
      questions = mode === 'POPULATION'
        ? stats.slice(0, 5).map(({ name, stats }) => ({ type: 'population', questionText: `Guess the population of ${name}`, correctAnswer: String(stats.population), options: [], population: stats.population, countryCode: COUNTRIES.find((country) => country.name === name)?.code }))
        : [{ type: 'area_sort', questionText: 'Sort these countries from largest to smallest area', correctAnswer: '', options: stats.map(({ name, stats }) => ({ name, area: stats.area })) }];
    } else if (mode === 'MIX') {
      questions = generateMixQuestions(TOTAL_QUESTIONS);
    } else {
      questions = generateMapQuestions(TOTAL_QUESTIONS);
    }

    const room = await prisma.room.create({
      data: {
        roomCode,
        hostId: userId,
        mode,
        status: 'WAITING',
        questions: JSON.parse(JSON.stringify(questions)),
        totalQuestions: mode === 'AREA_SORT' ? 1 : mode === 'POPULATION' ? 5 : TOTAL_QUESTIONS,
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
