import { SetMetadata } from '@nestjs/common';

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ORG_ADMIN = 'ORG_ADMIN',
  MANAGER = 'MANAGER',
  ANALYST = 'ANALYST',
  OPERATOR = 'OPERATOR',
  VIEWER = 'VIEWER',
}

export const ROLES_KEY = 'roles';

/**
 * Decorator to specify which roles can access a route.
 *
 * Usage:
 *   @Roles(UserRole.ORG_ADMIN, UserRole.MANAGER)
 *   @Get('sensitive-endpoint')
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
