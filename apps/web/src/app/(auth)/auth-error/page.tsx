'use client';

import { useSession } from '@/src/lib/auth/auth-client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AuthErrorPage() {
  const router = useRouter();
  const session = useSession();

  useEffect(() => {
    if (session.isPending) return;

    if (session.data?.user) {
      router.replace('/');
    } else {
      router.replace('/login?error=auth_failed');
    }
  }, [session.data, session.isPending, router]);

  return (
    <div className="bg-bg grid h-screen place-items-center">
      <p className="text-text-main">Checking your session...</p>
    </div>
  );
}
