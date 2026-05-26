import { Controller } from '@nestjs/common';

const COMMON_ROUTE_PREFIX = 'common';
const ADMIN_ROUTE_PREFIX = 'admin';

function prefixedController(prefix: string, path: string): ClassDecorator {
  return Controller(path ? `${prefix}/${path}` : prefix);
}

export function CommonController(path = ''): ClassDecorator {
  return prefixedController(COMMON_ROUTE_PREFIX, path);
}

export function AdminController(path = ''): ClassDecorator {
  return prefixedController(ADMIN_ROUTE_PREFIX, path);
}
