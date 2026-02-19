import { AppError } from '../helpers/errors.js';

export class ShareLinkCreationFailedError extends AppError {
  readonly code = 'BAD_REQUEST';
  constructor(message = 'Failed to create share link') {
    super(message);
  }
}
