export class PhotoNotFoundError extends Error {
  constructor(message = 'Photo not found') {
    super(message);
    this.name = 'PhotoNotFoundError';
  }
}

export class ThumbnailNotFoundError extends Error {
  constructor(message = 'Thumbnail not found') {
    super(message);
    this.name = 'ThumbnailNotFoundError';
  }
}

export class PhotoLimitReachedError extends Error {
  constructor(message = 'User has reached the photo limit') {
    super(message);
    this.name = 'PhotoLimitReachedError';
  }
}

export class PhotoAlreadyInFolderError extends Error {
  constructor(message = 'Photo already in this folder') {
    super(message);
    this.name = 'PhotoAlreadyInFolderError';
  }
}

export class PhotoAlreadyInRootFolderError extends Error {
  constructor(message = 'Photo is already in root folder') {
    super(message);
    this.name = 'PhotoAlreadyInRootFolderError';
  }
}

export class PhotoMissingThumbPathError extends Error {
  constructor(photoId: string) {
    super(`READY photo ${photoId} is missing thumbPath`);
    this.name = 'PhotoMissingThumbPathError';
  }
}

export class PhotoRemoveFailedError extends Error {
  constructor(message = 'Failed to remove photo', cause?: unknown) {
    super(message, cause instanceof Error ? { cause } : undefined);
    this.name = 'PhotoRemoveFailedError';
  }
}
