import { ChevronDown, LogOut, UserCircle } from 'lucide-react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import {
  Avatar,
  AvatarFallback,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui';
import { formatFullPhoneNumber } from '@/constants/phone';
import { ROUTES } from '@/constants/routes';
import { useAuthStore } from '@/store/use-auth-store';

export function UserMenu(): React.JSX.Element | null {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const refreshMe = useAuthStore((state) => state.refreshMe);
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    void refreshMe().catch(() => undefined);
  }, [refreshMe]);

  if (!user) return null;

  const displayName =
    `${user.firstName} ${user.lastName}`.trim() ||
    user.name ||
    formatFullPhoneNumber(user.countryCallingCode, user.phoneNumber) ||
    t('profile.fallbackName');

  const initials =
    [user.firstName, user.lastName]
      .filter(Boolean)
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || displayName.slice(0, 2).toUpperCase();

  const phone = formatFullPhoneNumber(user.countryCallingCode, user.phoneNumber);

  const handleLogout = (): void => {
    // Logout revokes this browser's stored session and clears all account data
    // from React Query before navigating to the public login page.
    logout();
    navigate(ROUTES.login, { replace: true });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          aria-label={`${t('layout.profile')}: ${displayName}`}
          className="h-10 max-w-[230px] gap-2 rounded-lg px-2 hover:bg-muted"
        >
          <Avatar className="h-8 w-8 border border-border/60">
            <AvatarFallback className="text-xs font-semibold">{initials}</AvatarFallback>
          </Avatar>
          <span className="hidden min-w-0 truncate text-sm font-medium sm:inline">
            {displayName}
          </span>
          <ChevronDown aria-hidden="true" className="h-4 w-4 shrink-0 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        dir={i18n.dir()}
        className="w-60 border-border bg-popover p-1.5 text-popover-foreground"
      >
        <div className="space-y-1 border-b border-border/70 px-2.5 py-2.5">
          <p className="truncate text-start text-sm font-semibold">{displayName}</p>
          {phone ? (
            <p className="text-start text-xs text-muted-foreground">
              <span className="inline-block tabular-nums" dir="ltr">{phone}</span>
            </p>
          ) : null}
        </div>

        <DropdownMenuItem asChild className="mt-1 min-h-10 cursor-pointer gap-2 rounded-md">
          <Link
            to={ROUTES.profile}
            aria-current={location.pathname === ROUTES.profile ? 'page' : undefined}
          >
            <UserCircle aria-hidden="true" className="h-4 w-4 shrink-0" />
            <span>{t('layout.profile')}</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="min-h-10 cursor-pointer gap-2 rounded-md text-destructive focus:text-destructive"
          onSelect={handleLogout}
        >
          <LogOut aria-hidden="true" className="h-4 w-4 shrink-0" />
          <span>{t('layout.logout')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
