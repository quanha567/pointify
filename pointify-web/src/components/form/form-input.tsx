import * as React from 'react';
import { FormField } from './form-field';
import { Input } from '@/components/ui/input';
import { InputGroup, InputGroupAddon } from '@/components/ui/input-group';
import { cn } from '@/lib/utils';

export interface FormInputProps extends Omit<
  React.ComponentProps<typeof Input>,
  'name' | 'value' | 'defaultValue' | 'onChange' | 'onBlur' | 'prefix'
> {
  name: string;
  label?: React.ReactNode;
  description?: React.ReactNode;
  required?: boolean;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  containerClassName?: string;
}

/**
 * Shorthand text/email/password/number input connected to form state.
 */
export function FormInput({
  name,
  label,
  description,
  required,
  prefix,
  suffix,
  className,
  containerClassName,
  disabled,
  placeholder,
  type = 'text',
  ...props
}: FormInputProps) {
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

        if (prefix || suffix) {
          return (
            <InputGroup
              data-slot="input-group"
              className={cn(
                'relative flex h-10 w-full min-w-0 items-center rounded-xl border border-input bg-muted/30 transition-colors outline-none focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50 focus-within:bg-background',
                isInvalid &&
                  'border-destructive ring-[3px] ring-destructive/20 focus-within:border-destructive focus-within:ring-destructive/20',
                className,
              )}
            >
              {prefix && (
                <InputGroupAddon align="inline-start" className="pl-3 pr-1 text-muted-foreground">
                  {prefix}
                </InputGroupAddon>
              )}
              <input
                id={name}
                name={name}
                type={type}
                value={field.state.value ?? ''}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                disabled={disabled}
                placeholder={placeholder}
                aria-invalid={isInvalid}
                className="h-full w-full flex-1 bg-transparent px-2 text-sm text-foreground placeholder:text-muted-foreground outline-none border-0 ring-0 focus:outline-none focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50"
                {...props}
              />
              {suffix && (
                <InputGroupAddon align="inline-end" className="pr-3 pl-1 text-muted-foreground">
                  {suffix}
                </InputGroupAddon>
              )}
            </InputGroup>
          );
        }

        return (
          <Input
            id={name}
            name={name}
            type={type}
            value={field.state.value ?? ''}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
            disabled={disabled}
            placeholder={placeholder}
            aria-invalid={isInvalid}
            className={cn(
              'rounded-xl h-10 text-sm bg-muted/30 focus-visible:bg-background',
              className,
            )}
            {...props}
          />
        );
      }}
    </FormField>
  );
}
