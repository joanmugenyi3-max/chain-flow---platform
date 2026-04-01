import * as React from 'react';
import { X, Info, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const alertVariants = cva(
  'relative flex gap-3 rounded-lg border p-4 text-sm',
  {
    variants: {
      variant: {
        info: 'bg-sky-50 border-sky-200 text-sky-800',
        success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
        warning: 'bg-amber-50 border-amber-200 text-amber-800',
        error: 'bg-danger-50 border-danger-200 text-danger-800',
      },
    },
    defaultVariants: {
      variant: 'info',
    },
  }
);

const iconMap = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  error: XCircle,
};

const iconColorMap: Record<string, string> = {
  info: 'text-sky-500',
  success: 'text-emerald-500',
  warning: 'text-amber-500',
  error: 'text-danger-500',
};

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  title?: string;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
}

function Alert({
  className,
  variant = 'info',
  title,
  description,
  icon,
  dismissible = false,
  onDismiss,
  children,
  ...props
}: AlertProps) {
  const [visible, setVisible] = React.useState(true);

  const handleDismiss = () => {
    setVisible(false);
    onDismiss?.();
  };

  if (!visible) return null;

  const IconComponent = iconMap[variant ?? 'info'];
  const iconColor = iconColorMap[variant ?? 'info'];

  return (
    <div
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    >
      {/* Icon */}
      <span className={cn('shrink-0 mt-0.5', iconColor)}>
        {icon ?? <IconComponent className="h-4 w-4" />}
      </span>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {title && <p className="font-semibold leading-none mb-1">{title}</p>}
        {(description || children) && (
          <div className="text-sm opacity-90">{description ?? children}</div>
        )}
      </div>

      {/* Dismiss button */}
      {dismissible && (
        <button
          onClick={handleDismiss}
          className="shrink-0 p-0.5 rounded hover:opacity-75 transition-opacity focus:outline-none focus:ring-1 focus:ring-current mt-0.5"
          aria-label="Dismiss alert"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

export { Alert, alertVariants };
