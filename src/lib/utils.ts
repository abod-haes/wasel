import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { env } from '@/env';

export const cn = (...inputs: ClassValue[]): string => twMerge(clsx(inputs));

export const formatNumber = (value: number): string => new Intl.NumberFormat().format(value);

export const formatPercent = (value: number): string => {
  const signal = value > 0 ? '+' : '';
  return `${signal}${value}%`;
};

const ABSOLUTE_URL_PATTERN = /^[a-z][a-z\d+\-.]*:/i;
const PROTOCOL_RELATIVE_URL_PATTERN = /^\/\//;
const STORAGE_PATH_PATTERN = /^\/?storage\//i;

const stripLeadingSlashes = (value: string): string => value.replace(/^\/+/, '');
const stripTrailingSlashes = (value: string): string => value.replace(/\/+$/, '');

export const resolveMediaPath = (path: string): string => {
  const normalizedPath = path.trim();

  if (!normalizedPath) {
    return normalizedPath;
  }

  if (ABSOLUTE_URL_PATTERN.test(normalizedPath) || PROTOCOL_RELATIVE_URL_PATTERN.test(normalizedPath)) {
    return normalizedPath;
  }

  if (STORAGE_PATH_PATTERN.test(normalizedPath)) {
    const normalizedBaseUrl = stripTrailingSlashes(env.apiBaseUrl.trim());
    return `${normalizedBaseUrl}/${stripLeadingSlashes(normalizedPath)}`;
  }

  if (normalizedPath.startsWith('/')) {
    return normalizedPath;
  }

  return `/${stripLeadingSlashes(normalizedPath)}`;
};
