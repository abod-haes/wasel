import * as React from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, ChevronDown, ChevronUp, LoaderCircle, Search } from 'lucide-react';

import { cn } from '@/lib/utils';

const Select = SelectPrimitive.Root;
const SelectGroup = SelectPrimitive.Group;

type SearchMode = 'local' | 'remote';

interface SearchState {
  query: string;
  mode: SearchMode;
}

const SearchContext = React.createContext<SearchState>({ query: '', mode: 'local' });

const normalizeSearch = (value: string): string =>
  value
    .normalize('NFKC')
    .toLocaleLowerCase()
    .replace(/[أإآ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/[\u064B-\u065F\u0670\u0640]/g, '')
    .trim();

const textOf = (node: React.ReactNode): string => {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(textOf).join(' ');
  if (React.isValidElement<{ children?: React.ReactNode }>(node)) {
    return textOf(node.props.children);
  }
  return '';
};

const matches = (children: React.ReactNode, value: string, query: string, searchText?: string): boolean =>
  !query || normalizeSearch(`${searchText ?? textOf(children)} ${value}`).includes(query);

interface SearchSelectItemProps extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item> {
  /** Optional extra text for searching icon-only or specially formatted options. */
  searchText?: string;
}

/** Counts visible options for a meaningful empty state, even inside arrays/fragments. */
const countMatchingItems = (node: React.ReactNode, query: string, mode: SearchMode): number => {
  if (Array.isArray(node)) return node.reduce<number>((total, item) => total + countMatchingItems(item, query, mode), 0);
  if (!React.isValidElement(node)) return 0;

  if (node.type === SelectItem) {
    const item = node.props as SearchSelectItemProps;
    return mode === 'remote' || matches(item.children, item.value, query, item.searchText) ? 1 : 0;
  }

  const props = node.props as { children?: React.ReactNode };
  return countMatchingItems(props.children, query, mode);
};

const SelectValue = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Value>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Value>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Value
    ref={ref}
    className={cn('block min-w-0 flex-1 truncate text-start', className)}
    {...props}
  />
));
SelectValue.displayName = SelectPrimitive.Value.displayName;

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      'group flex h-12 w-full min-w-0 items-center justify-between gap-3 rounded-[16px] border border-brand-border bg-card px-4 text-start text-sm font-medium text-foreground shadow-[inset_0_1px_0_hsl(var(--background)/0.45)] outline-none transition-[border-color,box-shadow,background-color] duration-200 data-[placeholder]:text-muted-foreground hover:border-border hover:bg-muted/50 focus:border-primary/50 focus:bg-card focus:ring-4 focus:ring-primary/10 data-[state=open]:border-primary/50 data-[state=open]:bg-card data-[state=open]:ring-4 data-[state=open]:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-50',
      className
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180 group-data-[state=open]:text-primary" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn('flex h-8 cursor-default items-center justify-center border-b border-border/60 bg-card text-muted-foreground', className)}
    {...props}
  >
    <ChevronUp className="h-4 w-4" />
  </SelectPrimitive.ScrollUpButton>
));
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;

const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn('flex h-8 cursor-default items-center justify-center border-t border-border/60 bg-card text-muted-foreground', className)}
    {...props}
  >
    <ChevronDown className="h-4 w-4" />
  </SelectPrimitive.ScrollDownButton>
));
SelectScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName;

interface SearchSelectContentProps extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content> {
  searchable?: boolean;
  /** 'local' filters existing items; 'remote' delegates results to API-backed options. */
  searchMode?: SearchMode;
  searchValue?: string;
  onSearchChange?: (search: string) => void;
  searchPlaceholder?: string;
  emptyMessage?: string;
  isLoading?: boolean;
  isError?: boolean;
}

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  SearchSelectContentProps
>(({
  className,
  children,
  position = 'popper',
  sideOffset = 6,
  searchable = true,
  searchMode = 'local',
  searchValue,
  onSearchChange,
  searchPlaceholder = 'ابحث ضمن الخيارات...',
  emptyMessage = 'لا توجد نتائج مطابقة',
  isLoading = false,
  isError = false,
  ...props
}, ref) => {
  const [localSearch, setLocalSearch] = React.useState('');
  const inputRef = React.useRef<HTMLInputElement>(null);
  const contentRef = React.useRef<HTMLDivElement | null>(null);
  const query = searchable ? normalizeSearch(searchValue ?? localSearch) : '';
  const count = countMatchingItems(children, query, searchMode);

  const assignRef = (node: HTMLDivElement | null): void => {
    contentRef.current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref) ref.current = node;
  };

  const handleChange = (value: string): void => {
    if (onSearchChange) onSearchChange(value);
    else setLocalSearch(value);
  };

  const handleSearchKeyDown = (event: React.KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === 'Escape' || event.key === 'Tab') return;
    // Radix Select's typeahead otherwise steals characters from the search input.
    event.stopPropagation();
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'Enter') {
      event.preventDefault();
      const options = contentRef.current?.querySelectorAll<HTMLElement>('[role="option"]:not([data-disabled])');
      const target = event.key === 'ArrowUp' ? options?.[options.length - 1] : options?.[0];
      target?.focus();
    }
  };

  return (
    <SelectPrimitive.Portal>
      <SearchContext.Provider value={{ query, mode: searchMode }}>
        <SelectPrimitive.Content
          ref={assignRef}
          position={position}
          sideOffset={sideOffset}
          className={cn(
            'relative z-[100] flex max-h-80 min-w-[8rem] flex-col overflow-hidden rounded-2xl border border-brand-border bg-popover/98 text-popover-foreground shadow-[0_20px_55px_-22px_hsl(var(--foreground)/0.45)] backdrop-blur-xl',
            position === 'popper' && 'w-[var(--radix-select-trigger-width)] data-[side=bottom]:translate-y-0 data-[side=top]:-translate-y-0',
            className
          )}
          {...props}
        >
          {searchable ? (
            <div className="relative shrink-0 border-b border-border/60 p-2">
              <Search className="pointer-events-none absolute end-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                ref={inputRef}
                type="search"
                value={searchValue ?? localSearch}
                onChange={(event) => handleChange(event.target.value)}
                onKeyDown={handleSearchKeyDown}
                aria-label={searchPlaceholder}
                placeholder={searchPlaceholder}
                autoComplete="off"
                spellCheck={false}
                className="h-9 w-full min-w-0 rounded-xl border border-border bg-background px-3 pe-10 text-start text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary/60 focus:ring-2 focus:ring-primary/10"
              />
            </div>
          ) : null}
          <SelectScrollUpButton />
          <SelectPrimitive.Viewport className="min-h-0 w-full max-h-60 overflow-y-auto p-1.5">
            {children}
            {isLoading ? (
              <div role="status" className="flex items-center justify-center gap-2 px-3 py-3 text-xs text-muted-foreground">
                <LoaderCircle className="h-4 w-4 animate-spin" />جاري البحث...
              </div>
            ) : isError ? (
              <p role="alert" className="px-3 py-3 text-xs text-destructive">تعذّر تحميل الخيارات. حاول مجددًا.</p>
            ) : count === 0 ? (
              <p role="status" className="px-3 py-3 text-xs text-muted-foreground">{emptyMessage}</p>
            ) : null}
          </SelectPrimitive.Viewport>
          <SelectScrollDownButton />
        </SelectPrimitive.Content>
      </SearchContext.Provider>
    </SelectPrimitive.Portal>
  );
});
SelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn('px-3 py-2 text-xs font-semibold text-muted-foreground', className)}
    {...props}
  />
));
SelectLabel.displayName = SelectPrimitive.Label.displayName;

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  SearchSelectItemProps
>(({ className, children, searchText, ...props }, ref) => {
  const { query, mode } = React.useContext(SearchContext);
  if (mode === 'local' && !matches(children, props.value, query, searchText)) return null;

  return (
    <SelectPrimitive.Item
      ref={ref}
      className={cn(
        'relative flex min-h-10 w-full cursor-pointer select-none items-center rounded-xl py-2.5 ps-9 pe-3 text-start text-sm font-medium outline-none transition-colors data-[highlighted]:bg-brand-primary-soft data-[highlighted]:text-foreground data-[state=checked]:bg-brand-primary-soft data-[state=checked]:text-brand-primary-dark dark:data-[state=checked]:bg-primary/20 dark:data-[state=checked]:text-primary data-[disabled]:pointer-events-none data-[disabled]:opacity-40',
        className
      )}
      {...props}
    >
      <span className="absolute start-3 flex h-4 w-4 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <Check className="h-4 w-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
});
SelectItem.displayName = SelectPrimitive.Item.displayName;

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn('-mx-1 my-1 h-px bg-border/70', className)}
    {...props}
  />
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};
