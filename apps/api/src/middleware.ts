import { TRPCMiddleware, MiddlewareOptions } from 'nestjs-trpc';
import { Injectable } from '@nestjs/common';
import { AuthService } from '@thallesp/nestjs-better-auth';
import { TRPCError } from '@trpc/server';

@Injectable()
export class AuthMiddleware implements TRPCMiddleware {
  constructor(private readonly authService: AuthService) {}

  async use(opts: MiddlewareOptions<{ req: any; res: any }>) {
    const { next, ctx } = opts;

    try {
      const session = await this.authService.api.getSession({
        headers: ctx.req.headers,
      });

      if (session?.user && session?.session) {
        return next({
          ctx: {
            ...ctx,
            user: session.user,
            session: session.session,
          },
        });
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
