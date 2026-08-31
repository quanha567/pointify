import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from 'radix-ui';
import { cn } from '@/lib/utils';

export const typographyVariants = cva('font-sans', {
  variants: {
    variant: {
      h1: 'scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl text-foreground',
      h2: 'scroll-m-20 text-3xl font-semibold tracking-tight first:mt-0 text-foreground',
      h3: 'scroll-m-20 text-2xl font-semibold tracking-tight text-foreground',
      h4: 'scroll-m-20 text-xl font-semibold tracking-tight text-foreground',
      p: 'leading-7 text-sm sm:text-base text-foreground',
      blockquote: 'mt-6 border-l-2 pl-6 italic text-muted-foreground',
      lead: 'text-xl text-muted-foreground',
      large: 'text-lg font-semibold text-foreground',
      small: 'text-xs sm:text-sm font-medium leading-none text-foreground',
      muted: 'text-xs text-muted-foreground',
      code: 'relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-xs font-semibold text-foreground',
      // Specialized Admin / Navigation Tokens
      navTitle: 'text-xs font-bold tracking-tight text-foreground truncate',
      navSubtitle: 'text-[10px] text-muted-foreground font-mono truncate',
      navGroupLabel: 'text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/80',
      navItem: 'truncate text-xs font-medium text-inherit',
    },
  },
  defaultVariants: {
    variant: 'p',
  },
});

type HtmlTag =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'p'
  | 'span'
  | 'div'
  | 'small'
  | 'blockquote'
  | 'code';

const defaultElementMap: Record<string, HtmlTag> = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  p: 'p',
  blockquote: 'blockquote',
  lead: 'p',
  large: 'div',
  small: 'small',
  muted: 'p',
  code: 'code',
  navTitle: 'span',
  navSubtitle: 'span',
  navGroupLabel: 'span',
  navItem: 'span',
};

export interface TypographyProps
  extends React.HTMLAttributes<HTMLElement>, VariantProps<typeof typographyVariants> {
  asChild?: boolean;
  as?: HtmlTag;
}

export const Typography = React.forwardRef<HTMLElement, TypographyProps>(
  ({ className, variant = 'p', asChild = false, as, ...props }, ref) => {
    if (asChild) {
      return (
        <Slot.Root
          ref={ref as any}
          data-slot="typography"
          className={cn(typographyVariants({ variant, className }))}
          {...props}
        />
      );
    }

    const Tag = as || (variant ? defaultElementMap[variant] : 'p') || 'p';

    return React.createElement(Tag, {
      ref,
      'data-slot': 'typography',
      className: cn(typographyVariants({ variant, className })),
      ...props,
    });
  },
);

Typography.displayName = 'Typography';

// Shorthand helpers for direct usage
export function TypographyH1(props: TypographyProps) {
  return <Typography variant="h1" {...props} />;
}

export function TypographyH2(props: TypographyProps) {
  return <Typography variant="h2" {...props} />;
}

export function TypographyH3(props: TypographyProps) {
  return <Typography variant="h3" {...props} />;
}

export function TypographyH4(props: TypographyProps) {
  return <Typography variant="h4" {...props} />;
}

export function TypographyP(props: TypographyProps) {
  return <Typography variant="p" {...props} />;
}

export function TypographyLead(props: TypographyProps) {
  return <Typography variant="lead" {...props} />;
}

export function TypographyLarge(props: TypographyProps) {
  return <Typography variant="large" {...props} />;
}

export function TypographySmall(props: TypographyProps) {
  return <Typography variant="small" {...props} />;
}

export function TypographyMuted(props: TypographyProps) {
  return <Typography variant="muted" {...props} />;
}

export function TypographyCode(props: TypographyProps) {
  return <Typography variant="code" {...props} />;
}
