'use client';

import { useState } from 'react';
import { useListFolderShares, useShareFolderWithUser } from '../hooks';
import { Icon } from '@iconify-icon/react';

interface ShareFolderButtonProps {
  folderId: string;
}

const PERMISSIONS = [
  { value: 'VIEW', label: 'Przeglądanie' },
  { value: 'EDIT', label: 'Edycja' },
] as const;

const EXPIRATION_OPTIONS = [
  { value: '7', label: '7 dni' },
  { value: '30', label: '30 dni' },
  { value: '365', label: '1 rok' },
  { value: 'never', label: 'Bez wygaśnięcia' },
] as const;

function getExpiresAt(daysOrNever: string): Date {
  if (daysOrNever === 'never') {
    return new Date('2099-12-31');
  }
  const days = parseInt(daysOrNever, 10);
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

export default function ShareFolderButton({
  folderId,
}: ShareFolderButtonProps) {
  const shareFolder = useShareFolderWithUser();
  const { data: shares, isLoading: isSharesLoading } =
    useListFolderShares(folderId);
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState<'VIEW' | 'EDIT'>('VIEW');
  const [expiresIn, setExpiresIn] = useState<string>('365');
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    shareFolder.mutate(
      {
        folderId,
        targetUserEmail: email.trim(),
        permission,
        expiresAt: getExpiresAt(expiresIn),
      },
      {
        onSuccess: () => {
          setEmail('');
          setPermission('VIEW');
          setExpiresIn('365');
        },
      },
    );
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 rounded-lg border border-amber-700/50 bg-amber-950/30 px-3 py-2 text-sm font-medium text-amber-200 transition-colors hover:bg-amber-900/40 dark:border-amber-600/40 dark:bg-amber-950/50 dark:text-amber-100 dark:hover:bg-amber-900/50"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
      >
        <Icon icon="solar:share-bold" width="18" height="18" />
        Udostępnij folder
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            aria-hidden="true"
            onClick={() => setIsOpen(false)}
          />
          <div
            role="dialog"
            aria-label="Udostępnij folder"
            className="absolute top-full right-0 z-50 mt-2 w-80 rounded-xl border border-amber-700/30 bg-amber-950/95 p-4 shadow-xl backdrop-blur-sm dark:border-amber-600/20 dark:bg-amber-950/90"
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-amber-100">
                Udostępnij folder
              </h3>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded p-1 text-amber-400/70 transition-colors hover:bg-amber-800/30 hover:text-amber-200"
                aria-label="Zamknij"
              >
                <Icon icon="solar:close-circle-bold" width="20" height="20" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label
                  htmlFor="share-email"
                  className="mb-1 block text-xs font-medium text-amber-300/90"
                >
                  Email użytkownika
                </label>
                <input
                  id="share-email"
                  type="email"
                  value={email}
                  placeholder="jan@example.com"
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-amber-700/40 bg-amber-900/30 px-3 py-2 text-sm text-amber-100 placeholder-amber-500/60 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 focus:outline-none dark:border-amber-600/30 dark:bg-amber-900/20"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="share-permission"
                  className="mb-1 block text-xs font-medium text-amber-300/90"
                >
                  Uprawnienia
                </label>
                <select
                  id="share-permission"
                  value={permission}
                  onChange={(e) =>
                    setPermission(e.target.value as 'VIEW' | 'EDIT')
                  }
                  className="w-full rounded-lg border border-amber-700/40 bg-amber-900/30 px-3 py-2 text-sm text-amber-100 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 focus:outline-none dark:border-amber-600/30 dark:bg-amber-900/20"
                >
                  {PERMISSIONS.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="share-expires"
                  className="mb-1 block text-xs font-medium text-amber-300/90"
                >
                  Wygaśnięcie dostępu
                </label>
                <select
                  id="share-expires"
                  value={expiresIn}
                  onChange={(e) => setExpiresIn(e.target.value)}
                  className="w-full rounded-lg border border-amber-700/40 bg-amber-900/30 px-3 py-2 text-sm text-amber-100 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 focus:outline-none dark:border-amber-600/30 dark:bg-amber-900/20"
                >
                  {EXPIRATION_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                disabled={shareFolder.isPending || !email.trim()}
                className="w-full rounded-lg bg-amber-700 px-3 py-2 text-sm font-medium text-amber-50 transition-colors hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {shareFolder.isPending ? 'Udostępnianie...' : 'Udostępnij'}
              </button>
            </form>

            {shareFolder.isError && (
              <p className="mt-2 text-xs text-red-400">
                {shareFolder.error?.message ?? 'Wystąpił błąd'}
              </p>
            )}

            {shares && shares.length > 0 && (
              <div className="mt-4 border-t border-amber-700/30 pt-3">
                <h4 className="mb-2 text-xs font-medium text-amber-300/90">
                  Udostępniono dla
                </h4>
                <ul className="space-y-1.5">
                  {shares.map((share) => (
                    <li
                      key={share.id}
                      className="flex items-center justify-between text-sm text-amber-200/90"
                    >
                      <span>{share.sharedWithEmail}</span>
                      <span className="rounded bg-amber-800/40 px-2 py-0.5 text-xs text-amber-300">
                        {share.permission === 'EDIT' ? 'Edycja' : 'Podgląd'}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {!isSharesLoading && shares?.length === 0 && (
              <p className="mt-3 text-xs text-amber-500/70">
                Ten folder nie jest jeszcze udostępniony.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
