export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { roomCode } = body ?? {};

    if (!roomCode) {
      return NextResponse.json({ error: 'Room code is required' }, { status: 400 });
    }

    const userId = (session.user as any).id;
    const code = (roomCode ?? '').toString().toUpperCase().trim();

    const room = await prisma.room.findUnique({
      where: { roomCode: code },
      include: {
        players: { include: { user: { select: { id: true, username: true } } } },
      },
    });

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    if (room.status !== 'WAITING') {
      return NextResponse.json({ error: 'Game already started or finished' }, { status: 400 });
    }

    if ((room.players?.length ?? 0) >= 2) {
      return NextResponse.json({ error: 'Room is full' }, { status: 400 });
    }

    // Check if already in room
    const alreadyIn = room.players?.some((p: any) => p?.userId === userId);
    if (alreadyIn) {
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
    }

    await prisma.roomPlayer.create({
      data: {
        roomId: room.id,
        userId,
      },
    });

    const updatedRoom = await prisma.room.findUnique({
      where: { id: room.id },
      include: {
        players: { include: { user: { select: { id: true, username: true } } } },
      },
    });

    return NextResponse.json({
      id: updatedRoom?.id,
      roomCode: updatedRoom?.roomCode,
      mode: updatedRoom?.mode,
      status: updatedRoom?.status,
      players: updatedRoom?.players?.map((p: any) => ({
        id: p?.user?.id,
        username: p?.user?.username,
        score: p?.score ?? 0,
      })) ?? [],
    });
  } catch (error: any) {
    console.error('Join room error:', error);
    return NextResponse.json({ error: 'Failed to join room' }, { status: 500 });
  }
}
