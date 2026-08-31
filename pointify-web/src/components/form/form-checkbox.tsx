import * as React from 'react';
import { useField, type AnyFieldApi } from '@tanstack/react-form';
import { useTranslation } from 'react-i18next';
import { useFormContext } from './form';
import {
  Field,
  FieldContent,
  FieldLabel,
  FieldDescription,
  FieldError,
} from '@/components/ui/field';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

export interface FormCheckboxProps extends Omit<
  React.ComponentProps<typeof Checkbox>,
  'name' | 'checked' | 'defaultChecked' | 'onCheckedChange'
> {
  name: string;
  label?: React.ReactNode;
  description?: React.ReactNode;
  required?: boolean;
  containerClassName?: string;
}

/**
 * Shorthand Checkbox connected to boolean form state.
 */
export function FormCheckbox({
  name,
  label,
  description,
  required,
  className,
  containerClassName,
  disabled,
  ...props
}: FormCheckboxProps) {
  const { t } = useTranslation();
  const form = useFormContext();
  const field = useField({ form, name }) as AnyFieldApi;

  const rawErrors = field.state.meta.errors;
  const errors = rawErrors?.map((err: any) => {
    const rawMsg = typeof err === 'string' ? err : err?.message;
    if (!rawMsg) return err;
    return { message: t(rawMsg, { defaultValue: rawMsg }) };
  });
  const isInvalid = Boolean(field.state.meta.isTouched && errors?.length);
  const isChecked = Boolean(field.state.value);

  return (
    <Field
      orientation="horizontal"
      data-invalid={isInvalid}
      className={cn('w-full items-start gap-3', containerClassName)}
    >
      <Checkbox
        id={name}
        name={name}
        checked={isChecked}
        onCheckedChange={(checked) => field.handleChange(Boolean(checked))}
        disabled={disabled}
        aria-invalid={isInvalid}
        className={cn('mt-0.5 shrink-0', className)}
        {...props}
      />

      {(label || description) && (
        <FieldContent>
          {label && (
            <FieldLabel htmlFor={name} className="cursor-pointer font-medium">
              {label}
              {required && <span className="text-destructive ml-0.5">*</span>}
            </FieldLabel>
          )}
          {description && <FieldDescription>{description}</FieldDescription>}
        </FieldContent>
      )}

      {isInvalid && <FieldError errors={errors} className="basis-full" />}
    </Field>
  );
}
