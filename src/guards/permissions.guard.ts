import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    
    if (!user || !user.roles) {
      throw new ForbiddenException('Access denied: No permissions assigned');
    }

    // Collect all permissions from user's roles
    const userPermissions = user.roles
      .flatMap(role => role.permissions || [])
      .map(permission => permission.name);

    const hasPermission = requiredPermissions.every((permission) => 
      userPermissions.includes(permission)
    );

    if (!hasPermission) {
      throw new ForbiddenException(`Access denied: Required permissions: ${requiredPermissions.join(', ')}`);
    }

    return true;
  }
}
