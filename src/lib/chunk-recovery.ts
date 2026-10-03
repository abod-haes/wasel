const CHUNK_RECOVERY_KEY = 'wasel:chunk-recovery:last-at';
const CHUNK_RECOVERY_PARAM = '__wasel_refresh';
const CHUNK_RECOVERY_WINDOW_MS = 60_000;

const CHUNK_ERROR_PATTERNS = [
  /failed to fetch dynamically imported module/i,
  /error loading dynamically imported module/i,
  /importing a module script failed/i,
  /loading chunk .* failed/i,
  /chunkloaderror/i,
];

export function isChunkLoadError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  return CHUNK_ERROR_PATTERNS.some((pattern) => pattern.test(error.message));
}

export function recoverFromChunkError(error?: unknown): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  if (error !== undefined && !isChunkLoadError(error)) {
    return false;
  }

  const now = Date.now();
  const lastRecoveryAt = Number(window.sessionStorage.getItem(CHUNK_RECOVERY_KEY) ?? '0');

  if (Number.isFinite(lastRecoveryAt) && now - lastRecoveryAt < CHUNK_RECOVERY_WINDOW_MS) {
    return false;
  }

  window.sessionStorage.setItem(CHUNK_RECOVERY_KEY, String(now));

  const url = new URL(window.location.href);
  url.searchParams.set(CHUNK_RECOVERY_PARAM, String(now));
  window.location.replace(url.toString());

  return true;
}

export function cleanupChunkRecoveryUrl(): void {
  if (typeof window === 'undefined') {
    return;
  }

  const url = new URL(window.location.href);

  if (!url.searchParams.has(CHUNK_RECOVERY_PARAM)) {
    return;
  }

  url.searchParams.delete(CHUNK_RECOVERY_PARAM);

  window.history.replaceState(
    window.history.state,
    '',
    `${url.pathname}${url.search}${url.hash}`,
  );
}
