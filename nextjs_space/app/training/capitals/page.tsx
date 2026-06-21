import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth-options';
import CapitalTrainer from './_components/capital-trainer';

export const dynamic = 'force-dynamic';

export default async function CapitalTrainingPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) redirect('/');

  return <CapitalTrainer />;
}
