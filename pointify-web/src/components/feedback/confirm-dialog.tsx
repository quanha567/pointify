import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Loader2Icon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: React.ReactNode;
  description: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'default' | 'destructive';
  isLoading?: boolean;
  onConfirm: () => void | Promise<void>;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Xác nhận',
  cancelLabel = 'Hủy',
  variant = 'default',
  isLoading = false,
  onConfirm,
}: ConfirmDialogProps) {
  const handleConfirm = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    await onConfirm();
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-md bg-card/95 backdrop-blur-xl border border-border shadow-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-base font-semibold text-foreground">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-4 gap-2 sm:gap-2">
          <AlertDialogCancel
            disabled={isLoading}
            className="h-8.5 px-3 text-xs bg-secondary hover:bg-secondary/80 text-secondary-foreground border-border rounded-lg cursor-pointer"
          >
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isLoading}
            className={cn(
              'h-8.5 px-3.5 text-xs font-semibold rounded-lg cursor-pointer transition-all active:scale-[0.98]',
              variant === 'destructive'
                ? 'bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-xs'
                : 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs',
            )}
          >
            {isLoading && <Loader2Icon className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
