import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import * as schema from './db/schema.js';
import { env } from './env.server.js';
import { db } from './db/index.js';

export const auth = betterAuth({
  secret: env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema,
  }),
  emailAndPassword: {
    enabled: true,
    // requireEmailVerification: true,
    minPasswordLength: 8,
  },
  callbacks: {
    async redirect() {
      return env.FRONTEND_URL;
    },
  },
  cookies: {
    session: {
      sameSite: 'none',
      secure: true,
    },
  },
  trustedOrigins: [env.FRONTEND_URL],
  ...(env.GITHUB_CLIENT_ID &&
    env.GITHUB_CLIENT_SECRET && {
      socialProviders: {
        github: {
          clientId: env.GITHUB_CLIENT_ID,
          clientSecret: env.GITHUB_CLIENT_SECRET,
        },
      },
    }),
});
