import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  // Environment
  NODE_ENV: z.enum(['development', 'production']).default('development'),
  VERCEL: z.coerce.boolean().optional().default(false),

  // Database
  DATABASE_URL: z.url('DATABASE_URL must be a valid URL'),

  // Arcjet
  ARCJET_KEY: z
    .string()
    .startsWith('ajkey_', 'ARCJET_KEY must start with "ajkey_"'),

  // Backblaze B2
  BACKBLAZE_ENDPOINT: z.url('BACKBLAZE_ENDPOINT must be a valid URL'),
  BACKBLAZE_REGION: z.string().min(1, 'BACKBLAZE_REGION is required'),
  BACKBLAZE_BUCKET: z.string().min(1, 'BACKBLAZE_BUCKET is required'),
  BACKBLAZE_KEY_ID: z.string().min(1, 'BACKBLAZE_KEY_ID is required'),
  BACKBLAZE_ACCESS_KEY: z.string().min(1, 'BACKBLAZE_ACCESS_KEY is required'),

  // Better Auth
  BETTER_AUTH_SECRET: z
    .string()
    .min(32, 'BETTER_AUTH_SECRET must be at least 32 characters'),

  // GitHub OAuth
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),

  // Frontend
  FRONTEND_URL: z
    .url('FRONTEND_URL must be a valid URL')
    .optional()
    .default('http://localhost:3000'),

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
