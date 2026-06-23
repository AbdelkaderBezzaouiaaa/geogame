export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

export async function GET(_req: NextRequest, { params }: { params: { userId: string } }) {
  const session = await getServerSession(authOptions);
  const user = await prisma.user.findUnique({ where: { id: params.userId }, select: { id: true, username: true, bio: true, countryCode: true, avatarUrl: true, createdAt: true } });
  if (!user) return NextResponse.json({ error: 'Player not found' }, { status: 404 });
  const viewerId = (session?.user as any)?.id;
  const friendship = viewerId && viewerId !== user.id ? await prisma.friendship.findFirst({ where: { OR: [{ requesterId: viewerId, addresseeId: user.id }, { requesterId: user.id, addresseeId: viewerId }] } }) : null;
  return NextResponse.json({ ...user, friendshipStatus: friendship?.status ?? null });
}

export async function PATCH(req: NextRequest, { params }: { params: { userId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).id !== params.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { username, bio, countryCode, avatarUrl } = await req.json();
  try {
    const user = await prisma.user.update({ where: { id: params.userId }, data: { username: String(username).trim(), bio: bio?.trim() || null, countryCode: countryCode || null, avatarUrl: avatarUrl || null }, select: { id: true, username: true, bio: true, countryCode: true, avatarUrl: true } });
    return NextResponse.json(user);
  } catch { return NextResponse.json({ error: 'Username is already taken' }, { status: 400 }); }
}
