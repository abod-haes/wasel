import { ChevronDown, LogOut, UserCircle } from 'lucide-react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

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
import { ROUTES } from '@/constants/routes';
import { useAuthStore } from '@/store/use-auth-store';

export function UserMenu(): React.JSX.Element {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const refreshMe = useAuthStore((state) => state.refreshMe);
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    void refreshMe().catch(() => undefined);
  }, [refreshMe]);

  if (!user) {
    return <div />;
  }

  const displayName =
    `${user.firstName} ${user.lastName}`.trim() ||
    user.name ||
    `${user.countryCallingCode}${user.phoneNumber}`;

  const initials =
    [user.firstName, user.lastName]
      .filter(Boolean)
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || displayName.slice(0, 2).toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-9 px-2">
          <Avatar className="h-7 w-7">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <span className="hidden text-sm font-medium sm:inline">{displayName}</span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <div className="px-2 py-1.5">
          <p className="text-sm font-medium">{displayName}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to={ROUTES.profile}>
            <UserCircle className="me-2 h-4 w-4" />
            {t('layout.profile')}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={logout}>
          <LogOut className="me-2 h-4 w-4" />
          {t('layout.logout')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
