import { lazy, type ComponentType, type LazyExoticComponent } from 'react';

import { recoverFromChunkError } from '@/lib/chunk-recovery';

type RouteModule = {
  default: ComponentType;
};

export function lazyRoute(
  importer: () => Promise<RouteModule>,
): LazyExoticComponent<ComponentType> {
  return lazy(async () => {
    try {
      return await importer();
    } catch (error) {
      if (recoverFromChunkError(error)) {
        return await new Promise<never>(() => undefined);
      }

      throw error;
    }
  });
}
