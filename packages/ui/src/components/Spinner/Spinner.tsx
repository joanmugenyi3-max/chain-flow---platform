import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const spinnerVariants = cva('animate-spin rounded-full border-solid border-current border-r-transparent', {
  variants: {
    size: {
      xs: 'h-3 w-3 border-[2px]',
      sm: 'h-4 w-4 border-[2px]',
      md: 'h-6 w-6 border-2',
      lg: 'h-8 w-8 border-[3px]',
      xl: 'h-12 w-12 border-4',
    },
    color: {
      primary: 'text-primary-600',
      white: 'text-white',
      slate: 'text-slate-400',
      success: 'text-emerald-500',
      danger: 'text-danger-500',
      warning: 'text-amber-500',
    },
  },
  defaultVariants: {
    size: 'md',
    color: 'primary',
  },
});

export interface SpinnerProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof spinnerVariants> {
  label?: string;
}

function Spinner({ className, size, color, label = 'Loading...', ...props }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label={label}
      className={cn('inline-flex items-center justify-center', className)}
      {...props}
    >
      <span className={cn(spinnerVariants({ size, color }))} />
      <span className="sr-only">{label}</span>
    </span>
  );
}

export { Spinner, spinnerVariants };
