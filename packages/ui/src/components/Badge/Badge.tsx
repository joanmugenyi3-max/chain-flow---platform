import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'bg-primary-100 text-primary-700 border border-primary-200',
        secondary:
          'bg-slate-100 text-slate-700 border border-slate-200',
        destructive:
          'bg-danger-100 text-danger-700 border border-danger-200',
        outline:
          'border border-slate-300 text-slate-700 bg-transparent',
        success:
          'bg-emerald-100 text-emerald-700 border border-emerald-200',
        warning:
          'bg-amber-100 text-amber-700 border border-amber-200',
        info:
          'bg-sky-100 text-sky-700 border border-sky-200',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

const dotColorMap: Record<string, string> = {
  default: 'bg-primary-500',
  secondary: 'bg-slate-500',
  destructive: 'bg-danger-500',
  outline: 'bg-slate-500',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  info: 'bg-sky-500',
};

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

function Badge({ className, variant = 'default', dot = false, children, ...props }: BadgeProps) {
  const dotColor = dotColorMap[variant ?? 'default'] ?? 'bg-slate-500';

  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      {dot && (
        <span
          className={cn('inline-block h-1.5 w-1.5 rounded-full shrink-0', dotColor)}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}

export { Badge, badgeVariants };
