import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = (file) => readFileSync(file, 'utf8');

test('admin content API uses GET list and PUT save for exactly three fixed slugs', () => {
  const types = source('src/features/content-pages/types/content-page-types.ts');
  const api = source('src/features/content-pages/api/content-pages-api.ts');
  assert.match(types, /\['privacy', 'help', 'support'\] as const/);
  assert.match(api, /apiClient\.get<AdminContentPage\[]>\(url\)/);
  assert.match(api, /apiClient\.put<AdminContentPage>/);
  assert.match(api, /\{ html \}/);
  assert.doesNotMatch(api, /apiClient\.post|\/'api\/content-pages\/create'/);
  assert.match(api, /axios\.get<PublicContentPage>/);
  assert.match(api, /error\.response\?\.status === 404/);
});

test('admin exposes all three pages in the sidebar and requires admin permission', () => {
  const page = source('src/features/content-pages/pages/content-pages-page.tsx');
  const nav = source('src/constants/navigation.ts');
  const route = source('src/app/router/routes.tsx');
  assert.match(page, /CONTENT_PAGE_SLUGS\.map/);
  assert.match(page, /isAdminRole\(roles\)/);
  assert.match(page, /setDraft\(saved\.html\)/);
  assert.match(page, /mutationFn:[\s\S]*?contentPagesApi\.save/);
  assert.match(page, /setSaveError\(message\)/);
  assert.match(page, /MAX_HTML_LENGTH = 200_000/);
  assert.match(nav, /nav\.contentPages/);
  assert.match(route, /path: ROUTES\.contentPages/);
  assert.match(route, /required=\{PERMISSIONS\.settingsEdit\}/);
});

test('no default legal content is seeded, preview sanitizes markup', () => {
  const page = source('src/features/content-pages/pages/content-pages-page.tsx');
  const api = source('src/features/content-pages/api/content-pages-api.ts');
  const sanitize = source('src/features/content-pages/utils/sanitize-content-html.ts');
  assert.doesNotMatch(page, /useEffect\([\s\S]*?contentPagesApi\.save/);
  assert.match(page, /sanitizeContentHtml\(draft\)/);
  assert.match(sanitize, /DROP_WITH_CONTENT/);
  assert.match(sanitize, /noopener noreferrer nofollow/);
  assert.match(sanitize, /removeAttribute/);
  assert.doesNotMatch(api, /apiClient\.delete/);
});
