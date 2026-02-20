import { AppError } from '../helpers/errors.js';

export class ShareLinkCreationFailedError extends AppError {
  readonly code = 'BAD_REQUEST';
  constructor(message = 'Failed to create share link') {
    super(message);
  }
}

export class ShareLinkPasswordInvalidError extends AppError {
  readonly code = 'BAD_REQUEST';
  constructor(message = 'Invalid password') {
    super(message);
  }
}

export class ShareLinkNotFoundError extends AppError {
  readonly code = 'NOT_FOUND';
  constructor(message = 'Share link not found') {
    super(message);
  }
}

export class ShareLinkExpiredError extends AppError {
  readonly code = 'BAD_REQUEST';
  constructor(message = 'Share link expired') {
    super(message);
  }
}

export class ShareLinkNotOwnedByUserError extends AppError {
  readonly code = 'BAD_REQUEST';
  constructor(message = 'Share link not owned by user') {
    super(message);
  }
}

export class ShareLinkPasswordRequiredError extends AppError {
  readonly code = 'BAD_REQUEST';
  constructor(message = 'Share link password required') {
    super(message);
  }
}
