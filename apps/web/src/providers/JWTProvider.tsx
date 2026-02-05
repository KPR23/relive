'use client';

import { useEffect } from 'react';
import { useSession, fetchAndStoreJWT } from '../lib/auth/auth-client';
import { JWT_COOKIE_NAME } from '../lib/constants';

function hasJWTCookie(): boolean {
  if (typeof document === 'undefined') return false;
  return document.cookie
    .split(';')
    .some((c) => c.trim().startsWith(`${JWT_COOKIE_NAME}=`));
}

export function JWTProvider({ children }: { children: React.ReactNode }) {
  const session = useSession();

  useEffect(() => {
    if (session.data?.user && !hasJWTCookie()) {
      fetchAndStoreJWT();
    }
  }, [session.data?.user]);

  return <>{children}</>;
}
