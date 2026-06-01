import {
  applyDecorators,
  Controller,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import { AdminAuthGuard } from '../../admin/auth/admin-auth.guard';
import { ADMIN_AUTH_PUBLIC_KEY } from '../../admin/auth/admin-auth.constants';

const COMMON_ROUTE_PREFIX = 'common';
const ADMIN_ROUTE_PREFIX = 'admin';

function prefixedController(prefix: string, path: string): ClassDecorator {
  return Controller(path ? `${prefix}/${path}` : prefix);
}

export function CommonController(path = ''): ClassDecorator {
  return prefixedController(COMMON_ROUTE_PREFIX, path);
}

export function AdminController(path = ''): ClassDecorator {
  return applyDecorators(
    prefixedController(ADMIN_ROUTE_PREFIX, path),
    UseGuards(AdminAuthGuard),
  );
}

export function AdminAuthPublic(): MethodDecorator {
  return SetMetadata(ADMIN_AUTH_PUBLIC_KEY, true);
}
