'use client';
// beui.dev/components/motion/animated-sidebar
// Custom-tuned for Pointify & ONE Corporate B2B Architecture

import { ChevronRight, PanelLeftIcon } from 'lucide-react';
import {
  AnimatePresence,
  type HTMLMotionProps,
  motion,
  useReducedMotion,
  type Variants,
} from 'motion/react';
import {
  type ButtonHTMLAttributes,
  type CSSProperties,
  createContext,
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from '@tanstack/react-router';
import { EASE_DRAWER, EASE_OUT, SPRING_LAYOUT, SPRING_PRESS } from '@/lib/ease';
import { cn } from '@/lib/utils';

type SidebarState = 'expanded' | 'collapsed';
type SidebarSide = 'left' | 'right';
type SidebarVariant = 'sidebar' | 'floating' | 'inset';
type SidebarCollapsible = 'offcanvas' | 'icon' | 'none';

const MOBILE_QUERY = '(max-width: 767px)';
const SIDEBAR_KEYBOARD_SHORTCUT = 'b';
export const SIDEBAR_STORAGE_KEY = 'pointify_admin_sidebar_state';

const PANEL_TRANSITION = {
  duration: 0.25,
  ease: EASE_DRAWER,
} as const;

// Critically damped spring for ONE Enterprise responsiveness (transition <= 200ms)
const SIDEBAR_MORPH_TRANSITION = {
  type: 'spring',
  stiffness: 420,
  damping: 38,
  mass: 0.6,
} as const;

const LABEL_ENTER_TRANSITION = {
  duration: 0.16,
  delay: 0.04,
  ease: EASE_OUT,
} as const;

const LABEL_EXIT_TRANSITION = {
  duration: 0.1,
  ease: EASE_OUT,
} as const;

const SUBMENU_TRANSITION = {
  duration: 0.16,
  ease: EASE_OUT,
} as const;

const SUBMENU_VARIANTS: Variants = {
  closed: {
    opacity: 0,
    clipPath: 'inset(0 0 100% 0 round 8px)',
    transition: {
      duration: 0.12,
      ease: EASE_OUT,
      staggerChildren: 0.02,
      staggerDirection: -1,
    },
  },
  open: {
    opacity: 1,
    clipPath: 'inset(0 0 0% 0 round 8px)',
    transition: {
      duration: 0.16,
      delayChildren: 0.02,
      ease: EASE_OUT,
      staggerChildren: 0.03,
    },
  },
};

const SUBMENU_ITEM_VARIANTS: Variants = {
  closed: {
    opacity: 0,
    y: -4,
    filter: 'blur(2px)',
  },
  open: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: SUBMENU_TRANSITION,
  },
};

const REDUCED_TRANSITION = {
  duration: 0.14,
  ease: EASE_OUT,
} as const;

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  "[tabindex]:not([tabindex='-1'])",
].join(',');

function subscribeToMobileQuery(callback: () => void) {
  const query = window.matchMedia(MOBILE_QUERY);
  query.addEventListener('change', callback);
  return () => query.removeEventListener('change', callback);
}

function getMobileSnapshot() {
  return window.matchMedia(MOBILE_QUERY).matches;
}

function getServerMobileSnapshot() {
  return false;
}

function useIsMobile() {
  return useSyncExternalStore(subscribeToMobileQuery, getMobileSnapshot, getServerMobileSnapshot);
}

interface AnimatedSidebarContextValue {
  isMobile: boolean;
  layoutId: string;
  open: boolean;
  openMobile: boolean;
  reduce: boolean;
  setOpen: (open: boolean) => void;
  setOpenMobile: (open: boolean) => void;
  state: SidebarState;
  toggleSidebar: () => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
}

const AnimatedSidebarContext = createContext<AnimatedSidebarContextValue | null>(null);

interface AnimatedSidebarPanelContextValue {
  collapsed: boolean;
  collapsible: SidebarCollapsible;
  side: SidebarSide;
}

const AnimatedSidebarPanelContext = createContext<AnimatedSidebarPanelContextValue | null>(null);

export function useAnimatedSidebar() {
  const context = useContext(AnimatedSidebarContext);
  if (!context) {
    throw new Error('useAnimatedSidebar must be used inside AnimatedSidebarProvider.');
  }
  return context;
}

export function useAnimatedSidebarPanel() {
  const context = useContext(AnimatedSidebarPanelContext);
  if (!context) {
    throw new Error('Animated Sidebar parts must be used inside AnimatedSidebar.');
  }
  return context;
}

type SidebarProviderStyle = CSSProperties & {
  '--sidebar-width'?: string;
  '--sidebar-width-icon'?: string;
  '--sidebar-width-mobile'?: string;
};

export interface AnimatedSidebarProviderProps extends HTMLAttributes<HTMLDivElement> {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  openMobile?: boolean;
  defaultOpenMobile?: boolean;
  onOpenMobileChange?: (open: boolean) => void;
  storageKey?: string;
  style?: SidebarProviderStyle;
}

export function AnimatedSidebarProvider({
  children,
  open,
  defaultOpen = true,
  onOpenChange,
  openMobile,
  defaultOpenMobile = false,
  onOpenMobileChange,
  storageKey = SIDEBAR_STORAGE_KEY,
  className,
  style,
  ...props
}: AnimatedSidebarProviderProps) {
  const [internalOpen, setInternalOpen] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && storageKey) {
      const stored = localStorage.getItem(storageKey);
      if (stored === 'collapsed') return false;
      if (stored === 'expanded') return true;
    }
    return defaultOpen;
  });

  const [internalOpenMobile, setInternalOpenMobile] = useState(defaultOpenMobile);
  const isMobile = useIsMobile();
  const reduce = useReducedMotion() ?? false;
  const generatedId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const desktopOpen = open !== undefined ? open : internalOpen;
  const mobileOpen = openMobile !== undefined ? openMobile : internalOpenMobile;

  const setOpen = useCallback(
    (nextOpen: boolean) => {
      if (open === undefined) {
        setInternalOpen(nextOpen);
        if (typeof window !== 'undefined' && storageKey) {
          localStorage.setItem(storageKey, nextOpen ? 'expanded' : 'collapsed');
        }
      }
      onOpenChange?.(nextOpen);
    },
    [onOpenChange, open, storageKey],
  );

  const setOpenMobile = useCallback(
    (nextOpen: boolean) => {
      if (openMobile === undefined) setInternalOpenMobile(nextOpen);
      onOpenMobileChange?.(nextOpen);
    },
    [onOpenMobileChange, openMobile],
  );

  const toggleSidebar = useCallback(() => {
    if (isMobile) setOpenMobile(!mobileOpen);
    else setOpen(!desktopOpen);
  }, [desktopOpen, isMobile, mobileOpen, setOpen, setOpenMobile]);

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if (
        event.key.toLowerCase() === SIDEBAR_KEYBOARD_SHORTCUT &&
        (event.metaKey || event.ctrlKey)
      ) {
        event.preventDefault();
        toggleSidebar();
      }
    };

    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, [toggleSidebar]);

  return (
    <AnimatedSidebarContext.Provider
      value={{
        isMobile,
        layoutId: `${generatedId}-active`,
        open: desktopOpen,
        openMobile: mobileOpen,
        reduce,
        setOpen,
        setOpenMobile,
        state: desktopOpen ? 'expanded' : 'collapsed',
        toggleSidebar,
        triggerRef,
      }}
    >
      <div
        {...props}
        data-slot="sidebar-wrapper"
        data-state={desktopOpen ? 'expanded' : 'collapsed'}
        style={{
          '--sidebar-width': '16rem',
          '--sidebar-width-icon': '4.25rem',
          '--sidebar-width-mobile': '18rem',
          ...style,
        }}
        className={cn('group/sidebar-wrapper flex min-h-svh w-full min-w-0', className)}
      >
        {children}
      </div>
    </AnimatedSidebarContext.Provider>
  );
}

function MobileSidebar({
  ariaLabel,
  children,
  className,
  side,
}: {
  ariaLabel: string;
  children: ReactNode;
  className?: string;
  side: SidebarSide;
}) {
  const context = useAnimatedSidebar();
  const panelRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [hidden, setHidden] = useState(!context.openMobile);
  const openMobileRef = useRef(context.openMobile);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    openMobileRef.current = context.openMobile;
    if (context.openMobile) setHidden(false);
  }, [context.openMobile]);

  useEffect(() => {
    if (!context.openMobile) return;

    const body = document.body;
    const scrollY = window.scrollY;
    const previousBodyStyles = {
      left: body.style.left,
      overflow: body.style.overflow,
      position: body.style.position,
      right: body.style.right,
      top: body.style.top,
    };

    body.style.position = 'fixed';
    body.style.top = `-${scrollY}px`;
    body.style.left = '0';
    body.style.right = '0';
    body.style.overflow = 'hidden';

    const focusFrame = requestAnimationFrame(() => {
      const firstFocusable = panelRef.current?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
      (firstFocusable ?? panelRef.current)?.focus({ preventScroll: true });
    });

    return () => {
      cancelAnimationFrame(focusFrame);
      body.style.position = previousBodyStyles.position;
      body.style.top = previousBodyStyles.top;
      body.style.left = previousBodyStyles.left;
      body.style.right = previousBodyStyles.right;
      body.style.overflow = previousBodyStyles.overflow;
      window.scrollTo(0, scrollY);
      context.triggerRef.current?.focus({ preventScroll: true });
    };
  }, [context.openMobile, context.triggerRef]);

  if (!mounted) return null;

  return createPortal(
    <div
      className={cn(
        'pointer-events-none fixed left-0 top-0 z-50 size-0 md:hidden',
        hidden && !context.openMobile ? 'invisible' : 'visible',
      )}
    >
      <motion.button
        type="button"
        aria-label="Close sidebar"
        tabIndex={context.openMobile ? 0 : -1}
        initial={false}
        animate={{ opacity: context.openMobile ? 1 : 0 }}
        transition={context.reduce ? REDUCED_TRANSITION : PANEL_TRANSITION}
        onClick={() => context.setOpenMobile(false)}
        className={cn(
          'fixed inset-0 bg-black/50 backdrop-blur-xs',
          context.openMobile ? 'pointer-events-auto' : 'pointer-events-none',
        )}
      />

      <motion.div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        aria-hidden={!context.openMobile}
        inert={!context.openMobile}
        tabIndex={-1}
        data-mobile="true"
        data-state={context.openMobile ? 'expanded' : 'collapsed'}
        data-side={side}
        initial={false}
        animate={{
          opacity: context.reduce ? (context.openMobile ? 1 : 0) : 1,
          x: context.reduce ? 0 : context.openMobile ? '0%' : side === 'left' ? '-100%' : '100%',
        }}
        transition={context.reduce ? REDUCED_TRANSITION : PANEL_TRANSITION}
        onAnimationComplete={() => {
          if (!openMobileRef.current) setHidden(true);
        }}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            event.preventDefault();
            context.setOpenMobile(false);
            return;
          }

          if (event.key !== 'Tab') return;
          const focusable = panelRef.current
            ? Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
            : [];

          if (focusable.length === 0) {
            event.preventDefault();
            panelRef.current?.focus();
            return;
          }

          const first = focusable[0];
          const last = focusable[focusable.length - 1];
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
          }
        }}
        className={cn(
          'pointer-events-auto fixed inset-y-0 flex h-dvh w-(--sidebar-width-mobile) max-w-[88vw] flex-col overflow-hidden',
          'border-sidebar-border bg-sidebar text-sidebar-foreground shadow-2xl will-change-transform',
          side === 'left' ? 'left-0 border-r' : 'right-0 border-l',
          !context.openMobile && 'pointer-events-none',
          className,
        )}
      >
        <AnimatedSidebarPanelContext.Provider
          value={{ collapsed: false, collapsible: 'none', side }}
        >
          {children}
        </AnimatedSidebarPanelContext.Provider>
      </motion.div>
    </div>,
    document.body,
  );
}

export interface AnimatedSidebarProps extends Omit<HTMLMotionProps<'aside'>, 'children'> {
  children?: ReactNode;
  side?: SidebarSide;
  variant?: SidebarVariant;
  collapsible?: SidebarCollapsible;
  ariaLabel?: string;
  panelClassName?: string;
}

export const AnimatedSidebar = forwardRef<HTMLElement, AnimatedSidebarProps>(
  function AnimatedSidebar(
    {
      side = 'left',
      variant = 'sidebar',
      collapsible = 'icon',
      ariaLabel = 'Sidebar',
      children,
      className,
      panelClassName,
      style,
      ...props
    },
    forwardedRef,
  ) {
    const context = useAnimatedSidebar();
    const collapsed = collapsible !== 'none' && !context.open;
    const offcanvas = collapsed && collapsible === 'offcanvas';
    const width = offcanvas
      ? '0px'
      : collapsed
        ? 'var(--sidebar-width-icon)'
        : 'var(--sidebar-width)';

    if (context.isMobile) {
      return (
        <MobileSidebar ariaLabel={ariaLabel} className={className} side={side}>
          {children}
        </MobileSidebar>
      );
    }

    return (
      <motion.aside
        {...props}
        ref={forwardedRef}
        initial={false}
        aria-label={ariaLabel}
        data-slot="sidebar"
        data-state={collapsed ? 'collapsed' : 'expanded'}
        data-collapsible={collapsible}
        data-variant={variant}
        data-side={side}
        animate={{ width }}
        transition={context.reduce ? { duration: 0 } : SIDEBAR_MORPH_TRANSITION}
        style={style}
        className={cn(
          'group/sidebar relative hidden h-auto shrink-0 md:block will-change-[width]',
          'peer',
          side === 'right' && 'order-last',
          className,
        )}
      >
        <motion.div
          initial={false}
          animate={{
            opacity: offcanvas ? 0 : 1,
            x: offcanvas ? (side === 'left' ? '-100%' : '100%') : '0%',
          }}
          transition={context.reduce ? REDUCED_TRANSITION : PANEL_TRANSITION}
          className={cn(
            'sticky top-0 flex h-svh w-full flex-col overflow-hidden bg-sidebar text-sidebar-foreground',
            collapsible === 'offcanvas' && 'w-[var(--sidebar-width)]',
            variant === 'sidebar' &&
              (side === 'left'
                ? 'border-sidebar-border border-r'
                : 'border-sidebar-border border-l'),
            variant === 'floating' &&
              'm-2 h-[calc(100svh-1rem)] rounded-2xl border border-sidebar-border shadow-sm',
            variant === 'inset' && 'm-2 h-[calc(100svh-1rem)] rounded-2xl',
            panelClassName,
          )}
        >
          <AnimatedSidebarPanelContext.Provider value={{ collapsed, collapsible, side }}>
            {children}
          </AnimatedSidebarPanelContext.Provider>
        </motion.div>
      </motion.aside>
    );
  },
);

export interface AnimatedSidebarTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode;
}

export const AnimatedSidebarTrigger = forwardRef<HTMLButtonElement, AnimatedSidebarTriggerProps>(
  function AnimatedSidebarTrigger({ children, className, onClick, ...props }, forwardedRef) {
    const context = useAnimatedSidebar();

    return (
      <button
        {...props}
        ref={forwardedRef}
        type="button"
        aria-label="Toggle sidebar"
        aria-expanded={context.isMobile ? context.openMobile : context.open}
        onClick={(e) => {
          onClick?.(e);
          context.toggleSidebar();
        }}
        className={cn(
          'inline-flex size-9 items-center justify-center rounded-lg border border-border/50 bg-background text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring cursor-pointer',
          className,
        )}
      >
        {children ?? <PanelLeftIcon className="size-4.5" />}
      </button>
    );
  },
);

export interface AnimatedSidebarCloseProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode;
}

export const AnimatedSidebarClose = forwardRef<HTMLButtonElement, AnimatedSidebarCloseProps>(
  function AnimatedSidebarClose({ children, className, onClick, ...props }, forwardedRef) {
    const context = useAnimatedSidebar();

    return (
      <button
        {...props}
        ref={forwardedRef}
        type="button"
        aria-label="Close sidebar"
        onClick={(e) => {
          onClick?.(e);
          if (context.isMobile) context.setOpenMobile(false);
          else context.setOpen(false);
        }}
        className={cn(
          'inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground cursor-pointer',
          className,
        )}
      >
        {children}
      </button>
    );
  },
);

export interface AnimatedSidebarRailProps extends ButtonHTMLAttributes<HTMLButtonElement> {}

export const AnimatedSidebarRail = forwardRef<HTMLButtonElement, AnimatedSidebarRailProps>(
  function AnimatedSidebarRail({ className, ...props }, forwardedRef) {
    const context = useAnimatedSidebar();

    return (
      <button
        {...props}
        ref={forwardedRef}
        type="button"
        tabIndex={-1}
        aria-label="Toggle sidebar resize"
        onClick={() => context.toggleSidebar()}
        className={cn(
          'absolute inset-y-0 -right-2 z-20 hidden w-4 cursor-w-resize transition-all hover:bg-primary/20 md:block',
          className,
        )}
      />
    );
  },
);

export interface AnimatedSidebarInsetProps extends HTMLAttributes<HTMLElement> {}

export const AnimatedSidebarInset = forwardRef<HTMLElement, AnimatedSidebarInsetProps>(
  function AnimatedSidebarInset({ className, ...props }, forwardedRef) {
    return (
      <main
        {...props}
        ref={forwardedRef}
        className={cn(
          'relative flex min-h-svh flex-1 flex-col overflow-hidden bg-background',
          className,
        )}
      />
    );
  },
);

export const AnimatedSidebarHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function AnimatedSidebarHeader({ className, ...props }, forwardedRef) {
    return (
      <div
        {...props}
        ref={forwardedRef}
        data-slot="sidebar-header"
        className={cn('flex flex-col gap-2 p-3', className)}
      />
    );
  },
);

export const AnimatedSidebarContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function AnimatedSidebarContent({ className, ...props }, forwardedRef) {
    return (
      <div
        {...props}
        ref={forwardedRef}
        data-slot="sidebar-content"
        className={cn(
          'flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto overflow-x-hidden p-3',
          className,
        )}
      />
    );
  },
);

export const AnimatedSidebarFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function AnimatedSidebarFooter({ className, ...props }, forwardedRef) {
    return (
      <div
        {...props}
        ref={forwardedRef}
        data-slot="sidebar-footer"
        className={cn('mt-auto flex flex-col p-3', className)}
      />
    );
  },
);

export const AnimatedSidebarGroup = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function AnimatedSidebarGroup({ className, ...props }, forwardedRef) {
    return (
      <div
        {...props}
        ref={forwardedRef}
        data-slot="sidebar-group"
        className={cn('relative flex w-full min-w-0 flex-col gap-1', className)}
      />
    );
  },
);

export const AnimatedSidebarGroupLabel = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function AnimatedSidebarGroupLabel({ className, children, ...props }, forwardedRef) {
    const panel = useAnimatedSidebarPanel();

    if (panel.collapsed) return null;

    return (
      <div
        {...props}
        ref={forwardedRef}
        data-slot="sidebar-group-label"
        className={cn(
          'flex h-7 shrink-0 items-center px-2 text-[11px] font-bold tracking-wider text-sidebar-foreground/60 uppercase',
          className,
        )}
      >
        {children}
      </div>
    );
  },
);

export const AnimatedSidebarGroupContent = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(function AnimatedSidebarGroupContent({ className, ...props }, forwardedRef) {
  return (
    <div
      {...props}
      ref={forwardedRef}
      data-slot="sidebar-group-content"
      className={cn('w-full', className)}
    />
  );
});

export const AnimatedSidebarMenu = forwardRef<HTMLUListElement, HTMLAttributes<HTMLUListElement>>(
  function AnimatedSidebarMenu({ className, ...props }, forwardedRef) {
    return (
      <ul
        {...props}
        ref={forwardedRef}
        data-slot="sidebar-menu"
        className={cn('flex w-full min-w-0 flex-col gap-1', className)}
      />
    );
  },
);

export const AnimatedSidebarMenuItem = forwardRef<HTMLLIElement, HTMLAttributes<HTMLLIElement>>(
  function AnimatedSidebarMenuItem({ className, ...props }, forwardedRef) {
    const panel = useAnimatedSidebarPanel();

    return (
      <li
        {...props}
        ref={forwardedRef}
        data-slot="sidebar-menu-item"
        className={cn(
          'relative min-w-0 list-none',
          panel.collapsed ? 'w-full flex justify-center' : 'w-full',
          className,
        )}
      />
    );
  },
);

export interface AnimatedSidebarMenuSubProps extends HTMLAttributes<HTMLUListElement> {
  open?: boolean;
}

export const AnimatedSidebarMenuSub = forwardRef<HTMLUListElement, AnimatedSidebarMenuSubProps>(
  function AnimatedSidebarMenuSub({ open = false, className, children, ...props }, forwardedRef) {
    const context = useAnimatedSidebar();
    const panel = useAnimatedSidebarPanel();

    if (panel.collapsed) return null;

    return (
      <AnimatePresence initial={false}>
        {open ? (
          <motion.ul
            {...(props as HTMLMotionProps<'ul'>)}
            ref={forwardedRef}
            variants={SUBMENU_VARIANTS}
            initial={context.reduce ? false : 'closed'}
            animate={context.reduce ? { opacity: 1 } : 'open'}
            exit={context.reduce ? { opacity: 0 } : 'closed'}
            transition={context.reduce ? { duration: 0.12 } : undefined}
            data-slot="sidebar-menu-sub"
            className={cn(
              'relative mt-1 ml-5 flex min-w-0 flex-col gap-0.5 border-sidebar-border/30 border-l pl-3',
              className,
            )}
          >
            {children}
          </motion.ul>
        ) : null}
      </AnimatePresence>
    );
  },
);

export const AnimatedSidebarMenuSubItem = forwardRef<HTMLLIElement, HTMLMotionProps<'li'>>(
  function AnimatedSidebarMenuSubItem({ className, ...props }, forwardedRef) {
    return (
      <motion.li
        {...props}
        ref={forwardedRef}
        variants={SUBMENU_ITEM_VARIANTS}
        data-slot="sidebar-menu-sub-item"
        className={cn('relative min-w-0 list-none', className)}
      />
    );
  },
);

export interface AnimatedSidebarMenuSubButtonProps {
  children: ReactNode;
  icon?: ReactNode;
  href?: string;
  to?: string;
  isActive?: boolean;
  disabled?: boolean;
  closeOnSelect?: boolean;
  target?: '_blank' | '_self' | '_parent' | '_top';
  rel?: string;
  onSelect?: () => void;
  className?: string;
}

export function AnimatedSidebarMenuSubButton({
  children,
  icon,
  href,
  to,
  isActive = false,
  disabled = false,
  closeOnSelect = true,
  target,
  rel,
  onSelect,
  className,
}: AnimatedSidebarMenuSubButtonProps) {
  const context = useAnimatedSidebar();
  const navigate = useNavigate();

  const select = (event: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
    if (disabled) {
      event.preventDefault();
      return;
    }
    if (to) {
      event.preventDefault();
      void navigate({ to });
    }
    onSelect?.();
    if (context.isMobile && closeOnSelect) context.setOpenMobile(false);
  };

  const content = (
    <>
      <span aria-hidden="true" className="grid size-4 shrink-0 place-items-center">
        {icon ?? <span className="size-1 rounded-full bg-current" />}
      </span>
      <span className="min-w-0 flex-1 truncate">{children}</span>
    </>
  );

  const interactiveClassName = cn(
    'flex min-h-8 w-full min-w-0 items-center gap-2 rounded-lg px-2 text-left text-xs outline-none cursor-pointer',
    'text-sidebar-foreground/75 transition-colors hover:bg-white/10 hover:text-sidebar-foreground',
    'focus-visible:bg-white/15 focus-visible:ring-2 focus-visible:ring-primary',
    isActive && 'bg-sidebar-accent text-sidebar-foreground font-medium',
    disabled && 'cursor-not-allowed opacity-40',
    className,
  );

  return href ? (
    <motion.a
      href={href}
      target={target}
      rel={rel ?? (target === '_blank' ? 'noreferrer noopener' : undefined)}
      aria-current={isActive ? 'page' : undefined}
      aria-disabled={disabled || undefined}
      tabIndex={disabled ? -1 : undefined}
      onClick={select}
      whileTap={context.reduce || disabled ? undefined : { scale: 0.98 }}
      transition={SPRING_PRESS}
      className={interactiveClassName}
    >
      {content}
    </motion.a>
  ) : (
    <motion.button
      type="button"
      disabled={disabled}
      aria-current={isActive ? 'page' : undefined}
      onClick={select}
      whileTap={context.reduce || disabled ? undefined : { scale: 0.98 }}
      transition={SPRING_PRESS}
      className={interactiveClassName}
    >
      {content}
    </motion.button>
  );
}

export interface AnimatedSidebarMenuButtonProps {
  children: ReactNode;
  icon?: ReactNode;
  badge?: ReactNode;
  href?: string;
  to?: string;
  isActive?: boolean;
  ariaExpanded?: boolean;
  disabled?: boolean;
  closeOnSelect?: boolean;
  target?: '_blank' | '_self' | '_parent' | '_top';
  rel?: string;
  onSelect?: () => void;
  className?: string;
}

export function AnimatedSidebarMenuButton({
  children,
  icon,
  badge,
  href,
  to,
  isActive = false,
  ariaExpanded,
  disabled = false,
  closeOnSelect,
  target,
  rel,
  onSelect,
  className,
}: AnimatedSidebarMenuButtonProps) {
  const context = useAnimatedSidebar();
  const panel = useAnimatedSidebarPanel();
  const navigate = useNavigate();
  const textLabel = typeof children === 'string' ? children : undefined;

  const select = (event: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
    if (disabled) {
      event.preventDefault();
      return;
    }
    if (to) {
      event.preventDefault();
      void navigate({ to });
    }
    onSelect?.();
    const shouldCloseOnSelect = closeOnSelect ?? ariaExpanded === undefined;
    if (context.isMobile && shouldCloseOnSelect) {
      context.setOpenMobile(false);
    }
    if (ariaExpanded !== undefined && panel.collapsed && !context.isMobile) {
      context.setOpen(true);
    }
  };

  const content = (
    <>
      {isActive ? (
        <motion.span
          layoutId={context.layoutId}
          transition={context.reduce ? { duration: 0 } : SPRING_LAYOUT}
          className={cn(
            'absolute inset-0 rounded-md bg-sidebar-accent shadow-xs',
            panel.collapsed
              ? 'border border-primary ring-1.5 ring-primary/40'
              : 'border border-white/10 border-l-[3.5px] border-l-primary',
          )}
        />
      ) : null}
      {icon ? (
        <span
          aria-hidden="true"
          className={cn(
            'relative z-10 grid size-5 shrink-0 place-items-center transition-colors',
            isActive ? 'text-primary' : 'text-sidebar-foreground/80',
          )}
        >
          {icon}
        </span>
      ) : null}
      {!panel.collapsed && (
        <motion.span
          initial={false}
          animate={{
            opacity: panel.collapsed ? 0 : 1,
            x: panel.collapsed ? -4 : 0,
          }}
          transition={
            context.reduce
              ? REDUCED_TRANSITION
              : panel.collapsed
                ? LABEL_EXIT_TRANSITION
                : LABEL_ENTER_TRANSITION
          }
          aria-hidden={panel.collapsed}
          className={cn(
            'relative z-10 min-w-0 flex-1 truncate font-medium',
            isActive && 'font-semibold text-sidebar-foreground',
          )}
        >
          {children}
        </motion.span>
      )}
      {badge && !panel.collapsed ? (
        <span className="relative z-10 shrink-0 text-xs text-sidebar-foreground/70">{badge}</span>
      ) : null}
      {ariaExpanded !== undefined && !panel.collapsed ? (
        <motion.span
          aria-hidden="true"
          initial={false}
          animate={{
            opacity: panel.collapsed ? 0 : 1,
            rotate: ariaExpanded ? 90 : 0,
            x: panel.collapsed ? 4 : 0,
          }}
          transition={context.reduce ? { duration: 0 } : SPRING_LAYOUT}
          className="relative z-10 grid size-4 shrink-0 place-items-center text-sidebar-foreground/70"
        >
          <ChevronRight className="size-3.5" />
        </motion.span>
      ) : null}
    </>
  );

  const interactiveClassName = cn(
    'relative flex min-h-10 min-w-0 items-center overflow-hidden rounded-md text-left text-sm font-medium outline-none cursor-pointer select-none',
    'text-sidebar-foreground/85 transition-colors hover:text-sidebar-foreground',
    'focus-visible:ring-2 focus-visible:ring-primary',
    isActive && 'text-sidebar-foreground',
    panel.collapsed ? 'size-10 justify-center p-0 mx-auto' : 'w-full gap-3 px-3.5',
    disabled && 'cursor-not-allowed opacity-40',
    className,
  );

  return href ? (
    <motion.a
      href={href}
      target={target}
      rel={rel ?? (target === '_blank' ? 'noreferrer noopener' : undefined)}
      aria-current={isActive ? 'page' : undefined}
      aria-expanded={ariaExpanded}
      aria-disabled={disabled || undefined}
      aria-label={panel.collapsed ? textLabel : undefined}
      title={panel.collapsed ? textLabel : undefined}
      tabIndex={disabled ? -1 : undefined}
      onClick={select}
      whileTap={context.reduce || disabled ? undefined : { scale: 0.98 }}
      transition={SPRING_PRESS}
      className={interactiveClassName}
    >
      {content}
    </motion.a>
  ) : (
    <motion.button
      type="button"
      disabled={disabled}
      aria-current={isActive ? 'page' : undefined}
      aria-expanded={ariaExpanded}
      aria-label={panel.collapsed ? textLabel : undefined}
      title={panel.collapsed ? textLabel : undefined}
      onClick={select}
      whileTap={context.reduce || disabled ? undefined : { scale: 0.98 }}
      transition={SPRING_PRESS}
      className={interactiveClassName}
    >
      {content}
    </motion.button>
  );
}
