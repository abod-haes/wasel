import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import test from 'node:test';

const generator = resolve('scripts/generate-store-pages.mjs');

function renderPages(email) {
  const root = mkdtempSync(resolve(tmpdir(), 'rodo-store-'));
  mkdirSync(resolve(root, 'dist'));
  try {
    const env = { ...process.env, VITE_SUPPORT_EMAIL: email };
    const result = spawnSync(process.execPath, [generator], { cwd: root, env, encoding: 'utf8' });
    assert.equal(result.status, 0, result.stdout + '\n' + result.stderr);
    const files = ['privacy.html', 'account-deletion.html', 'support.html'];
    assert.ok(files.every((name) => existsSync(resolve(root, 'dist', name))));
    return Object.fromEntries(
      files.map((name) => [name, readFileSync(resolve(root, 'dist', name), 'utf8')]),
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

test('public policy and deletion pages include crawlable content without client JavaScript', () => {
  const pages = renderPages('release@example.org');
  assert.match(pages['privacy.html'], /حالة «متاح»/);
  assert.match(pages['privacy.html'], /الخلفية/);
  assert.match(pages['privacy.html'], /حذف الحساب/);
  assert.match(pages['account-deletion.html'], /href="\/account-deletion\/submit"/);
  assert.match(pages['support.html'], /mailto:release@example.org/);
  assert.ok(Object.values(pages).every((html) => html.includes('lang="ar" dir="rtl"')));
});

test('public pages do not invent a support email when one is not configured', () => {
  const pages = renderPages('');
  assert.match(pages['support.html'], /قناة الدعم غير مهيأة/);
  assert.doesNotMatch(pages['support.html'], /href="mailto:/);
});
