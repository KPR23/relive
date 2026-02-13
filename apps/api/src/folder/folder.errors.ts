export class FolderNotFoundError extends Error {
  constructor(message = 'Folder not found') {
    super(message);
    this.name = 'FolderNotFoundError';
  }
}

export class FolderNotOwnedError extends Error {
  constructor(message = 'Folder not owned by user') {
    super(message);
    this.name = 'FolderNotOwnedError';
  }
}

export class ParentFolderIdRequiredError extends Error {
  constructor(message = 'Parent folder ID not provided') {
    super(message);
    this.name = 'ParentFolderIdRequiredError';
  }
}

export class CannotMoveFolderToSelfError extends Error {
  constructor(message = 'Cannot move this folder') {
    super(message);
    this.name = 'CannotMoveFolderToSelfError';
  }
}

export class CannotMoveRootFolderError extends Error {
  constructor(message = 'Cannot move root folder') {
    super(message);
    this.name = 'CannotMoveRootFolderError';
  }
}

export class CannotMoveFolderCreatesCycleError extends Error {
  constructor(message = 'Cannot move this folder') {
    super(message);
    this.name = 'CannotMoveFolderCreatesCycleError';
  }
}

export class CannotDeleteRootFolderError extends Error {
  constructor(message = 'Cannot delete root folder') {
    super(message);
    this.name = 'CannotDeleteRootFolderError';
  }
}

export class CannotDeleteFolderWithChildrenError extends Error {
  constructor(message = 'Cannot delete folder with children') {
    super(message);
    this.name = 'CannotDeleteFolderWithChildrenError';
  }
}
