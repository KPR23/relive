'use client';

import {
  signInWithGitHub,
  signInWithPasskey,
  signIn,
  useSession,
  signInWithGoogle,
} from '@/src/lib/auth/auth-client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const session = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (session.data) {
      router.push('/');
    }
  }, [session.data, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await signIn.email({
        email,
        password,
      });

      if (result.error) {
        setError(result.error.message || 'Login failed');
      } else {
        router.push('/');
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextStep = () => {
    if (email.length > 0) {
      setIsPasswordVisible(true);
    } else {
      setError('Please enter your email');
    }
  };

  const handleSwitchAccount = () => {
    setPassword('');
    setIsPasswordVisible(false);
    setError('');
  };

  return (
    <div className="bg-bg grid h-screen grid-cols-3 gap-5 p-5">
      <div className="bg-off-white col-span-2 flex flex-col items-center justify-center rounded-xl">
        <div className="flex flex-col justify-center gap-12">
          <header className="gap flex flex-col gap-1">
            <h1 className="text-4xl font-medium">Welcome back</h1>
            <p className="text-text-secondary text-xl">
              Log in to your account to access your photos
            </p>
          </header>

          <div>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="email"
                  className="text-text-main text-sm font-normal"
                >
                  E-mail
                </label>
                <div className="relative flex items-center">
                  <input
                    type="email"
                    placeholder="Enter your e-mail"
                    value={email}
                    disabled={isPasswordVisible}
                    onChange={(e) => setEmail(e.target.value)}
                    autoFocus
                    className="border-gray error:border-red-500 disabled:text-gray placeholder:text-text-secondary relative flex-1 rounded-lg border px-3 py-2 pr-16 text-sm"
                  />
                  {isPasswordVisible && (
                    <button
                      className="text-primary absolute top-1/2 right-3 flex h-7 -translate-y-1/2 cursor-pointer items-center bg-transparent text-xs font-medium"
                      onClick={handleSwitchAccount}
                    >
                      Switch
                    </button>
                  )}
                </div>
              </div>
              {isPasswordVisible && (
                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="password"
                    className="text-text-main text-sm font-normal"
                  >
                    Password
                  </label>
                  <input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    autoFocus={isPasswordVisible}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border-gray placeholder:text-text-secondary rounded-lg border px-3 py-2 text-sm"
                  />
                  {error && (
                    <p className="text-xs font-medium text-red-500">{error}</p>
                  )}
                </div>
              )}
              <button
                onClick={isPasswordVisible ? handleSubmit : handleNextStep}
                className="bg-primary disabled:bg-gray w-full cursor-pointer rounded-lg px-3 py-2 text-sm text-white"
                disabled={
                  !isPasswordVisible ? email.length <= 0 : password.length <= 0
                }
              >
                {isPasswordVisible
                  ? isLoading
                    ? 'Logging in...'
                    : 'Log in'
                  : 'Continue'}
              </button>
            </div>
          </div>
        </div>
        <button
          className="bg-primary rounded-md px-4 py-2 text-white"
          onClick={() => signInWithGitHub()}
        >
          Sign in with GitHub
        </button>
        <button
          className="bg-primary rounded-md px-4 py-2 text-blue-500"
          onClick={() => signInWithGoogle()}
        >
          Sign in with Google
        </button>
        <button
          className="bg-primary rounded-md px-4 py-2 text-white"
          onClick={() => signInWithPasskey()}
        >
          Sign in with passkey
        </button>
      </div>
      <div className="bg-text-main rounded-xl">2</div>
    </div>
  );
}
