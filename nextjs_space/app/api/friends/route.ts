export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = (session.user as any).id;
  const [relationships, invitations] = await Promise.all([
    prisma.friendship.findMany({ where: { OR: [{ requesterId: userId }, { addresseeId: userId }] }, include: { requester: { select: { id: true, username: true } }, addressee: { select: { id: true, username: true } } }, orderBy: { updatedAt: 'desc' } }),
    prisma.room.findMany({ where: { status: 'WAITING', players: { some: { userId } }, hostId: { not: userId } }, include: { host: { select: { username: true } }, players: true }, orderBy: { createdAt: 'desc' } }),
  ]);
  return NextResponse.json({
    friends: relationships.filter((r) => r.status === 'ACCEPTED').map((r) => r.requesterId === userId ? r.addressee : r.requester),
    incoming: relationships.filter((r) => r.status === 'PENDING' && r.addresseeId === userId).map((r) => ({ id: r.id, user: r.requester })),
    invitations: invitations.map((r) => ({ id: r.id, host: r.host.username })),
  });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = (session.user as any).id;
  const { username } = await req.json();
  const friend = await prisma.user.findUnique({ where: { username: String(username ?? '').trim() }, select: { id: true, username: true } });
  if (!friend) return NextResponse.json({ error: 'Player not found' }, { status: 404 });
  if (friend.id === userId) return NextResponse.json({ error: 'You cannot add yourself' }, { status: 400 });
  const existing = await prisma.friendship.findFirst({ where: { OR: [{ requesterId: userId, addresseeId: friend.id }, { requesterId: friend.id, addresseeId: userId }] } });
  if (existing) return NextResponse.json({ error: 'Friend request already exists' }, { status: 400 });
  await prisma.friendship.create({ data: { requesterId: userId, addresseeId: friend.id } });
  return NextResponse.json({ ok: true });
}
