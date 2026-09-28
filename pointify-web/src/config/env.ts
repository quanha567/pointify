import { z } from 'zod';

const envSchema = z.object({
  VITE_API_URL: z.url().min(1, 'Api URL is required'),
  VITE_FIREBASE_API_KEY: z.string().min(1, 'Firebase API key is required'),
  VITE_FIREBASE_AUTH_DOMAIN: z.string().min(1, 'Firebase Auth Domain is required'),
  VITE_FIREBASE_PROJECT_ID: z.string().min(1, 'Firebase Project ID is required'),
  VITE_FIREBASE_STORAGE_BUCKET: z.string().min(1, 'Firebase Storage Bucket is required'),
  VITE_FIREBASE_MESSAGING_SENDER_ID: z.string().min(1, 'Firebase Messaging Sender ID is required'),
  VITE_FIREBASE_APP_ID: z.string().min(1, 'Firebase App ID is required'),
});

function validateEnv() {
  const parsed = envSchema.safeParse(import.meta.env);

  if (!parsed.success) {
    console.error('❌ Invalid environment variables configuration:', z.treeifyError(parsed.error));

    if (import.meta.env.PROD) {
      throw new Error('Invalid environment configuration in production build.');
    }
  }

  return parsed.success ? parsed.data : envSchema.parse({});
}

export const env = validateEnv();
export type AppEnv = z.infer<typeof envSchema>;
