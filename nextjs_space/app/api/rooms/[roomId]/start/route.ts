export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

export async function POST(
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
      include: {
        players: true,
      },
    });

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    if (room.hostId !== userId) {
      return NextResponse.json({ error: 'Only the host can start the game' }, { status: 403 });
    }

    if ((room.players?.length ?? 0) < 2) {
      return NextResponse.json({ error: 'Need 2 players to start' }, { status: 400 });
    }

    if (room.status !== 'WAITING') {
      return NextResponse.json({ error: 'Game already started' }, { status: 400 });
    }

    const players = room.players ?? [];

    await prisma.room.update({
      where: { id: room.id },
      data: {
        status: 'PLAYING',
        questionStartedAt: new Date(),
        match: {
          create: {
            player1Id: players[0]?.userId ?? '',
            player2Id: players[1]?.userId ?? '',
            mode: room.mode,
          },
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Start game error:', error);
    return NextResponse.json({ error: 'Failed to start game' }, { status: 500 });
  }
}
