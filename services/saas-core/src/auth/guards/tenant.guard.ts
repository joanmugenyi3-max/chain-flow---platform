import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { AuthenticatedUser } from '../decorators/current-user.decorator';
import { UserRole } from '../decorators/roles.decorator';

export const SKIP_TENANT_CHECK_KEY = 'skipTenantCheck';

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const skipTenantCheck = this.reflector.getAllAndOverride<boolean>(
      SKIP_TENANT_CHECK_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (skipTenantCheck) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as AuthenticatedUser;

    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    // Super admins can access any tenant
    if (user.role === UserRole.SUPER_ADMIN) {
      return true;
    }

    // Extract tenant ID from route params or headers
    const requestedTenantId =
      (request.params as any)?.organizationId ??
      (request.params as any)?.tenantId ??
      (request.params as any)?.id ??
      request.headers['x-tenant-id'];

    // If no tenant ID is in the request, default to user's organization
    if (!requestedTenantId) {
      return true;
    }

    // Verify the user belongs to the requested organization
    if (user.organizationId !== requestedTenantId) {
      throw new ForbiddenException(
        'You do not have access to this organization',
      );
    }

    return true;
  }
}
