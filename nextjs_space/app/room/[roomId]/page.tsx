import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { redirect } from 'next/navigation';
import RoomClient from './_components/room-client';

export const dynamic = 'force-dynamic';

export default async function RoomPage({ params }: { params: { roomId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect('/');
  }
  return <RoomClient roomId={params?.roomId ?? ''} />;
}
