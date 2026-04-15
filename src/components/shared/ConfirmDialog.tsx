import { useTranslation } from 'react-i18next';

import { Button, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  titleKey?: string;
  descriptionKey?: string;
  confirmLabelKey?: string;
  cancelLabelKey?: string;
  isLoading?: boolean;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  titleKey = 'confirmDialog.title',
  descriptionKey = 'confirmDialog.description',
  confirmLabelKey = 'common.confirm',
  cancelLabelKey = 'common.cancel',
  isLoading = false,
}: ConfirmDialogProps): React.JSX.Element {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t(titleKey)}</DialogTitle>
          <DialogDescription>{t(descriptionKey)}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            {t(cancelLabelKey)}
          </Button>
          <Button onClick={onConfirm} disabled={isLoading}>
            {t(confirmLabelKey)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
