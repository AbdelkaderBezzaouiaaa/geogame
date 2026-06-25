export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import { BASE_POINTS, SPEED_BONUS, QUESTION_TIME_LIMIT } from '@/lib/room-utils';
import { isSmartCorrectAnswer } from '@/lib/smart-answer';

export async function POST(
  req: NextRequest,
  { params }: { params: { roomId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { answer } = body ?? {};
    const userId = (session.user as any).id;

    const room = await prisma.room.findUnique({
      where: { id: params?.roomId },
      include: { players: true },
    });

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    if (room.status !== 'PLAYING') {
      return NextResponse.json({ error: 'Game not in progress' }, { status: 400 });
    }

    const isPlayer = room.players?.some((p: any) => p?.userId === userId);
    if (!isPlayer) {
      return NextResponse.json({ error: 'Not in this room' }, { status: 403 });
    }

    // Check if already answered
    const existingAnswer = await prisma.answer.findUnique({
      where: {
        roomId_userId_questionIndex: {
          roomId: room.id,
          userId,
          questionIndex: room.currentQuestionIndex,
        },
      },
    });

    if (existingAnswer) {
      return NextResponse.json({ error: 'Already answered this question' }, { status: 400 });
    }

    const questions = (room.questions as any[]) ?? [];
    const currentQ = questions?.[room.currentQuestionIndex];
    if (!currentQ) {
      return NextResponse.json({ error: 'No current question' }, { status: 400 });
    }

    const isPopulation = currentQ.type === 'population';
    const isAreaSort = currentQ.type === 'area_sort';
    const isGdpSort = currentQ.type === 'gdp_sort';
    if (isPopulation && !/^\d+$/.test(String(answer ?? ''))) return NextResponse.json({ error: 'Enter digits only' }, { status: 400 });
    const expectedOrder = isAreaSort
      ? [...(currentQ.options ?? [])].sort((a: any, b: any) => b.area - a.area).map((item: any) => item.name)
      : isGdpSort
        ? [...(currentQ.options ?? [])].sort((a: any, b: any) => b.gdpPerCapita - a.gdpPerCapita).map((item: any) => item.name)
        : [];
    const submittedOrder = (isAreaSort || isGdpSort) ? JSON.parse(String(answer ?? '[]')) : [];
    const sortPoints = (isAreaSort || isGdpSort) ? submittedOrder.reduce((total: number, name: string, index: number) => total + (name === expectedOrder[index] ? 1 : 0), 0) : 0;
    const isFullSortCorrect = (isAreaSort || isGdpSort) && sortPoints === expectedOrder.length;
    const canUseSmartChecker = ['capital', 'flag', 'country_from_capital'].includes(String(currentQ.type ?? ''));
    const isCorrect = isPopulation
      ? false
      : (isAreaSort || isGdpSort)
        ? isFullSortCorrect
        : canUseSmartChecker
          ? await isSmartCorrectAnswer({ answer: String(answer ?? ''), correctAnswer: String(currentQ.correctAnswer ?? ''), questionType: String(currentQ.type ?? '') })
          : String(answer ?? '') === String(currentQ.correctAnswer ?? '');

    // Check if first to answer correctly
    const otherAnswers = await prisma.answer.findMany({
      where: {
        roomId: room.id,
        questionIndex: room.currentQuestionIndex,
        isCorrect: true,
      },
    });

    const isFirstCorrect = isCorrect && (otherAnswers?.length ?? 0) === 0;
    const pointsEarned = isPopulation ? 0 : (isAreaSort || isGdpSort) ? sortPoints : isCorrect ? BASE_POINTS + (isFirstCorrect ? SPEED_BONUS : 0) : 0;

    await prisma.answer.create({
      data: {
        roomId: room.id,
        userId,
        questionIndex: room.currentQuestionIndex,
        selectedAnswer: answer ?? '',
        isCorrect,
        pointsEarned,
      },
    });

    // Check if both players answered
    const allAnswersForQ = await prisma.answer.findMany({
      where: {
        roomId: room.id,
        questionIndex: room.currentQuestionIndex,
      },
    });

    const bothAnswered = (allAnswersForQ?.length ?? 0) >= (room.players?.length ?? 2);

    if (bothAnswered && isPopulation) {
      const actual = Number(currentQ.population);
      const ranked = allAnswersForQ.map((item: any) => ({ ...item, difference: Math.abs(Number(item.selectedAnswer) - actual) })).sort((a: any, b: any) => a.difference - b.difference);
      if (ranked[0].difference !== ranked[1].difference) await prisma.answer.update({ where: { id: ranked[0].id }, data: { isCorrect: true, pointsEarned: 1 } });
    }

    if (bothAnswered) {
      const nextIndex = room.currentQuestionIndex + 1;
      if (nextIndex >= room.totalQuestions) {
        // Game finished
        const allAnswers = await prisma.answer.findMany({
          where: { roomId: room.id },
        });

        const players = room.players ?? [];
        const p1Id = players[0]?.userId ?? '';
        const p2Id = players[1]?.userId ?? '';

        const p1Score = allAnswers
          ?.filter((a: any) => a?.userId === p1Id)
          ?.reduce((sum: number, a: any) => sum + (a?.pointsEarned ?? 0), 0) ?? 0;
        const p2Score = allAnswers
          ?.filter((a: any) => a?.userId === p2Id)
          ?.reduce((sum: number, a: any) => sum + (a?.pointsEarned ?? 0), 0) ?? 0;

        let winnerId: string | null = null;
        if (p1Score > p2Score) winnerId = p1Id;
        else if (p2Score > p1Score) winnerId = p2Id;

        await prisma.room.update({
          where: { id: room.id },
          data: { status: 'FINISHED' },
        });

        await prisma.match.update({
          where: { roomId: room.id },
          data: {
            player1Score: p1Score,
            player2Score: p2Score,
            winnerId,
            completedAt: new Date(),
          },
        });
      } else {
        // Next question
        await prisma.room.update({
          where: { id: room.id },
          data: {
            currentQuestionIndex: nextIndex,
            questionStartedAt: new Date(),
          },
        });
      }
    }

    const educationalAnswer = (isAreaSort || isGdpSort)
      ? expectedOrder.join(' → ')
      : isPopulation
        ? Number(currentQ.population).toLocaleString('en-US')
        : String(currentQ.correctAnswer ?? '');

    return NextResponse.json({
      isCorrect,
      pointsEarned,
      correctAnswer: isCorrect ? undefined : educationalAnswer,
    });
  } catch (error: any) {
    console.error('Answer error:', error);
    return NextResponse.json({ error: 'Failed to submit answer' }, { status: 500 });
  }
}
