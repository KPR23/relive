import { passkey } from '@better-auth/passkey';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '../db/index.js';
import * as schema from '../db/schema.js';
import { env } from '../env.server.js';

const isProduction = env.NODE_ENV === 'production';

export const auth = betterAuth({
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.FRONTEND_URL,
  trustedOrigins: [env.FRONTEND_URL],
  trustedProxyHeaders: true,
  callbacks: {
    redirect: () => env.FRONTEND_URL,
  },
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema,
  }),
  emailAndPassword: {
    enabled: true,
    // requireEmailVerification: true,
    minPasswordLength: 8,
  },
  plugins: [passkey()],
  advanced: isProduction
    ? {
        defaultCookieAttributes: {
          sameSite: 'none',
          secure: true,
        },
        ...(env.COOKIE_DOMAIN || env.FRONTEND_URL.includes('vercel.app')
          ? {
              crossSubDomainCookies: {
                enabled: true,
                domain: env.COOKIE_DOMAIN ?? '.vercel.app',
              },
            }
          : {}),
      }
    : undefined,
  socialProviders: {
    github: {
      clientId: env.GITHUB_CLIENT_ID as string,
      clientSecret: env.GITHUB_CLIENT_SECRET as string,
    },
    google: {
      clientId: env.GOOGLE_CLIENT_ID as string,
      clientSecret: env.GOOGLE_CLIENT_SECRET as string,
    },
  },
});
