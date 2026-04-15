import { useMemo } from 'react';
import { useMatches } from 'react-router-dom';

interface RouteHandle {
  breadcrumbKey?: string;
}

export interface BreadcrumbItem {
  key: string;
  path: string;
}

export const useBreadcrumbs = (): BreadcrumbItem[] => {
  const matches = useMatches();

  return useMemo(() => {
    return matches
      .map((match) => {
        const handle = match.handle as RouteHandle | undefined;

        if (!handle?.breadcrumbKey) {
          return null;
        }

        return {
          key: handle.breadcrumbKey,
          path: match.pathname,
        };
      })
      .filter((item): item is BreadcrumbItem => item !== null);
  }, [matches]);
};
