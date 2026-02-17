import { AppError } from '../helpers/errors.js';

export class PhotoNotFoundError extends AppError {
  readonly code = 'NOT_FOUND';
  constructor(message = 'Photo not found') {
    super(message);
  }
}

export class ThumbnailNotFoundError extends AppError {
  readonly code = 'NOT_FOUND';
  constructor(message = 'Thumbnail not found') {
    super(message);
  }
}

export class PhotoLimitReachedError extends AppError {
  readonly code = 'CONFLICT';
  constructor(message = 'User has reached the photo limit') {
    super(message);
  }
}

export class PhotoAlreadyInFolderError extends AppError {
  readonly code = 'CONFLICT';
  constructor(message = 'Photo already in this folder') {
    super(message);
  }
}

export class PhotoAlreadyInRootFolderError extends AppError {
  readonly code = 'CONFLICT';
  constructor(message = 'Photo is already in root folder') {
    super(message);
  }
}

export class PhotoMissingThumbPathError extends AppError {
  readonly code = 'INTERNAL_SERVER_ERROR';
  constructor(photoId: string) {
    super(`READY photo ${photoId} is missing thumbPath`);
  }
}

export class PhotoAlreadySharedWithUserError extends AppError {
  readonly code = 'CONFLICT';
  constructor(message = 'This photo is already shared with this user') {
    super(message);
  }
}

export class PhotoCannotShareWithSelfError extends AppError {
  readonly code = 'BAD_REQUEST';
  constructor(message = 'Cannot share photo with yourself') {
    super(message);
  }
}

export class PhotoRemoveFailedError extends AppError {
  readonly code = 'INTERNAL_SERVER_ERROR';
  constructor(message = 'Failed to remove photo', cause?: unknown) {
    super(message, { cause });
  }
}

export class PhotoUploadConfirmFailedError extends AppError {
  readonly code = 'INTERNAL_SERVER_ERROR';
  constructor(cause?: unknown) {
    super(`Failed to confirm photo upload`, cause);
  }
}

export class PhotoShareNotFoundError extends AppError {
  readonly code = 'NOT_FOUND';
  constructor(message = 'Photo share not found') {
    super(message);
  }
}

export class PhotoNotOwnedByUserError extends AppError {
  readonly code = 'FORBIDDEN';
  constructor(message = 'Photo is not owned by the user') {
    super(message);
  }
}

export class UserNotFoundError extends AppError {
  readonly code = 'NOT_FOUND';
  constructor(message = 'User not found') {
    super(message);
  }
}
