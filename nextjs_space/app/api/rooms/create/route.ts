export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import { generateRoomCode } from '@/lib/room-utils';
import { GAME_MODES, generateRoomQuestions } from '@/lib/room-question-generator';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { mode, friendId } = body ?? {};

    if (!mode || !GAME_MODES.includes(mode)) {
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

    let generated;
    try {
      generated = await generateRoomQuestions({
        mode,
        roundCount: body?.roundCount,
        continent: body?.continent,
        difficulty: body?.difficulty,
        answerTime: body?.answerTime,
      });
    } catch (error: any) {
      return NextResponse.json({ error: error?.message ?? 'Failed to generate questions' }, { status: 400 });
    }
    const { questions, settings } = generated;

    const room = await prisma.room.create({
      data: {
        roomCode,
        hostId: userId,
        mode,
        status: 'WAITING',
        questions: JSON.parse(JSON.stringify(questions)),
        totalQuestions: questions.length,
        continent: settings.selectedContinent === 'All' ? null : settings.selectedContinent,
        difficulty: settings.selectedDifficulty === 'All' ? null : settings.selectedDifficulty,
        answerTime: settings.answerTime,
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
