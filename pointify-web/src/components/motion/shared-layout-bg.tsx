import {
  AnimatePresence,
  type HTMLMotionProps,
  motion,
  useReducedMotion,
  type Variants,
} from 'motion/react';
import {
  Children,
  cloneElement,
  forwardRef,
  type HTMLAttributes,
  isValidElement,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
  useId,
  useState,
} from 'react';
import { SPRING_LAYOUT } from '@/lib/ease';
import { cn } from '@/lib/utils';

export interface SharedLayoutBgProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  children: ReactNode;
  /** Semantic container used for the children. */
  as?: 'div' | 'ul';
  /** Tailwind class applied to the moving pill. Defaults to a subtle foreground tint. */
  pillClassName?: string;
  /** Horizontal inset of the pill relative to each row (px). Default 20. */
  inset?: number;
  /** Optional positioning override for the pill wrapper inside each item. */
  pillContainerClassName?: string;
  /** Optional class for the inner content wrapper of each item. */
  contentClassName?: string;
  /** Optional key of the currently selected/active item to highlight by default or when not hovering. */
  selectedKey?: string | null;
}

const variants: Variants = {
  initial: { opacity: 0, filter: 'blur(4px)' },
  animate: { opacity: 1, filter: 'blur(0px)' },
  exit: (isActive: boolean) => (!isActive ? { opacity: 0, filter: 'blur(4px)' } : {}),
};

const reducedVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: (isActive: boolean) => (!isActive ? { opacity: 0 } : {}),
};

export const SharedLayoutBg = forwardRef<HTMLElement, SharedLayoutBgProps>(function SharedLayoutBg(
  {
    children,
    as = 'div',
    className,
    onMouseLeave,
    pillClassName,
    pillContainerClassName,
    contentClassName,
    inset = 0,
    selectedKey,
    ...props
  },
  forwardedRef,
) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const activeId = hoveredId ?? selectedKey ?? null;
  const uid = useId();
  const reduce = useReducedMotion();

  const renderedChildren = Children.toArray(children)
    .filter(isValidElement)
    .map((child, index) => {
      const el = child as ReactElement<{
        className?: string;
        onMouseEnter?: () => void;
        children?: ReactNode;
      }>;
      const rawKey = el.key ? String(el.key).replace(/^\.\$/, '') : `item-${index}`;
      const isCurrentActive = activeId ? rawKey.toLowerCase() === activeId.toLowerCase() : false;

      return cloneElement(
        el,
        {
          key: rawKey,
          className: cn('relative', el.props.className),
          onMouseEnter: () => {
            el.props.onMouseEnter?.();
            setHoveredId(rawKey);
          },
        },
        <>
          <AnimatePresence custom={activeId !== null}>
            {activeId !== null ? (
              <motion.div
                variants={reduce ? reducedVariants : variants}
                initial="initial"
                animate="animate"
                exit="exit"
                custom={activeId !== null}
                className={cn('pointer-events-none absolute inset-0', pillContainerClassName)}
                style={{ left: -inset, right: -inset }}
              >
                {isCurrentActive ? (
                  <motion.div
                    layoutId={`shared-bg-${uid}`}
                    transition={reduce ? { duration: 0 } : SPRING_LAYOUT}
                    className={cn(
                      'pointer-events-none h-full w-full rounded-md bg-white/10 dark:bg-white/10 shadow-xs',
                      pillClassName,
                    )}
                  />
                ) : null}
              </motion.div>
            ) : null}
          </AnimatePresence>
          <div
            className={cn(
              'relative z-10 w-full',
              contentClassName ?? 'flex items-center justify-center',
            )}
          >
            {el.props.children}
          </div>
        </>,
      );
    });

  const handleMouseLeave = (event: MouseEvent<HTMLElement>) => {
    setHoveredId(null);
    onMouseLeave?.(event);
  };

  return as === 'ul' ? (
    <motion.ul
      {...(props as HTMLMotionProps<'ul'>)}
      ref={forwardedRef as Ref<HTMLUListElement>}
      layoutRoot
      onMouseLeave={handleMouseLeave}
      className={cn('flex w-full flex-col', className)}
    >
      {renderedChildren}
    </motion.ul>
  ) : (
    <motion.div
      {...(props as HTMLMotionProps<'div'>)}
      ref={forwardedRef as Ref<HTMLDivElement>}
      layoutRoot
      onMouseLeave={handleMouseLeave}
      className={cn('flex w-full flex-col', className)}
    >
      {renderedChildren}
    </motion.div>
  );
});
