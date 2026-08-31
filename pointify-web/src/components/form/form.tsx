import * as React from 'react';
import {
  useForm,
  useStore,
  useField,
  createFormHookContexts,
  type AnyFormApi,
  type AnyFieldApi,
  type FormOptions,
} from '@tanstack/react-form';
import type { ZodType } from 'zod';
import { cn } from '@/lib/utils';

export const { fieldContext, formContext, useFieldContext } = createFormHookContexts();

export type { AnyFormApi, AnyFieldApi };

/**
 * Access the current form instance from within a <Form> provider component.
 */
export function useFormContext(): AnyFormApi {
  const context = React.useContext(formContext);
  if (!context) {
    throw new Error('useFormContext must be used within a <Form> provider component');
  }
  return context;
}

/**
 * Subscribe to reactive form state updates (e.g. isSubmitting, isValid, canSubmit, isDirty)
 */
export function useFormContextState<T = any>(selector?: (state: any) => T): T {
  const form = useFormContext();
  return useStore(form.store, selector as any);
}

export interface UseAppFormOptions<TFormData> extends Partial<
  FormOptions<TFormData, any, any, any, any, any, any, any, any, any, any, any>
> {
  defaultValues: TFormData;
  schema?: ZodType<any>;
}

/**
 * Enhanced useForm hook with automatic Zod schema standard validation.
 */
export function useAppForm<TFormData extends Record<string, any>>({
  defaultValues,
  schema,
  validators,
  ...restOptions
}: UseAppFormOptions<TFormData>) {
  return useForm({
    defaultValues,
    validators: {
      ...validators,
      ...(schema ? { onChange: schema } : {}),
    },
    ...(restOptions as any),
  });
}

export interface FormProps extends Omit<React.ComponentProps<'form'>, 'onSubmit'> {
  form: AnyFormApi;
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
  children: React.ReactNode;
}

/**
 * Form provider and standard HTML form wrapper utilizing TanStack's formContext.Provider.
 */
export function Form({ form, onSubmit, className, children, ...props }: FormProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (onSubmit) {
      onSubmit(e);
    } else {
      void form.handleSubmit();
    }
  };

  return (
    <formContext.Provider value={form}>
      <form onSubmit={handleSubmit} noValidate className={cn('w-full', className)} {...props}>
        {children}
      </form>
    </formContext.Provider>
  );
}

export { useField, useStore };
