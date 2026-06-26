export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import { generateRoomQuestions } from '@/lib/room-question-generator';

export async function GET(
  req: NextRequest,
  { params }: { params: { roomId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const room = await prisma.room.findUnique({
      where: { id: params?.roomId },
      include: {
        players: {
          include: { user: { select: { id: true, username: true, avatarUrl: true } } },
        },
        match: true,
      },
    });

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    const userId = (session.user as any).id;
    const isPlayer = room.players?.some((p: any) => p?.userId === userId);
    if (!isPlayer) {
      return NextResponse.json({ error: 'Not in this room' }, { status: 403 });
    }

    // Get answers for current question to check if both answered
    const answers = await prisma.answer.findMany({
      where: {
        roomId: room.id,
        questionIndex: room.currentQuestionIndex,
      },
    });

    // Get all answers for score calculation
    const allAnswers = await prisma.answer.findMany({
      where: { roomId: room.id },
    });

    const playerScores: Record<string, number> = {};
    for (const p of room.players ?? []) {
      const userAnswers = allAnswers?.filter((a: any) => a?.userId === p?.userId) ?? [];
      playerScores[p?.userId ?? ''] = userAnswers.reduce((sum: number, a: any) => sum + (a?.pointsEarned ?? 0), 0);
    }

    // Don't send question answers to client
    const questions = (room.questions as any[]) ?? [];
    const currentQ = questions?.[room.currentQuestionIndex];
    const safeQuestion = currentQ
      ? {
          type: currentQ.type,
          questionText: currentQ.questionText,
          options: currentQ.options,
          countryCode: currentQ.countryCode,
          lat: currentQ.lat,
          lng: currentQ.lng,
          maxAttempts: currentQ.type === 'geodle' ? 6 : undefined,
        }
      : null;

    return NextResponse.json({
      id: room.id,
      roomCode: room.roomCode,
      mode: room.mode,
      status: room.status,
      hostId: room.hostId,
      currentQuestionIndex: room.currentQuestionIndex,
      totalQuestions: room.totalQuestions,
      continent: room.continent,
      difficulty: room.difficulty,
      answerTime: room.answerTime,
      questionStartedAt: room.questionStartedAt?.toISOString() ?? null,
      currentQuestion: safeQuestion,
      answeredCount: answers?.length ?? 0,
      players: room.players?.map((p: any) => ({
        id: p?.user?.id,
        username: p?.user?.username,
        avatarUrl: p?.user?.avatarUrl,
        score: playerScores[p?.userId ?? ''] ?? 0,
        hasAnswered: answers?.some((a: any) => a?.userId === p?.userId) ?? false,
      })) ?? [],
      match: room.match
        ? {
            winnerId: room.match.winnerId,
            player1Score: room.match.player1Score,
            player2Score: room.match.player2Score,
          }
        : null,
    });
  } catch (error: any) {
    console.error('Get room error:', error);
    return NextResponse.json({ error: 'Failed to get room' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { roomId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const room = await prisma.room.findUnique({
      where: { id: params?.roomId },
      include: { players: true },
    });

    if (!room) return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    if (room.hostId !== userId) return NextResponse.json({ error: 'Only the host can change lobby settings' }, { status: 403 });
    if (room.status !== 'WAITING') return NextResponse.json({ error: 'Settings can only be changed before the game starts' }, { status: 400 });

    const body = await req.json();
    let generated;
    try {
      generated = await generateRoomQuestions({
        mode: room.mode,
        roundCount: body?.roundCount ?? room.totalQuestions,
        continent: body?.continent ?? room.continent ?? 'All',
        difficulty: body?.difficulty ?? room.difficulty ?? 'All',
        answerTime: body?.answerTime ?? room.answerTime,
      });
    } catch (error: any) {
      return NextResponse.json({ error: error?.message ?? 'Failed to update lobby settings' }, { status: 400 });
    }

    const updated = await prisma.room.update({
      where: { id: room.id },
      data: {
        questions: JSON.parse(JSON.stringify(generated.questions)),
        totalQuestions: generated.questions.length,
        continent: generated.settings.selectedContinent === 'All' ? null : generated.settings.selectedContinent,
        difficulty: generated.settings.selectedDifficulty === 'All' ? null : generated.settings.selectedDifficulty,
        answerTime: generated.settings.answerTime,
      },
    });

    return NextResponse.json({
      success: true,
      totalQuestions: updated.totalQuestions,
      continent: updated.continent,
      difficulty: updated.difficulty,
      answerTime: updated.answerTime,
    });
  } catch (error: any) {
    console.error('Update room settings error:', error);
    return NextResponse.json({ error: 'Failed to update lobby settings' }, { status: 500 });
  }
}
