import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path) => readFileSync(path, 'utf8');

test('mobile table pages keep document scroll while desktop keeps fixed table workspace', () => {
  const layout = read('src/app/layouts/app-layout.tsx');
  assert.match(layout, /min-h-dvh lg:fixed lg:inset-0/);
  assert.match(layout, /lg:flex lg:min-h-0 lg:flex-1 lg:flex-col lg:overflow-hidden/);
  assert.match(layout, /pb-8 lg:min-h-0 lg:flex-1 lg:overflow-hidden lg:pb-0/);
  assert.doesNotMatch(layout, /'fixed inset-0 flex min-h-0 flex-col overflow-hidden'/);

  const page = read('src/components/shared/PageContainer.tsx');
  assert.match(page, /fixedTableLayout && 'lg:flex lg:h-full/);
  assert.match(page, /lg:overflow-hidden lg:space-y-0/);
  assert.doesNotMatch(page, /fixedTableLayout && 'flex h-full min-h-0/);
});

test('mobile table can grow vertically with viewport scroll and scroll horizontally for columns', () => {
  const table = read('src/components/shared/DataTable.tsx');
  assert.match(table, /dashboard-data-table min-w-0 rounded-xl/);
  assert.match(table, /lg:flex lg:h-full lg:min-h-0 lg:flex-1/);
  assert.match(table, /containerClassName="w-full overflow-x-auto overscroll-x-contain/);
  assert.match(table, /lg:overscroll-contain lg:overflow-auto/);
  assert.doesNotMatch(table, /className="dashboard-data-table flex h-full min-h-0/);
});

test('opening selects on phones does not autofocus the search and launch keyboard', () => {
  const select = read('src/components/ui/select.tsx');
  assert.match(select, /matchMedia\('\(pointer: coarse\)'\)/);
  assert.match(select, /matchMedia\('\(max-width: 1023px\)'\)/);
  assert.match(select, /if \(!touchOrSmallScreen\)/);
  assert.match(select, /onPointerDown=\{\(event\) => event\.stopPropagation\(\)\}/);
  assert.match(select, /text-base sm:text-sm/);
  assert.match(select, /max-h-\[70dvh\]/);
});
