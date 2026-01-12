import { Injectable } from '@nestjs/common';
import { ContextOptions, TRPCContext } from 'nestjs-trpc';
import { Request, Response } from 'express';
import * as schema from '../db/schema';

export interface BaseContext extends Record<string, unknown> {
  req: Request;
  res: Response;
}

export interface AuthContext extends BaseContext {
  user: typeof schema.user.$inferSelect;
  session: typeof schema.session.$inferSelect;
}

@Injectable()
export class AppContext implements TRPCContext {
  create(opts: ContextOptions): BaseContext {
    return {
      req: opts.req as Request,
      res: opts.res as Response,
    };
  }
}
