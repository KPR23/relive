'use client';

import { redirect } from 'next/navigation';

export default function Home() {
  return (
    <div>
      <h1>Relive</h1>
      <button
        className="flex cursor-pointer rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-600"
        onClick={() => redirect('/home')}
      >
        Home folder
      </button>
    </div>
  );
}
