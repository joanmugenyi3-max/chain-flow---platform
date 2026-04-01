import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { Button, type ButtonProps } from '../Button/Button';

// ── Radix Dialog wrappers ─────────────────────────────────────────────────

const DialogRoot = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;
const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-50 bg-black/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      className
    )}
    {...props}
  />
));
DialogOverlay.displayName = 'DialogOverlay';

const dialogContentVariants = cva(
  'fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%] bg-white shadow-2xl rounded-xl border border-slate-200 flex flex-col max-h-[90vh] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]',
  {
    variants: {
      size: {
        sm: 'w-full max-w-sm',
        md: 'w-full max-w-lg',
        lg: 'w-full max-w-2xl',
        xl: 'w-full max-w-4xl',
        full: 'w-[95vw] max-w-none',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

// ── High-level Modal component ────────────────────────────────────────────

export interface ModalAction {
  label: string;
  onClick?: () => void;
  variant?: ButtonProps['variant'];
  loading?: boolean;
  disabled?: boolean;
}

export interface ModalProps extends VariantProps<typeof dialogContentVariants> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  primaryAction?: ModalAction;
  cancelLabel?: string;
  onCancel?: () => void;
  hideCloseButton?: boolean;
  contentClassName?: string;
}

function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  primaryAction,
  cancelLabel = 'Cancel',
  onCancel,
  hideCloseButton = false,
  size,
  contentClassName,
}: ModalProps) {
  const handleCancel = () => {
    onCancel?.();
    onOpenChange(false);
  };

  return (
    <DialogRoot open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
          className={cn(dialogContentVariants({ size }), contentClassName)}
          onInteractOutside={(e) => {
            // Prevent closing when clicking inside nested popovers
            if ((e.target as Element)?.closest('[data-radix-popper-content-wrapper]')) {
              e.preventDefault();
            }
          }}
        >
          {/* Header */}
          {(title || description || !hideCloseButton) && (
            <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-slate-100 shrink-0">
              <div className="flex flex-col gap-1">
                {title && (
                  <DialogPrimitive.Title className="text-base font-semibold text-slate-900 leading-none">
                    {title}
                  </DialogPrimitive.Title>
                )}
                {description && (
                  <DialogPrimitive.Description className="text-sm text-slate-500">
                    {description}
                  </DialogPrimitive.Description>
                )}
              </div>
              {!hideCloseButton && (
                <DialogClose asChild>
                  <button
                    className="rounded-md p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors shrink-0 focus:outline-none focus:ring-2 focus:ring-primary-600"
                    aria-label="Close dialog"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </DialogClose>
              )}
            </div>
          )}

          {/* Body */}
          {children && (
            <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
          )}

          {/* Footer */}
          {(footer || primaryAction || onCancel) && (
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-slate-100 shrink-0">
              {footer ?? (
                <>
                  <Button variant="outline" size="md" onClick={handleCancel}>
                    {cancelLabel}
                  </Button>
                  {primaryAction && (
                    <Button
                      variant={primaryAction.variant ?? 'default'}
                      size="md"
                      loading={primaryAction.loading}
                      disabled={primaryAction.disabled}
                      onClick={primaryAction.onClick}
                    >
                      {primaryAction.label}
                    </Button>
                  )}
                </>
              )}
            </div>
          )}
        </DialogPrimitive.Content>
      </DialogPortal>
    </DialogRoot>
  );
}

export {
  Modal,
  DialogRoot,
  DialogTrigger,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  dialogContentVariants,
};
