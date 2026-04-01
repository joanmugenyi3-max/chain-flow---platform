import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { ROLES_KEY, UserRole } from '../decorators/roles.decorator';
import { AuthenticatedUser } from '../decorators/current-user.decorator';

// Role hierarchy: higher index = more permissions
const ROLE_HIERARCHY: UserRole[] = [
  UserRole.VIEWER,
  UserRole.OPERATOR,
  UserRole.ANALYST,
  UserRole.MANAGER,
  UserRole.ORG_ADMIN,
  UserRole.SUPER_ADMIN,
];

function getRoleLevel(role: UserRole): number {
  return ROLE_HIERARCHY.indexOf(role);
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // No @Roles() decorator means no role restriction
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as AuthenticatedUser;

    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    const userRole = user.role as UserRole;
    const userRoleLevel = getRoleLevel(userRole);

    // SUPER_ADMIN bypasses all role checks
    if (userRole === UserRole.SUPER_ADMIN) {
      return true;
    }

    // Check if the user has at least one of the required roles
    const hasRequiredRole = requiredRoles.some((requiredRole) => {
      const requiredLevel = getRoleLevel(requiredRole);
      // User must have same or higher role level
      return userRoleLevel >= requiredLevel;
    });

    if (!hasRequiredRole) {
      throw new ForbiddenException(
        `Insufficient permissions. Required roles: ${requiredRoles.join(', ')}`,
      );
    }

    return true;
  }
}
