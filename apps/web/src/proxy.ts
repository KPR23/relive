import { getCookieCache } from 'better-auth/cookies';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { authClient } from './lib/auth-client';
import { LOGIN_URL, PUBLIC_ROUTES } from './lib/constants';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.next();
  }

  const cookieCache = await getCookieCache(request, {
    cookiePrefix: 'relive',
  });

  if (!cookieCache) {
    return NextResponse.redirect(new URL(LOGIN_URL, request.url));
  }

  try {
    const session = await authClient.getSession({
      fetchOptions: {
        headers: await headers(),
      },
    });

    if (!session) {
      return NextResponse.redirect(new URL(LOGIN_URL, request.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.warn('⚠️ Session verification failed:', error);
    return NextResponse.redirect(new URL(LOGIN_URL, request.url));
  }
}

export const config = {
  matcher: ['/', '/f/:folderId'],
};
