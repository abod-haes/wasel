import { CalendarDays, Clock3 } from 'lucide-react';

import { Input } from '@/components/ui';
import { cn } from '@/lib/utils';

interface DateTimeFieldProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
  min?: string;
}

const splitDateTime = (value: string): { date: string; time: string } => {
  if (!value) return { date: '', time: '' };

  const [date = '', rawTime = ''] = value.split('T');
  return {
    date,
    time: rawTime.slice(0, 5),
  };
};

export function DateTimeField({
  value,
  onChange,
  disabled = false,
  className,
  min,
}: DateTimeFieldProps): React.JSX.Element {
  const current = splitDateTime(value);
  const minimum = splitDateTime(min ?? '');

  const updateDate = (date: string): void => {
    if (!date) {
      onChange('');
      return;
    }

    onChange(`${date}T${current.time || '00:00'}`);
  };

  const updateTime = (time: string): void => {
    if (!time) {
      onChange(current.date ? `${current.date}T00:00` : '');
      return;
    }

    const date = current.date || new Date().toISOString().slice(0, 10);
    onChange(`${date}T${time}`);
  };

  return (
    <div className={cn('grid grid-cols-[1.2fr_0.8fr] gap-2', className)}>
      <div className="relative">
        <CalendarDays className="pointer-events-none absolute start-3.5 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="date"
          dir="ltr"
          value={current.date}
          min={minimum.date || undefined}
          disabled={disabled}
          onChange={(event) => updateDate(event.target.value)}
          className="ps-10 text-start [color-scheme:light] dark:[color-scheme:dark]"
        />
      </div>

      <div className="relative">
        <Clock3 className="pointer-events-none absolute start-3.5 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="time"
          dir="ltr"
          value={current.time}
          min={current.date && current.date === minimum.date ? minimum.time || undefined : undefined}
          disabled={disabled}
          onChange={(event) => updateTime(event.target.value)}
          className="ps-10 text-start [color-scheme:light] dark:[color-scheme:dark]"
        />
      </div>
    </div>
  );
}
