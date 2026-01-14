import { z } from 'zod';

const envSchema = z.object({
  STORAGE_HOSTNAME: z.string().min(1).optional().default('localhost'),
  API_URL: z.string().url().optional().default('http://localhost:8000'),
  TRPC_URL: z.string().optional().default('http://localhost:8000/api/trpc'),

  NEXT_PUBLIC_TRPC_URL: z
    .string()
    .optional()
    .default('http://localhost:8000/api/trpc'),
  NEXT_PUBLIC_API_URL: z.string().optional().default('http://localhost:8000'),
  NEXT_PUBLIC_APP_URL: z.string().optional().default('http://localhost:3000'),
});

const processEnv = {
  STORAGE_HOSTNAME: process.env.STORAGE_HOSTNAME,
  API_URL: process.env.API_URL,
  TRPC_URL: process.env.TRPC_URL,

  NEXT_PUBLIC_TRPC_URL: process.env.NEXT_PUBLIC_TRPC_URL,
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
};

const result = envSchema.safeParse(processEnv);

if (!result.success) {
  console.error('❌ Invalid frontend environment variables:');

  for (const issue of result.error.issues) {
    console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
  }

  if (typeof window === 'undefined') {
    process.exit(1);
  } else {
    throw new Error('Invalid frontend environment variables');
  }
}

export const env = result.data;
