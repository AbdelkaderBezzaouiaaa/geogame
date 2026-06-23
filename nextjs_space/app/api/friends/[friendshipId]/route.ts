export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

export async function PATCH(_req: NextRequest, { params }: { params: { friendshipId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = (session.user as any).id;
  const request = await prisma.friendship.findUnique({ where: { id: params.friendshipId } });
  if (!request || request.addresseeId !== userId) return NextResponse.json({ error: 'Request not found' }, { status: 404 });
  await prisma.friendship.update({ where: { id: request.id }, data: { status: 'ACCEPTED' } });
  return NextResponse.json({ ok: true });
}
