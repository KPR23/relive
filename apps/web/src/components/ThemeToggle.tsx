'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="fixed right-4 bottom-4 z-50 rounded-full border border-gray-300 bg-gray-200 p-2 text-black dark:border-gray-700 dark:bg-gray-800 dark:text-white"
    >
      {theme === 'dark' ? '🌙' : '☀️'} Toggle Theme
    </button>
  );
}
