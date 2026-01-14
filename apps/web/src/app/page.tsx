'use client';

import { redirect } from 'next/navigation';

export default function Home() {
  return (
    <div>
      <h1>Relive</h1>
'use client';

import { useRouter } from 'next/navigation';
import { trpc } from '../trpc/client';

export default function Home() {
  const router = useRouter();
  const mutation = trpc.photo.requestUpload.useMutation();

  return (
    <div>
      <h1>Relive</h1>
      <button
        className="flex cursor-pointer rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-600"
        onClick={() => router.push('/home')}
      >
        Home folder
      </button>
    </div>
  );
}
    </div>
  );
}
