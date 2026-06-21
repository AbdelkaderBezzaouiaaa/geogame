export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;

    const matches = await prisma.match.findMany({
      where: {
        OR: [
          { player1Id: userId },
          { player2Id: userId },
        ],
        completedAt: { not: null },
      },
      include: {
        player1: { select: { id: true, username: true } },
        player2: { select: { id: true, username: true } },
        winner: { select: { id: true, username: true } },
      },
      orderBy: { completedAt: 'desc' },
      take: 20,
    });

    return NextResponse.json(
      matches?.map((m: any) => ({
        id: m?.id,
        mode: m?.mode,
        player1: { id: m?.player1?.id, username: m?.player1?.username },
        player2: { id: m?.player2?.id, username: m?.player2?.username },
        player1Score: m?.player1Score ?? 0,
        player2Score: m?.player2Score ?? 0,
        winner: m?.winner ? { id: m.winner.id, username: m.winner.username } : null,
        completedAt: m?.completedAt?.toISOString() ?? null,
      })) ?? []
    );
  } catch (error: any) {
    console.error('Match history error:', error);
    return NextResponse.json({ error: 'Failed to get history' }, { status: 500 });
  }
}
