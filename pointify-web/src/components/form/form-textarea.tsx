import * as React from 'react';
import { FormField } from './form-field';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

export interface FormTextareaProps extends Omit<
  React.ComponentProps<typeof Textarea>,
  'name' | 'value' | 'defaultValue' | 'onChange' | 'onBlur'
> {
  name: string;
  label?: React.ReactNode;
  description?: React.ReactNode;
  required?: boolean;
  containerClassName?: string;
}

/**
 * Shorthand multiline Textarea connected to form state.
 */
export function FormTextarea({
  name,
  label,
  description,
  required,
  className,
  containerClassName,
  disabled,
  placeholder,
  ...props
}: FormTextareaProps) {
  return (
    <FormField
      name={name}
      label={label}
      description={description}
      required={required}
      className={containerClassName}
    >
      {(field) => {
        const isInvalid = Boolean(field.state.meta.isTouched && field.state.meta.errors?.length);

        return (
          <Textarea
            id={name}
            name={name}
            value={field.state.value ?? ''}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
            disabled={disabled}
            placeholder={placeholder}
            aria-invalid={isInvalid}
            className={cn(className)}
            {...props}
          />
        );
      }}
    </FormField>
  );
}
