import { Ban } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Textarea,
} from '@/components/ui';
import type { User } from '@/features/users/types/user-types';

interface BlockUserDialogProps {
  open: boolean;
  user: User | null;
  isSubmitting?: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (reason?: string) => void;
}

export function BlockUserDialog({
  open,
  user,
  isSubmitting = false,
  onOpenChange,
  onSubmit,
}: BlockUserDialogProps): React.JSX.Element {
  const { t } = useTranslation();
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (open) setReason('');
  }, [open, user?.id]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600">
            <Ban className="h-5 w-5" />
          </div>
          <DialogTitle>{t('users.block.title', { name: user?.name ?? '' })}</DialogTitle>
          <DialogDescription>{t('users.block.description')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Textarea
            value={reason}
            maxLength={500}
            placeholder={t('users.block.reasonPlaceholder')}
            onChange={(event) => setReason(event.target.value)}
          />
          <p className="text-end text-xs text-muted-foreground">{reason.length}/500</p>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" type="button" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            {t('common.cancel')}
          </Button>
          <Button
            variant="destructive"
            type="button"
            onClick={() => onSubmit(reason.trim() || undefined)}
            disabled={isSubmitting || !user}
          >
            {t('users.actions.block')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
