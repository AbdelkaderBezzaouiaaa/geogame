export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { isSmartCorrectAnswer } from '@/lib/smart-answer';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const answer = String(body?.answer ?? '');
    const correctAnswer = String(body?.correctAnswer ?? '');
    const questionType = String(body?.questionType ?? 'training');

    if (!answer.trim() || !correctAnswer.trim()) {
      return NextResponse.json({ isCorrect: false });
    }

    const isCorrect = await isSmartCorrectAnswer({ answer, correctAnswer, questionType });
    return NextResponse.json({ isCorrect });
  } catch (error: any) {
    console.error('Smart answer check error:', error);
    return NextResponse.json({ error: 'Failed to check answer' }, { status: 500 });
  }
}
