import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth-options';
import FlagTrainer from './_components/flag-trainer';

export const dynamic = 'force-dynamic';

export default async function FlagTrainingPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/');
  }

  return <FlagTrainer />;
}
