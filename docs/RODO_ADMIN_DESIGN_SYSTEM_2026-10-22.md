# RODO Dashboard — Enterprise Design System

Date: 2026-10-22 · Status: adopted for the Wasel dashboard.

## Verified design references

1. **shadcn/ui — dashboard-01 and sidebar-07 / sidebar-16**: https://ui.shadcn.com/blocks?category=dashboard and https://ui.shadcn.com/blocks/sidebar
   - Use an application shell with a persistent desktop sidebar, mobile drawer, compact sticky header and breadcrumbs.
   - Reuse the installed Radix/shadcn-style primitives; do not copy whole demo layouts, styles or fake KPI data.
2. **IBM Carbon — Data table guidelines**: https://www.carbondesignsystem.com/building-blocks/core/components/data-table/guidelines
   - Data-first dense tables with a search/filter toolbar, row hover, consistent ~40px sizing and bottom pagination.
   - Reserve full table width for long inventory/order/finance datasets.
3. **Ant Design — Data Display**: https://ant.design/docs/spec/data-display/
   - Prioritize information by importance, frequency and relationship; design empty/long-data states.
4. **Atlassian Design — Empty State**: https://atlassian.design/components/empty-state
   - Make no-data, no-results, loading and failure states distinct and actionable.

These are **pattern references**, not imported dependencies or a replacement for RODO branding.

## RODO identity decisions

| Token | Light reference | Usage |
| --- | --- | --- |
| Main brand | #142F7D navy | Primary actions, focus/selection |
| Accent | #FAB12E yellow | Sparingly on key emphasis; not financial success/failure |
| Canvas | cool off-white | Visual separation from white surfaces |
| Surface | white | Tables and cards |
| Success / warning / danger | semantic green / amber / red | Real status only |

Dark mode uses the semantic CSS tokens instead of hardcoded light hex backgrounds.

## Component contracts

- Spacing: 4px base scale; panel gap 16–24px, card padding 16–20px.
- Radius: 10–12px on cards, controls and dialogs; avoid 24–28px “mobile-like” rounding in desktop admin.
- Typography: clear 20–24px page title, 14–16px section title, 12–14px labels; avoid decorative heading bars.
- Controls: 40–44px for buttons / inputs / selects, 36px compact actions, obvious focus state and minimum target size.
- Tables: header and rows near 40–44px; numeric data uses tabular figures; fixed/truncated columns only where practical. Keep overflow scrolling within table, never on the whole page.
- Filters: one grouped toolbar before the table, search first, selectors next, reset last. Responsive wrap.
- Navigation: active page remains clear in RTL and LTR, icon-only collapse keeps an accessible label.
- Overlays: dialog has a clear title, explanatory detail, separated footer, proper focus/close behavior. No hidden irreversible financial actions.
- Ledger: show **server-authoritative** currentAmountDue. Market can read /me only; Admin may settle the full positive balance once after confirmation. Never infer balance from paginated orders or subtract orderDiscountAmount.
- Empty/error/loading: informative local state with retry only when applicable; do not disguise errors as empty data.
- Accessibility: logical headings, keyboard focus, labels, text direction, dark-mode contrast and reduced-motion support.

## Screen templates

1. **Overview**: page heading/actions → 2–4 KPI cards → activity/full-width table.
2. **Lists**: page heading/actions → filter toolbar → full-width data table → bottom pagination.
3. **Finance**: page heading/refresh → Admin market selector → balance KPIs → ledger tabs → bottom pagers → confirm settlement/dialog drilldowns.
4. **Forms**: heading/back → grouped related inputs → sticky or clear save/cancel actions, explicit validation.

## Acceptance checks

- Arabic and English; light and dark; desktop, tablet and narrow mobile.
- Product table + filters; orders list; finance ledger + settlement; users and settings forms.
- Small/empty datasets; long text; 401/403 errors; multiple markets; keyboard-only navigation.
- Run `npm run typecheck`, `npm run lint`, `npm run build` before production.
