import { ImagePlus, Upload, X } from 'lucide-react';
import { useEffect, useId, useRef, useState, type DragEvent, type KeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui';
import { cn, resolveMediaPath } from '@/lib/utils';

interface ImageUploaderProps {
  id?: string;
  value?: File;
  currentImagePath?: string;
  disabled?: boolean;
  accept?: string;
  onChange: (file: File | undefined) => void;
}

const getFileNameFromPath = (path?: string): string | undefined => {
  if (!path) {
    return undefined;
  }

  const cleanPath = path.split(/[?#]/)[0];
  return cleanPath.split('/').filter(Boolean).pop();
};

export function ImageUploader({
  id,
  value,
  currentImagePath,
  disabled = false,
  accept = 'image/*',
  onChange,
}: ImageUploaderProps): React.JSX.Element {
  const { t } = useTranslation();
  const generatedId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>();

  const inputId = id ?? generatedId;
  const currentImageUrl = currentImagePath ? resolveMediaPath(currentImagePath) : undefined;
  const imageUrl = previewUrl ?? currentImageUrl;
  const imageName = value?.name ?? getFileNameFromPath(currentImagePath);

  useEffect(() => {
    if (!value) {
      setPreviewUrl(undefined);
      return;
    }

    const objectUrl = URL.createObjectURL(value);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [value]);

  const chooseFile = (): void => {
    if (disabled) {
      return;
    }

    inputRef.current?.click();
  };

  const setSelectedFile = (files: FileList | null): void => {
    const file = files?.[0];

    if (!file || !file.type.startsWith('image/')) {
      return;
    }

    onChange(file);

    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>): void => {
    event.preventDefault();
    setIsDragging(false);

    if (disabled) {
      return;
    }

    setSelectedFile(event.dataTransfer.files);
  };

  const handleKeyboardChoose = (event: KeyboardEvent<HTMLDivElement>): void => {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return;
    }

    event.preventDefault();
    chooseFile();
  };

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={accept}
        disabled={disabled}
        className="sr-only"
        onChange={(event) => setSelectedFile(event.target.files)}
      />

      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
        className={cn(
          'flex min-h-44 w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-dashed border-border/80 bg-card/65 p-4 text-start transition-colors focus-visible:border-primary/60 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/15',
          isDragging && 'border-primary/70 bg-primary/5',
          disabled && 'cursor-not-allowed opacity-60'
        )}
        onClick={chooseFile}
        onKeyDown={handleKeyboardChoose}
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled) {
            setIsDragging(true);
          }
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        {imageUrl ? (
          <div className="grid w-full items-center gap-4 sm:grid-cols-[112px_1fr]">
            <div className="h-28 w-28 overflow-hidden rounded-lg border border-border/70 bg-background">
              <img
                src={imageUrl}
                alt={imageName ?? t('imageUploader.current')}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="min-w-0 space-y-2">
              <p className="text-sm font-semibold text-foreground">
                {value ? t('imageUploader.selected') : t('imageUploader.current')}
              </p>
              {imageName ? (
                <p className="truncate text-sm text-muted-foreground" title={imageName}>
                  {imageName}
                </p>
              ) : null}
              <p className="text-xs text-muted-foreground">{t('imageUploader.dropHint')}</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-lg border border-border/70 bg-background text-muted-foreground">
              <ImagePlus className="h-5 w-5" />
            </span>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">{t('imageUploader.choose')}</p>
              <p className="text-xs text-muted-foreground">{t('imageUploader.dropHint')}</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="rounded-lg"
          disabled={disabled}
          onClick={chooseFile}
        >
          <Upload className="h-4 w-4" />
          {imageUrl ? t('imageUploader.change') : t('imageUploader.choose')}
        </Button>

        {value ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="rounded-lg"
            disabled={disabled}
            onClick={() => onChange(undefined)}
          >
            <X className="h-4 w-4" />
            {t('imageUploader.removeSelection')}
          </Button>
        ) : null}

        {currentImageUrl && !value ? (
          <Button type="button" variant="ghost" size="sm" className="rounded-lg" asChild>
            <a href={currentImageUrl} target="_blank" rel="noreferrer" onClick={(event) => event.stopPropagation()}>
              {t('imageUploader.openCurrent')}
            </a>
          </Button>
        ) : null}
      </div>
    </div>
  );
}
