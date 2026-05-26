import { Logger } from '@nestjs/common';

/**
 * Log start and end time of function processing.
 *
 * Can be scaled with external logging tools (ex. Sentry)
 *
 * @constructor
 */

export function Log() {
  const logger = new Logger();

  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const original = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const start = Date.now();
      const controller = this?.constructor?.name ?? 'Unknown';
      logger.log(`[${controller}] Start ${propertyKey}`);

      try {
        return await original.apply(this, args);
      } finally {
        const responseTime = Date.now() - start;
        logger.log(`[${controller}] End ${propertyKey} | ${responseTime}ms`);
      }
    };

    return descriptor;
  };
}
