import { getSessionCookie } from 'better-auth/cookies';
import { NextRequest, NextResponse } from 'next/server';
import { authClient } from './lib/auth/auth-client';
import { LOGIN_URL, PUBLIC_ROUTES } from './lib/constants';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.next();
  }

  const sessionCookie = getSessionCookie(request);

  if (!sessionCookie) {
    try {
      const { data: session } = await authClient.getSession({
        fetchOptions: {
          headers: Object.fromEntries(request.headers),
        },
      });

      if (!session) {
        return NextResponse.redirect(new URL(LOGIN_URL, request.url));
      }

      return NextResponse.next();
    } catch {
      return NextResponse.redirect(new URL(LOGIN_URL, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/folder/:path*'],
};
