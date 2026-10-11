import { cn } from '@/lib/utils';

interface RodoBrandLogoProps {
  compact?: boolean;
  className?: string;
}

/** Official artwork shared with the RODO mobile app. */
export function RodoBrandLogo({
  compact = false,
  className,
}: RodoBrandLogoProps): React.JSX.Element {
  return (
    <img
      src={compact ? '/branding/rodo-icon.png' : '/branding/rodo-wordmark.png'}
      alt="RODO | رودو"
      className={cn(
        'select-none object-contain',
        compact ? 'h-10 w-10 rounded-xl' : 'h-12 w-40',
        className
      )}
      draggable={false}
    />
  );
}
