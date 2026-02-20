import { AppError } from '../helpers/errors.js';

export class FolderNotFoundError extends AppError {
  readonly code = 'NOT_FOUND';
  constructor(message = 'Folder not found') {
    super(message);
  }
}

export class FolderNotOwnedError extends AppError {
  readonly code = 'FORBIDDEN';
  constructor(message = 'Folder not owned by user') {
    super(message);
  }
}

export class FolderCannotShareWithSelfError extends AppError {
  readonly code = 'BAD_REQUEST';
  constructor(message = 'Cannot share folder with yourself') {
    super(message);
  }
}

export class CannotShareRootFolderError extends AppError {
  readonly code = 'FORBIDDEN';
  constructor(message = 'Cannot share root folder') {
    super(message);
  }
}

export class FolderAlreadySharedWithUserError extends AppError {
  readonly code = 'CONFLICT';
  constructor(message = 'Folder already shared with this user') {
    super(message);
  }
}

export class ParentFolderIdRequiredError extends AppError {
  readonly code = 'BAD_REQUEST';
  constructor(message = 'Parent folder ID not provided') {
    super(message);
  }
}

export class CannotMoveFolderToSelfError extends AppError {
  readonly code = 'BAD_REQUEST';
  constructor(message = 'Cannot move this folder to itself') {
    super(message);
  }
}

export class CannotMoveRootFolderError extends AppError {
  readonly code = 'FORBIDDEN';
  constructor(message = 'Cannot move root folder') {
    super(message);
  }
}

export class CannotMoveFolderCreatesCycleError extends AppError {
  readonly code = 'CONFLICT';
  constructor(message = 'Moving this folder would create a cycle') {
    super(message);
  }
}

export class CannotDeleteRootFolderError extends AppError {
  readonly code = 'FORBIDDEN';
  constructor(message = 'Cannot delete root folder') {
    super(message);
  }
}

export class CannotDeleteFolderWithChildrenError extends AppError {
  readonly code = 'CONFLICT';
  constructor(message = 'Cannot delete folder with children') {
    super(message);
  }
}

export class FolderShareNotFoundError extends AppError {
  readonly code = 'NOT_FOUND';
  constructor(message = 'Folder share not found') {
    super(message);
  }
}
