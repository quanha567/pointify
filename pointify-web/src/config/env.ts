import { z } from 'zod';

const envSchema = z.object({
  VITE_API_URL: z.string().url().default('http://localhost:3000'),
  VITE_FIREBASE_API_KEY: z
    .string()
    .min(1, 'Firebase API key is required')
    .default('demo-pointify-key'),
  VITE_FIREBASE_AUTH_DOMAIN: z.string().min(1).default('pointify-app.firebaseapp.com'),
  VITE_FIREBASE_PROJECT_ID: z.string().min(1).default('pointify-app'),
  VITE_FIREBASE_STORAGE_BUCKET: z.string().min(1).default('pointify-app.appspot.com'),
  VITE_FIREBASE_MESSAGING_SENDER_ID: z.string().min(1).default('1234567890'),
  VITE_FIREBASE_APP_ID: z.string().min(1).default('1:1234567890:web:abcdef123456'),
});

function validateEnv() {
  const parsed = envSchema.safeParse(import.meta.env);

  if (!parsed.success) {
    console.error('❌ Invalid environment variables configuration:', parsed.error.format());
    if (import.meta.env.PROD) {
      throw new Error('Invalid environment configuration in production build.');
    }
  }

  return parsed.success ? parsed.data : envSchema.parse({});
}

export const env = validateEnv();
export type AppEnv = z.infer<typeof envSchema>;
