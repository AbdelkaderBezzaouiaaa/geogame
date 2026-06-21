import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { redirect } from 'next/navigation';
import LandingPage from './_components/landing-page';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const session = await getServerSession(authOptions);
  if (session?.user) {
    redirect('/dashboard');
  }
  return <LandingPage />;
}
