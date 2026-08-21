import { forwardRef } from 'react';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'outline' | 'ghost' | 'subtle' | 'danger';
type Size = 'sm' | 'md' | 'lg' | 'icon' | 'icon-sm';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-primary text-primary-fg hover:bg-primary/90 disabled:hover:bg-primary',
  outline:
    'border border-line bg-surface text-ink hover:bg-surface-hover disabled:hover:bg-surface',
  ghost: 'text-ink hover:bg-surface-hover disabled:hover:bg-transparent',
  subtle: 'bg-surface-subtle text-ink hover:bg-surface-hover',
  danger: 'bg-danger-soft text-danger hover:brightness-95',
};

const SIZES: Record<Size, string> = {
  sm: 'h-7 gap-1.5 rounded-lg px-2.5 text-xs',
  md: 'h-8 gap-1.5 rounded-lg px-3 text-[13px]',
  lg: 'h-9 gap-2 rounded-[14px] px-4 text-[13px]',
  icon: 'h-8 w-8 rounded-lg',
  'icon-sm': 'h-7 w-7 rounded-md',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    { className, variant = 'outline', size = 'md', type = 'button', ...props },
    ref,
  ) {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          'inline-flex shrink-0 items-center justify-center font-medium whitespace-nowrap',
          'transition-colors duration-150',
          'disabled:pointer-events-none disabled:opacity-50',
          '[&_svg]:pointer-events-none [&_svg]:shrink-0',
          VARIANTS[variant],
          SIZES[size],
          className,
        )}
        {...props}
      />
    );
  },
);
