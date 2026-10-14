import { ChevronDown, Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui';
import type { User } from '@/features/users/types/user-types';

interface NotificationUsersMultiSelectProps {
  users: User[];
  selectedUserIds: string[];
  searchValue?: string;
  onSearchChange?: (search: string) => void;
  isLoading?: boolean;
  isError?: boolean;
  disabled?: boolean;
  onChange: (userIds: string[]) => void;
}

interface SelectedUserDisplay {
  id: string;
  label: string;
}

export function NotificationUsersMultiSelect({
  users,
  selectedUserIds,
  searchValue,
  onSearchChange,
  isLoading = false,
  isError = false,
  disabled = false,
  onChange,
}: NotificationUsersMultiSelectProps): React.JSX.Element {
  const { t } = useTranslation();
  const [localSearch, setLocalSearch] = useState('');
  const [knownUsers, setKnownUsers] = useState<Record<string, string>>({});
  const search = searchValue ?? localSearch;
  const visibleUsers = useMemo(
    () => onSearchChange
      ? users
      : users.filter((user) => `${user.name} ${user.email ?? ''} ${user.phoneNumber ?? ''}`
          .toLocaleLowerCase().includes(search.trim().toLocaleLowerCase())),
    [onSearchChange, users, search]
  );

  const selectedUsers = useMemo<SelectedUserDisplay[]>(() => {
    const usersById = new Map(users.map((user) => [user.id, user]));

    return selectedUserIds.map((userId) => {
      const user = usersById.get(userId);

      return {
        id: userId,
        label: user ? user.name : knownUsers[userId] ?? userId,
      };
    });
  }, [selectedUserIds, users, knownUsers]);

  const triggerLabel =
    selectedUserIds.length > 0
      ? t('notifications.selectedUsers', { count: selectedUserIds.length })
      : t('notifications.form.userIdsPlaceholder');

  const toggleUser = (userId: string, checked: boolean): void => {
    if (checked) {
      const user = users.find((item) => item.id === userId);
      if (user) setKnownUsers((previous) => ({ ...previous, [userId]: user.name }));
      onChange(selectedUserIds.includes(userId) ? selectedUserIds : [...selectedUserIds, userId]);
      return;
    }

    onChange(selectedUserIds.filter((selectedUserId) => selectedUserId !== userId));
  };

  const removeUser = (userId: string): void => {
    onChange(selectedUserIds.filter((selectedUserId) => selectedUserId !== userId));
  };

  return (
    <div className="space-y-2">
      <DropdownMenu onOpenChange={(open) => {
        if (!open) {
          if (onSearchChange) onSearchChange('');
          else setLocalSearch('');
        }
      }}>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="min-h-11 w-full justify-between rounded-lg px-3.5 text-start font-medium"
            disabled={disabled}
          >
            <span className="truncate">{isLoading ? t('notifications.form.loadingUsers') : triggerLabel}</span>
            <ChevronDown className="h-4 w-4 shrink-0 opacity-70" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="max-h-72 w-[var(--radix-dropdown-menu-trigger-width)] overflow-y-auto rounded-lg"
        >
          <div className="sticky top-0 z-10 flex items-center gap-2 border-b border-border bg-popover p-2">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              type="search"
              value={search}
              placeholder="ابحث عن مستخدم..."
              aria-label="البحث عن مستخدم"
              autoComplete="off"
              onChange={(event) => onSearchChange ? onSearchChange(event.target.value) : setLocalSearch(event.target.value)}
              onKeyDown={(event) => event.stopPropagation()}
              className="h-9 min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
          </div>
          {isLoading ? <p role="status" className="px-2.5 py-2 text-xs text-muted-foreground">جاري البحث...</p> : null}
          {isError ? (
            <p className="px-2.5 py-2 text-sm text-destructive">{t('notifications.form.usersLoadError')}</p>
          ) : null}

          {!isError && !isLoading && visibleUsers.length === 0 ? (
            <p className="px-2.5 py-2 text-sm text-muted-foreground">{t('notifications.form.noUsers')}</p>
          ) : null}

          {!isError
            ? visibleUsers.map((user) => (
                <DropdownMenuCheckboxItem
                  key={user.id}
                  checked={selectedUserIds.includes(user.id)}
                  onCheckedChange={(checked) => toggleUser(user.id, Boolean(checked))}
                  onSelect={(event) => event.preventDefault()}
                >
                  <span className="min-w-0">
                    <span className="block truncate">{user.name}</span>
                    <span className="block truncate text-xs text-muted-foreground">{user.email}</span>
                  </span>
                </DropdownMenuCheckboxItem>
              ))
            : null}
        </DropdownMenuContent>
      </DropdownMenu>

      {selectedUsers.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {selectedUsers.map((user) => (
            <Badge key={user.id} variant="secondary" className="gap-1 rounded-lg px-2 py-1">
              <span className="max-w-52 truncate">{user.label}</span>
              <button
                type="button"
                className="rounded text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                disabled={disabled}
                onClick={() => removeUser(user.id)}
              >
                <span className="sr-only">{t('notifications.form.removeUser')}</span>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">{t('notifications.form.broadcastHint')}</p>
      )}
    </div>
  );
}
