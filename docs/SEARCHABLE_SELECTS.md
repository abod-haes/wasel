# Searchable dropdowns — Wasel Dashboard

All single-value dropdowns use the shared `src/components/ui/select.tsx` component.
Search appears **inside** the opened dropdown, not as an extra form input.

## Default: client-side search

Use the existing `Select / SelectTrigger / SelectValue / SelectContent / SelectItem` API.
`SelectContent` automatically includes a search field; existing options are filtered in memory.
Arabic spelling variants and diacritics are normalized for matching, and `SelectItem searchText`
can supply additional searchable terms.

Use this for fixed lists, role/status/currency/unit selectors, and the full category tree returned by
`GET /api/Categories/tree`.

## Backend autocomplete

When a dataset is paginated or too large for one dropdown, keep the user's input state in the
parent and debounce it by **350ms** with `useDebouncedValue` or the compatibility alias
`useDebouncedSelectSearch`. Pass the **immediate input** to `SelectContent` and the
**debounced value** to a React Query hook; scope the search term into the query key.

```tsx
const [search, setSearch] = useState('');
const debouncedSearch = useDebouncedValue(search, 350);
const optionsQuery = useBrandOptionsQuery(debouncedSearch);

<Select onOpenChange={(open) => { if (!open) setSearch(''); }} value={value} onValueChange={setValue}>
  <SelectTrigger><SelectValue placeholder="اختر البراند" /></SelectTrigger>
  <SelectContent
    searchMode="remote"
    searchValue={search}
    onSearchChange={setSearch}
    searchPlaceholder="ابحث عن العلامة التجارية..."
    isLoading={optionsQuery.isFetching}
    isError={optionsQuery.isError}
  >
    {(optionsQuery.data ?? []).map((item) => (
      <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>
    ))}
  </SelectContent>
</Select>
```

**Never** fetch all paginated results in an unbounded loop merely to populate a select.
Search the backend and render one page of matching results. Keep the currently selected option
in the item collection even if it no longer appears in the current search page. When needed,
look it up by ID.

| Dataset | Backend search |
|---|---|
| Brands | `GET /api/Brands?page=1&pageSize=100&search=...` |
| Markets | `GET /api/Users?page=1&pageSize=100&roleName=Market&includeRoles=true&search=...` |
| Advertisement products | `GET /api/Products?page=1&pageSize=50&search=...` |
| Notification recipients | `GET /api/Users?page=1&pageSize=100&search=...` |
| Brand, user, product, category, order and notification list pages | Existing corresponding list endpoints with a debounced `search` parameter |

React Query keys include the debounced search string. Brand, Market, product, and user lookup
requests use `AbortSignal` where supported to cancel superseded requests.
Static complete lists remain locally searchable with no extra API calls.

## Manual acceptance checklist

1. Open each form and filter in Arabic / English and light / dark themes.
2. Opening a dropdown shows its search input inside the list, with keyboard focus.
3. Type rapidly; at most one request per settled 350ms search value (rather than each keystroke).
4. Confirm the Network tab does not contain repeated brand or Market pagination loops.
5. Search a value outside page 1; select it and verify its label and ID remain correct.
6. Close and reopen; the previous search is cleared, but the chosen value is retained.
7. Confirm empty results, loading and API errors render inside the dropdown.
8. Check selecting an option with mouse/touch and typing + ArrowDown/Enter with keyboard.
9. Check the notification recipient multi-select retains previously chosen users across searches.
10. Create/edit products with Market role; the fixed Market still cannot be switched.

This shared component changes only the Wasel **dashboard** repository; it does not automatically
modify the separate mobile application.
