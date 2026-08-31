import * as React from 'react';
import { FormField } from './form-field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  NativeSelect,
  NativeSelectOption,
  NativeSelectOptGroup,
} from '@/components/ui/native-select';
import { cn } from '@/lib/utils';

export interface FormSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface FormSelectProps {
  name: string;
  label?: React.ReactNode;
  description?: React.ReactNode;
  required?: boolean;
  placeholder?: string;
  options?: FormSelectOption[];
  children?: React.ReactNode;
  containerClassName?: string;
  triggerClassName?: string;
  disabled?: boolean;
}

/**
 * Shorthand Radix UI Select dropdown connected to form state.
 */
export function FormSelect({
  name,
  label,
  description,
  required,
  placeholder,
  options,
  children,
  containerClassName,
  triggerClassName,
  disabled,
}: FormSelectProps) {
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
          <Select
            value={field.state.value ?? ''}
            onValueChange={(val) => field.handleChange(val)}
            disabled={disabled}
          >
            <SelectTrigger
              id={name}
              aria-invalid={isInvalid}
              className={cn('w-full', triggerClassName)}
            >
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options
                ? options.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value} disabled={opt.disabled}>
                      {opt.label}
                    </SelectItem>
                  ))
                : children}
            </SelectContent>
          </Select>
        );
      }}
    </FormField>
  );
}

export interface FormNativeSelectProps extends Omit<
  React.ComponentProps<typeof NativeSelect>,
  'name' | 'value' | 'defaultValue' | 'onChange' | 'onBlur'
> {
  name: string;
  label?: React.ReactNode;
  description?: React.ReactNode;
  required?: boolean;
  options?: FormSelectOption[];
  containerClassName?: string;
}

/**
 * Shorthand HTML Native Select connected to form state.
 */
export function FormNativeSelect({
  name,
  label,
  description,
  required,
  options,
  children,
  className,
  containerClassName,
  disabled,
  ...props
}: FormNativeSelectProps) {
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
          <NativeSelect
            id={name}
            name={name}
            value={field.state.value ?? ''}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
            disabled={disabled}
            aria-invalid={isInvalid}
            className={cn('w-full', className)}
            {...props}
          >
            {options
              ? options.map((opt) => (
                  <NativeSelectOption key={opt.value} value={opt.value} disabled={opt.disabled}>
                    {opt.label}
                  </NativeSelectOption>
                ))
              : children}
          </NativeSelect>
        );
      }}
    </FormField>
  );
}

export { NativeSelectOption, NativeSelectOptGroup };
