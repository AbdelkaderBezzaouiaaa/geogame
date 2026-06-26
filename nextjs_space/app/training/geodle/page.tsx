import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth-options';
import GeodleTrainer from './_components/geodle-trainer';

export const dynamic = 'force-dynamic';

export default async function GeodleTrainingPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) redirect('/');

  return <GeodleTrainer />;
}
