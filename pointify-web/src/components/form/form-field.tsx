import * as React from 'react';
import { useField, type AnyFieldApi } from '@tanstack/react-form';
import { useFormContext } from './form';
import { Field, FieldLabel, FieldDescription, FieldError } from '@/components/ui/field';
import { cn } from '@/lib/utils';

export interface FormFieldProps {
  name: string;
  label?: React.ReactNode;
  description?: React.ReactNode;
  required?: boolean;
  orientation?: 'vertical' | 'horizontal' | 'responsive';
  className?: string;
  children: (field: AnyFieldApi) => React.ReactNode;
}

/**
 * Composable generic FormField wrapper integrating TanStack Form Field with UI primitives.
 */
export function FormField({
  name,
  label,
  description,
  required,
  orientation = 'vertical',
  className,
  children,
}: FormFieldProps) {
  const form = useFormContext();
  const field = useField({ form, name }) as AnyFieldApi;

  const rawErrors = field.state.meta.errors;
  const errors = rawErrors?.map((err: any) => {
    const rawMsg = typeof err === 'string' ? err : err?.message;
    if (!rawMsg) return err;
    return { message: rawMsg };
  });
  const isInvalid = Boolean(field.state.meta.isTouched && errors?.length);

  return (
    <Field orientation={orientation} data-invalid={isInvalid} className={cn('w-full', className)}>
      {label && (
        <FieldLabel htmlFor={name}>
          {label}
          {required && <span className="text-destructive ml-0.5">*</span>}
        </FieldLabel>
      )}
      {children(field)}
      {description && <FieldDescription>{description}</FieldDescription>}
      {isInvalid && <FieldError errors={errors} />}
    </Field>
  );
}
