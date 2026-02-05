import { getSessionCookie } from 'better-auth/cookies';
import { NextRequest, NextResponse } from 'next/server';
import { env } from './env.client';
import { LOGIN_URL, PUBLIC_ROUTES } from './lib/constants';
import { Session } from './lib/types';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    PUBLIC_ROUTES.some(
      (route) => pathname === route || pathname.startsWith(`${route}/`),
    )
  ) {
    return NextResponse.next();
  }

  const sessionCookie = getSessionCookie(request);
  if (!sessionCookie) {
    return NextResponse.redirect(new URL(LOGIN_URL, request.url));
  }

  try {
    const response = await fetch(
      `${env.NEXT_PUBLIC_API_URL}/api/auth/get-session`,
      {
        headers: {
          cookie: request.headers.get('cookie') || '',
        },
        cache: 'no-store',
      },
    );

    if (!response.ok) {
      return NextResponse.redirect(new URL(LOGIN_URL, request.url));
    }

    const data: Session = await response.json();

    if (!data.session || !data.user) {
      return NextResponse.redirect(new URL(LOGIN_URL, request.url));
    }

    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL(LOGIN_URL, request.url));
  }
}

export const config = {
  matcher: ['/', '/folder/:path*'],
};
