import * as React from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, ChevronDown, ChevronUp, Search } from 'lucide-react';
import { cn } from '../../lib/utils';

// ── Types ─────────────────────────────────────────────────────────────────

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  description?: string;
  icon?: React.ReactNode;
}

export interface SelectGroup {
  label: string;
  options: SelectOption[];
}

// ── Radix Primitives ──────────────────────────────────────────────────────

const SelectRoot = SelectPrimitive.Root;
const SelectValue = SelectPrimitive.Value;

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> & {
    error?: boolean;
  }
>(({ className, children, error, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      'flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm ring-offset-white focus:outline-none focus:ring-2 focus:ring-primary-600 disabled:cursor-not-allowed disabled:opacity-50',
      error
        ? 'border-danger-500 focus:ring-danger-500'
        : 'border-slate-200 focus:border-primary-600',
      className
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn('flex cursor-default items-center justify-center py-1', className)}
    {...props}
  >
    <ChevronUp className="h-4 w-4" />
  </SelectPrimitive.ScrollUpButton>
));
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;

const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn('flex cursor-default items-center justify-center py-1', className)}
    {...props}
  >
    <ChevronDown className="h-4 w-4" />
  </SelectPrimitive.ScrollDownButton>
));
SelectScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName;

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = 'popper', ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        'relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-lg border border-slate-200 bg-white text-slate-900 shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
        position === 'popper' &&
          'data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1',
        className
      )}
      position={position}
      {...props}
    >
      <SelectScrollUpButton />
      <SelectPrimitive.Viewport
        className={cn(
          'p-1',
          position === 'popper' &&
            'h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]'
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
      <SelectScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));
SelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn('px-2 py-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wide', className)}
    {...props}
  />
));
SelectLabel.displayName = SelectPrimitive.Label.displayName;

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item> & {
    description?: string;
    icon?: React.ReactNode;
  }
>(({ className, children, description, icon, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      'relative flex w-full cursor-default select-none items-center rounded-md py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-primary-50 focus:text-primary-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      className
    )}
    {...props}
  >
    <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-4 w-4 text-primary-600" />
      </SelectPrimitive.ItemIndicator>
    </span>
    <div className="flex items-center gap-2">
      {icon && <span className="text-slate-400">{icon}</span>}
      <div>
        <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
        {description && (
          <p className="text-xs text-slate-400 mt-0.5">{description}</p>
        )}
      </div>
    </div>
  </SelectPrimitive.Item>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn('-mx-1 my-1 h-px bg-slate-100', className)}
    {...props}
  />
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

// ── High-level Select component ───────────────────────────────────────────

export interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  defaultValue?: string;
  placeholder?: string;
  options?: SelectOption[];
  groups?: SelectGroup[];
  disabled?: boolean;
  error?: boolean;
  label?: string;
  helperText?: string;
  errorMessage?: string;
  searchable?: boolean;
  className?: string;
  triggerClassName?: string;
  id?: string;
}

function Select({
  value,
  onValueChange,
  defaultValue,
  placeholder = 'Select an option',
  options,
  groups,
  disabled,
  error,
  label,
  helperText,
  errorMessage,
  searchable = false,
  className,
  triggerClassName,
  id,
}: SelectProps) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const inputId = id ?? React.useId();
  const hasError = Boolean(errorMessage) || error;

  const filterOption = (opt: SelectOption): boolean => {
    if (!searchable || !searchQuery) return true;
    return opt.label.toLowerCase().includes(searchQuery.toLowerCase());
  };

  const renderOptions = (opts: SelectOption[]) =>
    opts.filter(filterOption).map((opt) => (
      <SelectItem key={opt.value} value={opt.value} disabled={opt.disabled} description={opt.description} icon={opt.icon}>
        {opt.label}
      </SelectItem>
    ));

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label
          htmlFor={inputId}
          className={cn(
            'text-sm font-medium text-slate-700 leading-none',
            disabled && 'opacity-50'
          )}
        >
          {label}
        </label>
      )}
      <SelectRoot value={value} onValueChange={onValueChange} defaultValue={defaultValue} disabled={disabled}>
        <SelectTrigger id={inputId} error={hasError} className={triggerClassName}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {searchable && (
            <div className="flex items-center border-b border-slate-100 px-2 mb-1 pb-1">
              <Search className="h-3.5 w-3.5 text-slate-400 shrink-0 mr-1.5" />
              <input
                className="flex-1 text-sm py-1 outline-none placeholder:text-slate-400"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
              />
            </div>
          )}
          {options && renderOptions(options)}
          {groups &&
            groups.map((group, i) => (
              <React.Fragment key={group.label}>
                {i > 0 && <SelectSeparator />}
                <SelectLabel>{group.label}</SelectLabel>
                {renderOptions(group.options)}
              </React.Fragment>
            ))}
        </SelectContent>
      </SelectRoot>
      {hasError && errorMessage && (
        <p role="alert" className="text-xs text-danger-600">
          {errorMessage}
        </p>
      )}
      {!hasError && helperText && (
        <p className="text-xs text-slate-500">{helperText}</p>
      )}
    </div>
  );
}

// ── Multi-select ──────────────────────────────────────────────────────────

export interface MultiSelectProps {
  value?: string[];
  onChange?: (value: string[]) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  label?: string;
  errorMessage?: string;
  searchable?: boolean;
  className?: string;
  maxDisplay?: number;
}

function MultiSelect({
  value = [],
  onChange,
  options,
  placeholder = 'Select options',
  disabled = false,
  label,
  errorMessage,
  searchable = true,
  className,
  maxDisplay = 3,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(
    (o) => !search || o.label.toLowerCase().includes(search.toLowerCase())
  );

  const toggle = (val: string) => {
    const next = value.includes(val) ? value.filter((v) => v !== val) : [...value, val];
    onChange?.(next);
  };

  const displayLabels = value
    .slice(0, maxDisplay)
    .map((v) => options.find((o) => o.value === v)?.label ?? v);
  const extra = value.length - maxDisplay;

  return (
    <div className={cn('flex flex-col gap-1.5', className)} ref={containerRef}>
      {label && (
        <label className="text-sm font-medium text-slate-700 leading-none">{label}</label>
      )}
      <div className="relative">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen((o) => !o)}
          className={cn(
            'flex h-9 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-600 disabled:opacity-50 disabled:cursor-not-allowed',
            errorMessage && 'border-danger-500'
          )}
          aria-haspopup="listbox"
          aria-expanded={open}
        >
          <span className={cn('flex flex-wrap gap-1 flex-1 min-w-0', !value.length && 'text-slate-400')}>
            {value.length === 0 ? (
              placeholder
            ) : (
              <>
                {displayLabels.map((l) => (
                  <span key={l} className="inline-flex items-center rounded bg-primary-100 text-primary-700 px-1.5 py-0.5 text-xs font-medium">
                    {l}
                  </span>
                ))}
                {extra > 0 && (
                  <span className="inline-flex items-center rounded bg-slate-100 text-slate-600 px-1.5 py-0.5 text-xs font-medium">
                    +{extra}
                  </span>
                )}
              </>
            )}
          </span>
          <ChevronDown className="h-4 w-4 text-slate-400 shrink-0 ml-2" />
        </button>
        {open && (
          <div className="absolute z-50 mt-1 w-full rounded-lg border border-slate-200 bg-white shadow-lg py-1">
            {searchable && (
              <div className="flex items-center border-b border-slate-100 px-2 pb-1 mb-1">
                <Search className="h-3.5 w-3.5 text-slate-400 mr-1.5 shrink-0" />
                <input
                  className="flex-1 text-sm py-1 outline-none placeholder:text-slate-400"
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            )}
            <div className="max-h-60 overflow-y-auto">
              {filteredOptions.length === 0 ? (
                <p className="px-3 py-2 text-sm text-slate-400">No options</p>
              ) : (
                filteredOptions.map((opt) => {
                  const selected = value.includes(opt.value);
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      disabled={opt.disabled}
                      onClick={() => toggle(opt.value)}
                      className={cn(
                        'flex w-full items-center gap-2 px-3 py-1.5 text-sm text-left hover:bg-primary-50 disabled:opacity-50',
                        selected && 'text-primary-700'
                      )}
                      role="option"
                      aria-selected={selected}
                    >
                      <span
                        className={cn(
                          'flex h-4 w-4 items-center justify-center rounded border shrink-0',
                          selected ? 'border-primary-600 bg-primary-600' : 'border-slate-300'
                        )}
                      >
                        {selected && <Check className="h-3 w-3 text-white" />}
                      </span>
                      {opt.label}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
      {errorMessage && (
        <p role="alert" className="text-xs text-danger-600">
          {errorMessage}
        </p>
      )}
    </div>
  );
}

export {
  Select,
  MultiSelect,
  SelectRoot,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
};
