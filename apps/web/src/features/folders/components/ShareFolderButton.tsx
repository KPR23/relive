'use client';

import { useState } from 'react';
import {
  useListFolderShares,
  useRevokeFolderShare,
  useShareFolderWithUser,
} from '../hooks';
import {
  useCreateFolderShareLink,
  useListFolderShareLinks,
  useRevokeShareLink,
} from '@/src/features/share-link/hooks';
import { Icon } from '@iconify-icon/react';
import { toast } from 'sonner';
import { env } from '@/src/env.client';

interface ShareFolderButtonProps {
  folderId: string;
}

const PERMISSIONS = [
  { value: 'VIEW', label: 'View' },
  { value: 'EDIT', label: 'Edit' },
] as const;

const EXPIRATION_OPTIONS = [
  { value: '7', label: '7 days' },
  { value: '30', label: '30 days' },
  { value: '365', label: '1 year' },
  { value: 'never', label: 'Never expires' },
  { value: 'custom', label: 'Custom date' },
] as const;

function getExpiresAt(daysOrNever: string, customDate?: string): Date {
  if (daysOrNever === 'never') {
    return new Date('2099-12-31');
  }
  if (daysOrNever === 'custom' && customDate) {
    return new Date(customDate);
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
  const revokeFolderShare = useRevokeFolderShare();
  const createFolderShareLink = useCreateFolderShareLink();
  const revokeShareLink = useRevokeShareLink();
  const { data: shares, isLoading: isSharesLoading } =
    useListFolderShares(folderId);
  const { data: shareLinks, isLoading: isShareLinksLoading } =
    useListFolderShareLinks(folderId);
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState<'VIEW' | 'EDIT'>('VIEW');
  const [expiresIn, setExpiresIn] = useState<string>('365');
  const [linkPermission, setLinkPermission] = useState<'VIEW' | 'EDIT'>('VIEW');
  const [linkExpiresIn, setLinkExpiresIn] = useState<string>('365');
  const [customExpiresAt, setCustomExpiresAt] = useState<string>('');
  const [linkCustomExpiresAt, setLinkCustomExpiresAt] = useState<string>('');
  const [linkPassword, setLinkPassword] = useState('');
  const [createdLink, setCreatedLink] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    if (expiresIn === 'custom' && !customExpiresAt.trim()) return;
    shareFolder.mutate(
      {
        folderId,
        targetUserEmail: email.trim(),
        permission,
        expiresAt: getExpiresAt(expiresIn, customExpiresAt),
      },
      {
        onSuccess: () => {
          setEmail('');
          setPermission('VIEW');
          setExpiresIn('365');
          setCustomExpiresAt('');
        },
      },
    );
  };

  const handleCreateLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (linkExpiresIn === 'custom' && !linkCustomExpiresAt.trim()) return;
    setCreatedLink(null);
    createFolderShareLink.mutate(
      {
        folderId,
        permission: linkPermission,
        expiresAt: getExpiresAt(linkExpiresIn, linkCustomExpiresAt),
        password: linkPassword.trim() || undefined,
      },
      {
        onSuccess: (data) => {
          const base =
            env.NEXT_PUBLIC_APP_URL?.toString() ??
            (typeof window !== 'undefined' ? window.location.origin : '');
          const url = `${base}/shared/${data.token}`;
          setCreatedLink(url);
          setLinkCustomExpiresAt('');
        },
      },
    );
  };

  const copyLink = () => {
    if (createdLink) {
      void navigator.clipboard.writeText(createdLink).then(() => {
        toast.success('Link copied');
      });
    }
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
        Share folder
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
            aria-label="Share folder"
            className="absolute top-full right-0 z-50 mt-2 w-80 rounded-xl border border-amber-700/30 bg-amber-950/95 p-4 shadow-xl backdrop-blur-sm dark:border-amber-600/20 dark:bg-amber-950/90"
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-amber-100">
                Share folder
              </h3>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded p-1 text-amber-400/70 transition-colors hover:bg-amber-800/30 hover:text-amber-200"
                aria-label="Close"
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
                  User email
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
                  Permission
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
                  Access expiration
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
              {expiresIn === 'custom' && (
                <input
                  type="datetime-local"
                  min={new Date().toISOString().slice(0, 16)}
                  value={customExpiresAt}
                  onChange={(e) => setCustomExpiresAt(e.target.value)}
                  required={expiresIn === 'custom'}
                  className="w-full rounded-lg border border-amber-700/40 bg-amber-900/30 px-3 py-2 text-sm text-amber-100 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 focus:outline-none dark:border-amber-600/30 dark:bg-amber-900/20"
                />
              )}
              <button
                type="submit"
                disabled={
                  shareFolder.isPending ||
                  !email.trim() ||
                  (expiresIn === 'custom' && !customExpiresAt.trim())
                }
                className="w-full rounded-lg bg-amber-700 px-3 py-2 text-sm font-medium text-amber-50 transition-colors hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {shareFolder.isPending ? 'Sharing...' : 'Share'}
              </button>
            </form>

            {shareFolder.isError && (
              <p className="mt-2 text-xs text-red-400">
                {shareFolder.error?.message ?? 'An error occurred'}
              </p>
            )}

            <div className="mt-4 border-t border-amber-700/30 pt-3">
              <h4 className="mb-2 text-xs font-medium text-amber-300/90">
                Share via link
              </h4>
              <form onSubmit={handleCreateLink} className="space-y-2">
                <select
                  value={linkPermission}
                  onChange={(e) =>
                    setLinkPermission(e.target.value as 'VIEW' | 'EDIT')
                  }
                  className="w-full rounded-lg border border-amber-700/40 bg-amber-900/30 px-3 py-2 text-sm text-amber-100 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 focus:outline-none dark:border-amber-600/30 dark:bg-amber-900/20"
                >
                  {PERMISSIONS.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
                <select
                  value={linkExpiresIn}
                  onChange={(e) => setLinkExpiresIn(e.target.value)}
                  className="w-full rounded-lg border border-amber-700/40 bg-amber-900/30 px-3 py-2 text-sm text-amber-100 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 focus:outline-none dark:border-amber-600/30 dark:bg-amber-900/20"
                >
                  {EXPIRATION_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                {linkExpiresIn === 'custom' && (
                  <input
                    type="datetime-local"
                    min={new Date().toISOString().slice(0, 16)}
                    value={linkCustomExpiresAt}
                    onChange={(e) => setLinkCustomExpiresAt(e.target.value)}
                    required={linkExpiresIn === 'custom'}
                    className="w-full rounded-lg border border-amber-700/40 bg-amber-900/30 px-3 py-2 text-sm text-amber-100 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 focus:outline-none dark:border-amber-600/30 dark:bg-amber-900/20"
                  />
                )}
                <input
                  type="password"
                  value={linkPassword}
                  onChange={(e) => setLinkPassword(e.target.value)}
                  placeholder="Password (optional)"
                  className="w-full rounded-lg border border-amber-700/40 bg-amber-900/30 px-3 py-2 text-sm text-amber-100 placeholder-amber-500/60 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 focus:outline-none dark:border-amber-600/30 dark:bg-amber-900/20"
                />
                <button
                  type="submit"
                  disabled={
                    createFolderShareLink.isPending ||
                    (linkExpiresIn === 'custom' && !linkCustomExpiresAt.trim())
                  }
                  className="w-full rounded-lg bg-amber-600 px-3 py-2 text-sm font-medium text-amber-50 transition-colors hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {createFolderShareLink.isPending
                    ? 'Creating...'
                    : 'Create link'}
                </button>
              </form>
              {createFolderShareLink.isError && (
                <p className="mt-1 text-xs text-red-400">
                  {createFolderShareLink.error?.message ?? 'An error occurred'}
                </p>
              )}
              {createdLink && (
                <div className="mt-2 flex gap-1">
                  <input
                    type="text"
                    readOnly
                    value={createdLink}
                    className="flex-1 rounded-lg border border-amber-700/40 bg-amber-900/30 px-2 py-1.5 text-xs text-amber-100"
                  />
                  <button
                    type="button"
                    onClick={copyLink}
                    className="rounded-lg bg-amber-700 px-2 py-1.5 text-xs text-amber-100 hover:bg-amber-600"
                  >
                    Copy
                  </button>
                </div>
              )}

              {isShareLinksLoading && (
                <p className="mt-2 text-xs text-amber-500/70">
                  Loading links...
                </p>
              )}
              {!isShareLinksLoading && shareLinks && shareLinks.length > 0 && (
                <div className="mt-3">
                  <h4 className="mb-2 text-xs font-medium text-amber-300/90">
                    Share links
                  </h4>
                  <ul className="space-y-1.5">
                    {shareLinks.map((link) => {
                      const linkUrl =
                        typeof window !== 'undefined'
                          ? `${window.location.origin}/s/${link.token}`
                          : `/s/${link.token}`;
                      const isRevoked = !!link.revokedAt;
                      const isExpired =
                        link.expiresAt &&
                        new Date(link.expiresAt).getTime() < Date.now();
                      const status = isRevoked
                        ? 'Revoked'
                        : isExpired
                          ? 'Expired'
                          : 'Active';
                      return (
                        <li
                          key={link.id}
                          className="flex items-center justify-between gap-2 rounded-lg border border-amber-700/20 bg-amber-900/20 px-2 py-1.5 text-xs"
                        >
                          <div className="min-w-0 flex-1">
                            <span className="block truncate text-amber-200">
                              ...{link.token.slice(-8)}
                            </span>
                            <span className="text-amber-400/80">
                              {link.permission} · {status}
                              {link.hasPassword && ' · 🔒'}
                            </span>
                          </div>
                          <div className="flex shrink-0 gap-1">
                            {!isRevoked && (
                              <button
                                type="button"
                                onClick={() => {
                                  void navigator.clipboard.writeText(linkUrl);
                                  toast.success('Link copied');
                                }}
                                className="rounded px-2 py-0.5 text-amber-300 hover:bg-amber-800/40"
                              >
                                Copy
                              </button>
                            )}
                            {!isRevoked && (
                              <button
                                type="button"
                                onClick={() =>
                                  revokeShareLink.mutate({ token: link.token })
                                }
                                disabled={revokeShareLink.isPending}
                                className="rounded px-2 py-0.5 text-red-400 hover:bg-red-900/30 disabled:opacity-50"
                                aria-label="Revoke link"
                              >
                                Revoke
                              </button>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>

            {shares && shares.length > 0 && (
              <div className="mt-4 border-t border-amber-700/30 pt-3">
                <h4 className="mb-2 text-xs font-medium text-amber-300/90">
                  Shared with
                </h4>
                <ul className="space-y-1.5">
                  {shares.map((share) => (
                    <li
                      key={share.id}
                      className="flex items-center justify-between gap-2 text-sm text-amber-200/90"
                    >
                      <div className="flex min-w-0 flex-1 items-center gap-2">
                        <span className="truncate">
                          {share.sharedWithEmail}
                        </span>
                        <span className="shrink-0 rounded bg-amber-800/40 px-2 py-0.5 text-xs text-amber-300">
                          {share.permission === 'EDIT' ? 'Edit' : 'View'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          revokeFolderShare.mutate({
                            folderId,
                            targetUserId: share.sharedWithId,
                          })
                        }
                        disabled={revokeFolderShare.isPending}
                        className="shrink-0 rounded px-2 py-0.5 text-red-400 transition-colors hover:bg-red-900/30 disabled:opacity-50"
                        aria-label={`Revoke share for ${share.sharedWithEmail}`}
                      >
                        Revoke
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {!isSharesLoading && shares?.length === 0 && (
              <p className="mt-3 text-xs text-amber-500/70">
                This folder is not shared yet.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
