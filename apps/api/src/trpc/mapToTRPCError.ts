import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { TRPCError } from '@trpc/server';
import {
  CannotDeleteFolderWithChildrenError,
  CannotDeleteRootFolderError,
  CannotMoveFolderCreatesCycleError,
  CannotMoveFolderToSelfError,
  CannotMoveRootFolderError,
  FolderNotFoundError,
  FolderNotOwnedError,
  ParentFolderIdRequiredError,
} from '../folder/folder.errors.js';
import {
  PhotoAlreadyInFolderError,
  PhotoAlreadyInRootFolderError,
  PhotoLimitReachedError,
  PhotoMissingThumbPathError,
  PhotoNotFoundError,
  PhotoRemoveFailedError,
  ThumbnailNotFoundError,
} from '../photo/photo.errors.js';

export function mapToTRPCError(err: unknown): never {
  if (
    err instanceof PhotoNotFoundError ||
    err instanceof ThumbnailNotFoundError ||
    err instanceof FolderNotFoundError
  ) {
    throw new TRPCError({ code: 'NOT_FOUND', message: err.message });
  }
  if (err instanceof PhotoMissingThumbPathError) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: err.message,
    });
  }
  if (
    err instanceof PhotoLimitReachedError ||
    err instanceof PhotoAlreadyInFolderError ||
    err instanceof PhotoAlreadyInRootFolderError ||
    err instanceof CannotMoveFolderCreatesCycleError ||
    err instanceof CannotDeleteFolderWithChildrenError
  ) {
    throw new TRPCError({ code: 'CONFLICT', message: err.message });
  }
  if (
    err instanceof FolderNotOwnedError ||
    err instanceof CannotMoveRootFolderError ||
    err instanceof CannotDeleteRootFolderError
  ) {
    throw new TRPCError({ code: 'FORBIDDEN', message: err.message });
  }
  if (
    err instanceof ParentFolderIdRequiredError ||
    err instanceof CannotMoveFolderToSelfError
  ) {
    throw new TRPCError({ code: 'BAD_REQUEST', message: err.message });
  }
  if (err instanceof PhotoRemoveFailedError) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: err.message,
      cause: err.cause,
    });
  }
  if (err instanceof NotFoundException) {
    throw new TRPCError({ code: 'NOT_FOUND', message: err.message });
  }
  if (err instanceof ForbiddenException) {
    throw new TRPCError({ code: 'FORBIDDEN', message: err.message });
  }
  if (err instanceof ConflictException) {
    throw new TRPCError({ code: 'CONFLICT', message: err.message });
  }
  if (err instanceof BadRequestException) {
    throw new TRPCError({ code: 'BAD_REQUEST', message: err.message });
  }
  console.error('Unknown error in mapToTRPCError, rethrowing:', err);
  throw err;
}
