'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { useGetSharedContent } from '@/src/features/share-link/hooks';

import Link from 'next/link';
import { SharedContent } from '@/src/features/share-link/SharedContent';

export default function SharedPage() {
  const params = useParams<{ token: string }>();
  const token = params?.token ?? '';
  const [password, setPassword] = useState<string | undefined>();

  const { data, isLoading, error } = useGetSharedContent(token, password);

  useEffect(() => {
    if (error) {
      setPassword(undefined);
      if (error.message === 'Invalid password') {
        toast.error('Invalid password');
      }
    }
  }, [error]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950">
        <p className="text-amber-200">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-950 p-4">
        <p className="text-center text-red-400">
          {error.message ?? 'Shared content not found'}
        </p>
        <Link
          href="/"
          className="rounded-lg bg-amber-700 px-4 py-2 text-amber-100 hover:bg-amber-600"
        >
          Home
        </Link>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950">
        <p className="text-amber-200">No data</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="mx-auto max-w-4xl p-4">
        <SharedContent
          data={data}
          token={token}
          onPasswordSubmit={setPassword}
        />
      </div>
    </div>
  );
}
