import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { FormField, ImageUploader } from '@/components/shared';
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Textarea,
} from '@/components/ui';
import { createCategorySchema } from '@/features/categories/schemas/category-form-schema';
import { type Category, type CreateCategoryInput } from '@/features/categories/types/category-types';

interface CategoryFormDialogProps {
  open: boolean;
  mode: 'create' | 'edit';
  defaultCategory?: Category;
  isSubmitting?: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: CreateCategoryInput) => void;
}

interface FormValues {
  name: string;
  description: string;
  imageFile?: File;
}

const defaultFormValues: FormValues = {
  name: '',
  description: '',
  imageFile: undefined,
};

export function CategoryFormDialog({
  open,
  mode,
  defaultCategory,
  isSubmitting = false,
  onOpenChange,
  onSubmit,
}: CategoryFormDialogProps): React.JSX.Element {
  const { t } = useTranslation();

  const [formValues, setFormValues] = useState<FormValues>(defaultFormValues);
  const [errors, setErrors] = useState<Partial<Record<keyof FormValues, string>>>({});

  useEffect(() => {
    if (!open) {
      return;
    }

    setErrors({});

    if (mode === 'edit' && defaultCategory) {
      setFormValues({
        name: defaultCategory.name,
        description: defaultCategory.description ?? '',
        imageFile: undefined,
      });
      return;
    }

    setFormValues(defaultFormValues);
  }, [defaultCategory, mode, open]);

  const dialogTitleKey = useMemo(() => {
    return mode === 'create' ? 'categories.createCategory' : 'categories.editCategory';
  }, [mode]);

  const submitHandler = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();

    const parsed = createCategorySchema.safeParse(formValues);

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;

      setErrors({
        name: fieldErrors.name?.[0],
        description: fieldErrors.description?.[0],
        imageFile: fieldErrors.imageFile?.[0],
      });
      return;
    }

    setErrors({});
    onSubmit(parsed.data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t(dialogTitleKey)}</DialogTitle>
        </DialogHeader>

        <form onSubmit={submitHandler} className="space-y-4">
          <FormField labelKey="common.name" htmlFor="category-name" required error={errors.name}>
            <Input
              id="category-name"
              value={formValues.name}
              placeholder={t('categories.form.namePlaceholder')}
              onChange={(event) =>
                setFormValues((previous) => ({
                  ...previous,
                  name: event.target.value,
                }))
              }
            />
          </FormField>

          <FormField labelKey="categories.form.description" htmlFor="category-description" error={errors.description}>
            <Textarea
              id="category-description"
              rows={3}
              value={formValues.description}
              placeholder={t('categories.form.descriptionPlaceholder')}
              onChange={(event) =>
                setFormValues((previous) => ({
                  ...previous,
                  description: event.target.value,
                }))
              }
            />
          </FormField>

          <FormField labelKey="categories.form.imagePath" htmlFor="category-image" error={errors.imageFile}>
            <ImageUploader
              id="category-image"
              value={formValues.imageFile}
              currentImagePath={mode === 'edit' ? defaultCategory?.imagePath : undefined}
              disabled={isSubmitting}
              onChange={(imageFile) =>
                setFormValues((previous) => ({
                  ...previous,
                  imageFile,
                }))
              }
            />
          </FormField>

          <DialogFooter className="gap-2">
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {mode === 'create' ? t('common.create') : t('common.update')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
