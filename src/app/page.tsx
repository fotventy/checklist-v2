import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { HomePage } from '@/components/HomePage';
import { authOptions } from './api/auth/[...nextauth]/route';

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/signin');
  }

  return <HomePage username={session.user?.name || session.user?.email || ''} />;
}
