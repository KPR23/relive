import { passkeyClient } from '@better-auth/passkey/client';
import { jwtClient } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';
import { env } from '../../env.client';
import { JWT_COOKIE_NAME } from '../constants';

export const authClient = createAuthClient({
  baseURL: env.NEXT_PUBLIC_APP_URL,
  plugins: [passkeyClient(), jwtClient()],
  fetchOptions: {
    credentials: 'include',
  },
});

export async function fetchAndStoreJWT(): Promise<string | null> {
  try {
    const { data, error } = await authClient.token();

    if (error || !data?.token) {
      console.error('Failed to fetch JWT token:', error);
      return null;
    }

    const maxAge = 15 * 60;
    document.cookie = `${JWT_COOKIE_NAME}=${data.token}; path=/; max-age=${maxAge}; SameSite=Lax`;

    return data.token;
  } catch (error) {
    console.error('Error fetching JWT:', error);
    return null;
  }
}

export function clearJWTCookie() {
  document.cookie = `${JWT_COOKIE_NAME}=; path=/; max-age=0`;
}

export const signInWithGitHub = async () => {
  await authClient.signIn.social({
    provider: 'github',
    callbackURL: env.NEXT_PUBLIC_APP_URL,
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
      async onSuccess() {
        await fetchAndStoreJWT();
        window.location.href = '/';
      },
      onError(context) {
        console.error('Authentication failed:', context.error.message);
      },
    },
  });

  return { data, error };
};

export const { signIn, signUp, useSession } = authClient;

export const signOut = async () => {
  clearJWTCookie();
  return authClient.signOut();
};
