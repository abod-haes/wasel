import { CheckCircle2, Phone, Save, ShieldCheck, UserRound } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { PageContainer, SectionHeader } from '@/components/shared';
import {
  Avatar,
  AvatarFallback,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
} from '@/components/ui';
import { formatFullPhoneNumber } from '@/constants/phone';
import { ChangePasswordCard } from '@/features/settings/components/change-password-card';
import { useAuthStore } from '@/store/use-auth-store';

export default function ProfilePage(): React.JSX.Element {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const refreshMe = useAuthStore((state) => state.refreshMe);
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    void refreshMe().catch(() => undefined);
  }, [refreshMe]);

  useEffect(() => {
    setFirstName(user?.firstName ?? '');
    setLastName(user?.lastName ?? '');
  }, [user?.firstName, user?.lastName]);

  const displayName =
    `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim() ||
    user?.name ||
    t('profile.fallbackName');

  const initials = useMemo(() => {
    const letters = [user?.firstName, user?.lastName]
      .filter((value): value is string => Boolean(value?.trim()))
      .map((value) => value.trim()[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

    return letters || displayName.slice(0, 2).toUpperCase();
  }, [displayName, user?.firstName, user?.lastName]);

  if (!user) {
    return <PageContainer />;
  }

  const saveProfile = async (): Promise<void> => {
    const normalizedFirstName = firstName.trim();
    const normalizedLastName = lastName.trim();

    if (!normalizedFirstName || !normalizedLastName) {
      toast.error(t('profile.nameRequired'));
      return;
    }

    setIsSaving(true);

    try {
      await updateProfile({
        firstName: normalizedFirstName,
        lastName: normalizedLastName,
      });
      toast.success(t('profile.saved'));
    } catch {
      toast.error(t('profile.saveFailed'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <PageContainer>
      <SectionHeader titleKey="profile.title" descriptionKey="profile.description" />

      <Card className="overflow-hidden">
        <CardHeader className="border-b border-border/60 bg-muted/20">
          <div className="flex flex-wrap items-center gap-4">
            <Avatar className="h-16 w-16 border border-border/70">
              <AvatarFallback className="text-lg font-semibold">{initials}</AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1">
              <CardTitle className="truncate text-xl">{displayName}</CardTitle>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {user.roles.map((role) => (
                  <Badge key={role} variant="secondary">
                    {role}
                  </Badge>
                ))}
                {user.phoneNumberVerified ? (
                  <Badge variant="success">
                    <CheckCircle2 className="me-1 h-3.5 w-3.5" />
                    {t('profile.phoneVerified')}
                  </Badge>
                ) : null}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          <div className="grid gap-4 md:grid-cols-2">
            <label htmlFor="profile-first-name" className="space-y-2">
              <span className="flex items-center gap-2 text-sm font-semibold">
                <UserRound className="h-4 w-4 text-muted-foreground" />
                {t('profile.firstName')}
              </span>
              <Input
                id="profile-first-name"
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
              />
            </label>

            <label htmlFor="profile-last-name" className="space-y-2">
              <span className="flex items-center gap-2 text-sm font-semibold">
                <UserRound className="h-4 w-4 text-muted-foreground" />
                {t('profile.lastName')}
              </span>
              <Input
                id="profile-last-name"
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
              />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-border/70 bg-muted/25 p-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                <Phone className="h-4 w-4" />
                {t('profile.phone')}
              </div>
              <p dir="ltr" className="mt-2 w-fit text-sm font-semibold tabular-nums">
                {formatFullPhoneNumber(user.countryCallingCode, user.phoneNumber)}
              </p>
            </div>

            <div className="rounded-2xl border border-border/70 bg-muted/25 p-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                <ShieldCheck className="h-4 w-4" />
                {t('profile.roles')}
              </div>
              <p className="mt-2 text-sm font-semibold">{user.roles.join(' • ') || '—'}</p>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              type="button"
              className="gap-2"
              onClick={() => void saveProfile()}
              disabled={isSaving}
            >
              <Save className="h-4 w-4" />
              {isSaving ? t('profile.saving') : t('profile.save')}
            </Button>
          </div>
        </CardContent>
      </Card>

      <ChangePasswordCard />
    </PageContainer>
  );
}
