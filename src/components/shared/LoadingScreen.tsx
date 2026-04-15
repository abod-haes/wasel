import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { cn } from '@/lib/utils';

interface LoadingScreenProps {
  fullScreen?: boolean;
  textKey?: string;
  className?: string;
}

export function LoadingScreen({ fullScreen = false, textKey = 'common.loading', className }: LoadingScreenProps): React.JSX.Element {
  const { t } = useTranslation();

  return (
    <div
      className={cn(
        'flex items-center justify-center gap-2 rounded-lg border border-dashed border-border/80 bg-card/60 py-12 text-muted-foreground',
        fullScreen && 'h-screen rounded-none border-0 bg-transparent',
        className
      )}
    >
      <Loader2 className="h-5 w-5 animate-spin" />
      <span className="text-sm">{t(textKey)}</span>
    </div>
  );
}
