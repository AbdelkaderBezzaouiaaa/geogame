export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import { generateRoomCode, TOTAL_QUESTIONS } from '@/lib/room-utils';
import { generateCapitalQuestions, generateFlagQuestions, generateMixQuestions, generateMapQuestions } from '@/lib/countries';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { mode } = body ?? {};

    if (!mode || !['CAPITALS', 'FLAGS', 'MIX', 'MAP_GUESS'].includes(mode)) {
      return NextResponse.json({ error: 'Invalid game mode' }, { status: 400 });
    }

    const userId = (session.user as any).id;

    // Generate unique room code
    let roomCode = generateRoomCode();
    let existing = await prisma.room.findUnique({ where: { roomCode } });
    while (existing) {
      roomCode = generateRoomCode();
      existing = await prisma.room.findUnique({ where: { roomCode } });
    }

    // Generate questions
    let questions;
    if (mode === 'CAPITALS') {
      questions = generateCapitalQuestions(TOTAL_QUESTIONS);
    } else if (mode === 'FLAGS') {
      questions = generateFlagQuestions(TOTAL_QUESTIONS);
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
        totalQuestions: TOTAL_QUESTIONS,
        players: {
          create: {
            userId,
          },
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
