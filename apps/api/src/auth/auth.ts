import { passkey } from '@better-auth/passkey';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '../db/index.js';
import * as schema from '../db/schema.js';
import { env } from '../env.server.js';

export const auth = betterAuth({
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.FRONTEND_URL,
  trustedOrigins: [env.FRONTEND_URL],
  advanced: {
    storeStateStrategy: 'database',
    defaultCookieAttributes: (() => {
      const isHttps = env.FRONTEND_URL.startsWith('https');
      return {
        sameSite: (isHttps ? 'none' : 'lax') as 'none' | 'lax',
        secure: isHttps,
      };
    })(),
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
