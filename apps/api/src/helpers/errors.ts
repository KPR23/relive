import { TRPC_ERROR_CODE_KEY } from '@trpc/server/rpc';

export abstract class AppError extends Error {
  public abstract readonly code: TRPC_ERROR_CODE_KEY;
  public readonly cause?: unknown;

  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = this.constructor.name;
    this.cause = cause;

    Object.setPrototypeOf(this, new.target.prototype);
  }
}
