import { createRemoteJWKSet, jwtVerify } from 'jose';
import { NextRequest, NextResponse } from 'next/server';
import { JWT_COOKIE_NAME, LOGIN_URL, PUBLIC_ROUTES } from './lib/constants';

let jwksCache: ReturnType<typeof createRemoteJWKSet> | null = null;

function getJWKS(apiUrl: string) {
  if (!jwksCache) {
    jwksCache = createRemoteJWKSet(new URL(`${apiUrl}/api/auth/jwks`));
  }
  return jwksCache;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    PUBLIC_ROUTES.some(
      (route) => pathname === route || pathname.startsWith(`${route}/`),
    )
  ) {
    return NextResponse.next();
  }

  const jwtToken = request.cookies.get(JWT_COOKIE_NAME)?.value;

  if (!jwtToken) {
    return NextResponse.redirect(new URL(LOGIN_URL, request.url));
  }

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const JWKS = getJWKS(apiUrl);

    const { payload } = await jwtVerify(jwtToken, JWKS, {
      issuer: appUrl,
      audience: appUrl,
    });

    if (!payload.sub) {
      return NextResponse.redirect(new URL(LOGIN_URL, request.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.error('JWT verification failed:', error);

    const response = NextResponse.redirect(new URL(LOGIN_URL, request.url));
    response.cookies.delete(JWT_COOKIE_NAME);

    jwksCache = null;

    return response;
  }
}

export const config = {
  matcher: ['/', '/folder/:path*'],
};
