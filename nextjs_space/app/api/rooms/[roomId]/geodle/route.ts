export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import { BASE_POINTS } from '@/lib/room-utils';
import { findGeodleFact, type GeodleFact } from '@/lib/geodle-facts';

function clueStatus(value: string | boolean, target: string | boolean) {
  return value === target ? 'correct' : 'wrong';
}

function direction(value: number, target: number) {
  if (value === target) return 'correct';
  return target > value ? 'higher' : 'lower';
}

function nullableDirection(value: number | null, target: number | null) {
  if (value == null || target == null) return 'wrong';
  return direction(value, target);
}

function buildClue(guess: GeodleFact, target: GeodleFact) {
  const clue = {
    country: guess.name,
    code: guess.code,
    countryStatus: guess.name === target.name ? 'correct' : 'wrong',
    continent: { value: guess.continent, status: clueStatus(guess.continent, target.continent) },
    population: { value: guess.population, status: direction(guess.population, target.population) },
    area: { value: guess.area, status: nullableDirection(guess.area, target.area) },
    gdpPerCapita: { value: guess.gdpPerCapita, status: nullableDirection(guess.gdpPerCapita, target.gdpPerCapita) },
    landlocked: { value: guess.landlocked ? 'Yes' : 'No', status: clueStatus(guess.landlocked, target.landlocked) },
    religion: { value: guess.religion, status: clueStatus(guess.religion, target.religion) },
    temperature: { value: guess.temperature, status: direction(guess.temperature, target.temperature) },
    government: { value: guess.government, status: clueStatus(guess.government, target.government) },
  };
  const checked = [clue.continent, clue.population, clue.area, clue.gdpPerCapita, clue.landlocked, clue.religion, clue.temperature, clue.government];
  return {
    ...clue,
    veryClose: guess.name !== target.name && checked.every((item) => item.status === 'correct'),
  };
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function advanceIfReady(room: any) {
  const allAnswersForQ = await prisma.answer.findMany({ where: { roomId: room.id, questionIndex: room.currentQuestionIndex } });
  if ((allAnswersForQ?.length ?? 0) < (room.players?.length ?? 2)) return;

  const nextIndex = room.currentQuestionIndex + 1;
  if (nextIndex >= room.totalQuestions) {
    await delay(2500);
    const allAnswers = await prisma.answer.findMany({ where: { roomId: room.id } });
    const players = room.players ?? [];
    const p1Id = players[0]?.userId ?? '';
    const p2Id = players[1]?.userId ?? '';
    const p1Score = allAnswers.filter((a: any) => a.userId === p1Id).reduce((sum: number, a: any) => sum + (a.pointsEarned ?? 0), 0);
    const p2Score = allAnswers.filter((a: any) => a.userId === p2Id).reduce((sum: number, a: any) => sum + (a.pointsEarned ?? 0), 0);
    const winnerId = p1Score > p2Score ? p1Id : p2Score > p1Score ? p2Id : null;
    await prisma.room.update({ where: { id: room.id }, data: { status: 'FINISHED' } });
    await prisma.match.update({ where: { roomId: room.id }, data: { player1Score: p1Score, player2Score: p2Score, winnerId, completedAt: new Date() } });
  } else {
    await delay(2500);
    await prisma.room.update({ where: { id: room.id }, data: { currentQuestionIndex: nextIndex, questionStartedAt: new Date() } });
  }
}

export async function POST(req: NextRequest, { params }: { params: { roomId: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const guessText = String(body?.guess ?? '');
    const attempt = Math.max(1, Number(body?.attempt ?? 1));
    const userId = (session.user as any).id;

    const room = await prisma.room.findUnique({ where: { id: params.roomId }, include: { players: true } });
    if (!room) return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    if (room.status !== 'PLAYING') return NextResponse.json({ error: 'Game not in progress' }, { status: 400 });
    if (!room.players.some((player: any) => player.userId === userId)) return NextResponse.json({ error: 'Not in this room' }, { status: 403 });

    const existingAnswer = await prisma.answer.findUnique({ where: { roomId_userId_questionIndex: { roomId: room.id, userId, questionIndex: room.currentQuestionIndex } } });
    if (existingAnswer) return NextResponse.json({ error: 'Already completed this Geodle' }, { status: 400 });

    const currentQ = ((room.questions as any[]) ?? [])[room.currentQuestionIndex];
    if (currentQ?.type !== 'geodle') return NextResponse.json({ error: 'Current question is not Geodle' }, { status: 400 });
    const maxAttempts = Math.min(12, Math.max(6, Number(currentQ.maxAttempts ?? 6)));

    const target = findGeodleFact(String(currentQ.correctAnswer ?? ''));
    const guess = findGeodleFact(guessText);
    if (!target || !guess) return NextResponse.json({ error: 'Country not found in Geodle data' }, { status: 400 });

    const isCorrect = guess.name === target.name;
    const completed = isCorrect || attempt >= maxAttempts;
    const pointsEarned = isCorrect ? BASE_POINTS + Math.max(0, maxAttempts - attempt) * 20 : 0;

    if (completed) {
      await prisma.answer.create({
        data: { roomId: room.id, userId, questionIndex: room.currentQuestionIndex, selectedAnswer: guess.name, isCorrect, pointsEarned },
      });
      await advanceIfReady(room);
    }

    return NextResponse.json({
      clue: buildClue(guess, target),
      isCorrect,
      completed,
      pointsEarned,
      correctAnswer: completed ? target.name : undefined,
      maxAttempts,
    });
  } catch (error: any) {
    console.error('Geodle guess error:', error);
    return NextResponse.json({ error: 'Failed to submit Geodle guess' }, { status: 500 });
  }
}
