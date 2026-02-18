import { AppError } from '../helpers/errors.js';

export class UserNotFoundError extends AppError {
  readonly code = 'NOT_FOUND';
  constructor(message = 'User not found') {
    super(message);
  }
}
