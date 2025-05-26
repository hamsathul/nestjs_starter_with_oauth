import { applyDecorators, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { PermissionsGuard } from '../guards/permissions.guard';
import { Roles } from './roles.decorator';
import { RequirePermissions } from './permissions.decorator';

export function Auth(...roles: string[]) {
  return applyDecorators(
    UseGuards(JwtAuthGuard, RolesGuard),
    Roles(...roles),
  );
}

export function AuthWithPermissions(...permissions: string[]) {
  return applyDecorators(
    UseGuards(JwtAuthGuard, PermissionsGuard),
    RequirePermissions(...permissions),
  );
}

export function AuthWithRolesAndPermissions(roles: string[], permissions: string[]) {
  return applyDecorators(
    UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard),
    Roles(...roles),
    RequirePermissions(...permissions),
  );
}
