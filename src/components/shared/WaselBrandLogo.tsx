import { cn } from '@/lib/utils';

interface WaselBrandLogoProps {
  compact?: boolean;
  className?: string;
}

export function WaselBrandLogo({
  compact = false,
  className,
}: WaselBrandLogoProps): React.JSX.Element {
  return (
    <img
      src="/branding/wasel-logo-official.png"
      alt="واصل"
      className={cn(
        'select-none object-contain',
        compact ? 'h-8 w-20' : 'h-12 w-40',
        className
      )}
      draggable={false}
    />
  );
}
