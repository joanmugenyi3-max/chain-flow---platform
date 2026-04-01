import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export interface JwtPayload {
  sub: string;         // userId
  email: string;
  organizationId: string;
  role: string;
  sessionId: string;
  iat?: number;
  exp?: number;
}

export interface AuthenticatedUser extends JwtPayload {
  id: string;
}

/**
 * Parameter decorator that extracts the current authenticated user
 * from the request object.
 *
 * Usage:
 *   @Get('me')
 *   getProfile(@CurrentUser() user: AuthenticatedUser) { ... }
 *
 *   @Get('me')
 *   getEmail(@CurrentUser('email') email: string) { ... }
 */
export const CurrentUser = createParamDecorator(
  (field: keyof AuthenticatedUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const user = request.user as AuthenticatedUser;

    if (!user) return null;

    // Normalize: expose both `id` and `sub` for convenience
    const normalized: AuthenticatedUser = {
      ...user,
      id: user.sub ?? (user as any).id,
    };

    return field ? normalized[field] : normalized;
  },
);
