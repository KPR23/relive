import { Injectable } from '@nestjs/common';
import { AuthService } from '@thallesp/nestjs-better-auth';
import { TRPCError } from '@trpc/server';
import { MiddlewareOptions, TRPCMiddleware } from 'nestjs-trpc';
import type { BaseContext } from '../trpc/context.js';

@Injectable()
export class AuthMiddleware implements TRPCMiddleware {
  constructor(private readonly authService: AuthService) {}

  async use(opts: MiddlewareOptions<BaseContext>) {
    const { next, ctx } = opts;

    try {
      const session = await this.authService.api.getSession({
        headers: new Headers(ctx.req.headers as Record<string, string>),
      });

      if (session?.user && session?.session) {
        return next({
          ctx: {
            ...ctx,
            user: session.user,
            session: session.session,
          },
        }) as Promise<void>;
      }

      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Not authenticated',
      });
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Not authenticated',
      });
    }
  }
}
