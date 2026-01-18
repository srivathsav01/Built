import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import Header from '@/components/Header';

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <>
      <Header />
      <main>{children}</main>
    </>
  );
}