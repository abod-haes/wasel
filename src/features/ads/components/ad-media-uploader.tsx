import { Film, ImagePlus, Upload, X } from 'lucide-react';
import { useEffect, useId, useRef, useState, type DragEvent, type KeyboardEvent } from 'react';

import { Button } from '@/components/ui';
import type { AdMediaType } from '@/features/ads/types/ad-types';
import { cn, resolveMediaPath } from '@/lib/utils';

interface AdMediaUploaderProps {
  id?: string;
  value?: File;
  currentMediaPath?: string;
  currentMediaType?: AdMediaType;
  disabled?: boolean;
  onChange: (file: File | undefined) => void;
}

const ACCEPTED_MEDIA = '.png,.jpg,.jpeg,.webp,.gif,.mp4,.webm,.mov,image/png,image/jpeg,image/webp,image/gif,video/mp4,video/webm,video/quicktime';

const inferMediaType = (file: File): AdMediaType => {
  if (file.type.startsWith('video/')) return 'video';
  if (file.type === 'image/gif' || file.name.toLowerCase().endsWith('.gif')) return 'gif';
  return 'image';
};

const formatFileSize = (size: number): string => {
  if (size < 1024 * 1024) return `${Math.max(1, Math.round(size / 1024))} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

export function AdMediaUploader({
  id,
  value,
  currentMediaPath,
  currentMediaType,
  disabled = false,
  onChange,
}: AdMediaUploaderProps): React.JSX.Element {
  const generatedId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>();
  const inputId = id ?? generatedId;

  useEffect(() => {
    if (!value) {
      setPreviewUrl(undefined);
      return;
    }
    const objectUrl = URL.createObjectURL(value);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [value]);

  const mediaUrl = previewUrl ?? (currentMediaPath ? resolveMediaPath(currentMediaPath) : undefined);
  const mediaType = value ? inferMediaType(value) : currentMediaType;

  const chooseFile = (): void => {
    if (!disabled) inputRef.current?.click();
  };

  const setSelectedFile = (files: FileList | null): void => {
    const file = files?.[0];
    if (!file) return;
    onChange(file);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>): void => {
    event.preventDefault();
    setIsDragging(false);
    if (!disabled) setSelectedFile(event.dataTransfer.files);
  };

  const handleKeyboard = (event: KeyboardEvent<HTMLDivElement>): void => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    chooseFile();
  };

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={ACCEPTED_MEDIA}
        disabled={disabled}
        className="sr-only"
        onChange={(event) => setSelectedFile(event.target.files)}
      />
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
        className={cn(
          'flex min-h-48 cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-dashed bg-card/60 p-4 transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/15',
          isDragging && 'border-primary bg-primary/5',
          disabled && 'cursor-not-allowed opacity-60'
        )}
        onClick={chooseFile}
        onKeyDown={handleKeyboard}
        onDragOver={(event) => { event.preventDefault(); if (!disabled) setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        {mediaUrl ? (
          <div className="grid w-full items-center gap-4 sm:grid-cols-[180px_1fr]">
            <div className="flex h-36 w-full items-center justify-center overflow-hidden rounded-lg border bg-background sm:w-44">
              {mediaType === 'video' ? (
                <video src={mediaUrl} className="h-full w-full object-cover" muted controls preload="metadata" />
              ) : (
                <img src={mediaUrl} alt="معاينة الإعلان" className="h-full w-full object-cover" />
              )}
            </div>
            <div className="space-y-2 text-sm">
              <p className="font-semibold">{value ? 'الملف المختار' : 'الملف الحالي'}</p>
              <p className="break-all text-muted-foreground">{value?.name ?? currentMediaPath}</p>
              {value ? <p className="text-xs text-muted-foreground">{formatFileSize(value.size)}</p> : null}
              <p className="text-xs text-muted-foreground">PNG, JPG, WEBP, GIF, MP4, WEBM, MOV — حتى 100 MB</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-lg border bg-background text-muted-foreground">
              <ImagePlus className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold">اختر صورة أو GIF أو فيديو</p>
              <p className="mt-1 text-xs text-muted-foreground">اسحب الملف هنا أو اختره من جهازك</p>
            </div>
          </div>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" onClick={chooseFile} disabled={disabled}>
          <Upload className="h-4 w-4" />
          {mediaUrl ? 'تغيير الملف' : 'اختيار ملف'}
        </Button>
        {value ? (
          <Button type="button" variant="ghost" size="sm" onClick={() => onChange(undefined)} disabled={disabled}>
            <X className="h-4 w-4" />
            إزالة الاختيار
          </Button>
        ) : null}
        {mediaType === 'video' ? <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><Film className="h-3.5 w-3.5" />فيديو</span> : null}
      </div>
    </div>
  );
}
