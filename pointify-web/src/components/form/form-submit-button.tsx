import * as React from 'react';
import { useFormContextState } from './form';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

export interface FormSubmitButtonProps extends React.ComponentProps<typeof Button> {
  loading?: boolean;
  loadingText?: React.ReactNode;
}

/**
 * Submit button that automatically subscribes to form submission state and displays a loading spinner.
 */
export function FormSubmitButton({
  children,
  loading: externalLoading,
  loadingText,
  disabled,
  className,
  type = 'submit',
  ...props
}: FormSubmitButtonProps) {
  const isSubmitting = useFormContextState((state) => state.isSubmitting);
  const isLoading = externalLoading ?? isSubmitting;

  return (
    <Button
      type={type}
      disabled={disabled || isLoading}
      className={cn('relative', className)}
      {...props}
    >
      {isLoading ? (
        <>
          <Spinner className="size-4" />
          <span>{loadingText ?? children}</span>
        </>
      ) : (
        children
      )}
    </Button>
  );
}
