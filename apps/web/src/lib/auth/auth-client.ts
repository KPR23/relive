import { passkeyClient } from '@better-auth/passkey/client';
import { createAuthClient } from 'better-auth/react';
import { env } from '../../env.client';

export const authClient = createAuthClient({
  baseURL: env.NEXT_PUBLIC_APP_URL,
  plugins: [passkeyClient()],
  fetchOptions: {
    credentials: 'include',
  },
});

export const signInWithGitHub = async () => {
  await authClient.signIn.social({
    provider: 'github',
    callbackURL: env.NEXT_PUBLIC_APP_URL,
    errorCallbackURL: '/auth-error',
  });
};

export const signInWithGoogle = async () => {
  await authClient.signIn.social({
    provider: 'google',
    callbackURL: env.NEXT_PUBLIC_APP_URL,
    errorCallbackURL: '/auth-error',
  });
};

export async function addPasskey() {
  const { data, error } = await authClient.passkey.addPasskey({
    name: 'Relive Passkey',
  });

  return { data, error };
}

export const signInWithPasskey = async () => {
  const { data, error } = await authClient.signIn.passkey({
    fetchOptions: {
      onSuccess() {
        window.location.href = '/';
      },
      onError(context) {
        console.error('Authentication failed:', context.error.message);
      },
    },
  });

  return { data, error };
};

export const { signIn, signUp, signOut, useSession } = authClient;
