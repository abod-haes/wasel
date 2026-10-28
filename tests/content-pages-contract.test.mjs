import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path) => readFileSync(path, 'utf8');

test('admin has three fixed content slugs, GET list and PUT JSON create-or-update', () => {
  const api = read('src/features/content-pages/api/content-pages-api.ts');
  assert.match(api, /\['privacy', 'help', 'support'\]/);
  assert.match(api, /apiClient\.get<AdminContentPage\[]>\('\/api\/content-pages'\)/);
  assert.match(api, /apiClient\.put<AdminContentPage>/);
  assert.match(api, /\{ html \}/);
  assert.doesNotMatch(api, /apiClient\.post/);
  assert.match(api, /response\.status === 404\) return null/);
});

test('Content Pages is admin-only in navigation and router', () => {
  const role = read('src/services/auth/auth-roles.ts');
  assert.match(role, /if \(isAdminRole\(roles\)\)/);
  const permissions = read('src/constants/permissions.ts');
  assert.match(permissions, /contentPagesManage/);
  const navigation = read('src/constants/navigation.ts');
  assert.match(navigation, /PERMISSIONS\.contentPagesManage/);
  const router = read('src/app/router/routes.tsx');
  assert.match(router, /PermissionGuard required=\{PERMISSIONS\.contentPagesManage\}/);
});

test('admin renders exactly supported page rows even when server returns []', () => {
  const page = read('src/features/content-pages/pages/content-pages-page.tsx');
  assert.match(page, /CONTENT_SLUGS\.map/);
  assert.match(page, /pages\.data \?\? \[\]/);
  assert.match(page, /setDrafts/);
  assert.match(page, /result\.html/);
  assert.match(page, /!canSave \|\| save\.isPending/);
  assert.match(page, /200_000/);
});

test('web content HTML goes through restrictive sanitizer before rendering', () => {
  const sanitizer = read('src/features/content-pages/utils/sanitize-content-html.ts');
  assert.match(sanitizer, /blockedWithContents/);
  assert.match(sanitizer, /createTextNode/);
  assert.match(sanitizer, /permittedTags/);
  const publicPage = read('src/features/content-pages/components/public-content-section.tsx');
  const adminPage = read('src/features/content-pages/pages/content-pages-page.tsx');
  assert.match(publicPage, /sanitizeContentHtml\(query\.data\.html\)/);
  assert.match(adminPage, /sanitizeContentHtml\(draft\)/);
  assert.doesNotMatch(publicPage, /apiClient\.put/);
});
