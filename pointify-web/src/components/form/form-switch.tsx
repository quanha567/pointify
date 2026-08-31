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
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

export interface FormSwitchProps extends Omit<
  React.ComponentProps<typeof Switch>,
  'name' | 'checked' | 'defaultChecked' | 'onCheckedChange'
> {
  name: string;
  label?: React.ReactNode;
  description?: React.ReactNode;
  required?: boolean;
  containerClassName?: string;
}

/**
 * Shorthand Toggle Switch connected to boolean form state.
 */
export function FormSwitch({
  name,
  label,
  description,
  required,
  className,
  containerClassName,
  disabled,
  ...props
}: FormSwitchProps) {
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
      className={cn('w-full justify-between items-center', containerClassName)}
    >
      {(label || description) && (
        <FieldContent>
          {label && (
            <FieldLabel htmlFor={name} className="cursor-pointer">
              {label}
              {required && <span className="text-destructive ml-0.5">*</span>}
            </FieldLabel>
          )}
          {description && <FieldDescription>{description}</FieldDescription>}
        </FieldContent>
      )}

      <Switch
        id={name}
        name={name}
        checked={isChecked}
        onCheckedChange={(checked) => field.handleChange(checked)}
        disabled={disabled}
        aria-invalid={isInvalid}
        className={cn('cursor-pointer shrink-0', className)}
        {...props}
      />

      {isInvalid && <FieldError errors={errors} className="basis-full" />}
    </Field>
  );
}
