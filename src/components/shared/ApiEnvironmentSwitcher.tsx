import { useState } from 'react';
import { ArrowLeftRight, Server } from 'lucide-react';

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';
import {
  getApiEnvironment,
  hasDevelopmentApi,
  setApiEnvironment,
  type ApiEnvironment,
} from '@/config/api-environment';
import { ROUTES } from '@/constants/routes';
import { clearStoredAuthSession } from '@/services/auth/auth-storage';

interface ApiEnvironmentSwitcherProps {
  compact?: boolean;
}

export function ApiEnvironmentSwitcher({
  compact = false,
}: ApiEnvironmentSwitcherProps): React.JSX.Element {
  const [pending, setPending] = useState<ApiEnvironment | null>(null);
  const current = getApiEnvironment();

  const requestSwitch = (value: string): void => {
    if ((value !== 'production' && value !== 'development') || value === current) return;
    if (value === 'development' && !hasDevelopmentApi) return;
    setPending(value);
  };

  const confirmSwitch = (): void => {
    if (!pending) return;

    // Never reuse a login token or React Query cache across different backends.
    clearStoredAuthSession();
    if (!setApiEnvironment(pending)) {
      setPending(null);
      return;
    }
    clearStoredAuthSession();
    window.location.replace(ROUTES.login);
  };

  return (
    <>
      <div className="flex items-center gap-2">
        {!compact ? <Server aria-hidden="true" className="h-4 w-4 text-muted-foreground" /> : null}
        <span
          className={
            current === 'development'
              ? 'h-2 w-2 shrink-0 rounded-full bg-amber-500'
              : 'h-2 w-2 shrink-0 rounded-full bg-emerald-500'
          }
          aria-hidden="true"
        />
        <Select value={current} onValueChange={requestSwitch}>
          <SelectTrigger
            aria-label="بيئة API الحالية"
            className="h-9 w-[156px] rounded-xl border-brand-border bg-card text-xs"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="production">Production — فعلي</SelectItem>
            <SelectItem value="development" disabled={!hasDevelopmentApi}>
              Development — تجريبي
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Dialog open={pending !== null} onOpenChange={(open) => !open && setPending(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowLeftRight className="h-5 w-5 text-primary" />
              تغيير بيئة الاتصال
            </DialogTitle>
            <DialogDescription className="leading-6">
              رح يتم تسجيل خروجك وإعادة فتح صفحة الدخول على بيئة
              {' '}
              {pending === 'development' ? 'Development التجريبية' : 'Production الفعلية'}.
              بيانات وطلبات البيئتين منفصلة، وتأكد من البيئة قبل أي تعديل.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => setPending(null)}>
              إلغاء
            </Button>
            <Button type="button" onClick={confirmSwitch}>
              تأكيد التبديل
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
