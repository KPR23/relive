import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL'),

  // Better Auth
  BETTER_AUTH_SECRET: z
    .string()
    .min(32, 'BETTER_AUTH_SECRET must be at least 32 characters'),

  // GitHub OAuth
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),

  // Frontend
  FRONTEND_URL: z.string().url().optional().default('http://localhost:3000'),

  // Server
  PORT: z.coerce.number().optional().default(8000),
});

export type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error('❌ Invalid environment variables:');
    for (const issue of result.error.issues) {
      console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
    }
    process.exit(1);
  }

  if (
    (result.data.GITHUB_CLIENT_ID && !result.data.GITHUB_CLIENT_SECRET) ||
    (!result.data.GITHUB_CLIENT_ID && result.data.GITHUB_CLIENT_SECRET)
  ) {
    console.error(
      '❌ Both GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET must be set together',
    );
    process.exit(1);
  }

  console.log('✅ Environment variables validated successfully');
  return result.data;
}

export const env = validateEnv();
