import * as React from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Spinner } from '../Spinner/Spinner';

// ── Base Table Primitives ────────────────────────────────────────────────────

const Table = React.forwardRef<HTMLTableElement, React.HTMLAttributes<HTMLTableElement>>(
  ({ className, ...props }, ref) => (
    <div className="relative w-full overflow-auto">
      <table
        ref={ref}
        className={cn('w-full caption-bottom text-sm', className)}
        {...props}
      />
    </div>
  )
);
Table.displayName = 'Table';

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn('bg-slate-50 border-b border-slate-200', className)} {...props} />
));
TableHeader.displayName = 'TableHeader';

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn('divide-y divide-slate-100 [&_tr:last-child]:border-0', className)}
    {...props}
  />
));
TableBody.displayName = 'TableBody';

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn('border-t border-slate-200 bg-slate-50 font-medium', className)}
    {...props}
  />
));
TableFooter.displayName = 'TableFooter';

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement> & { selected?: boolean }
>(({ className, selected, ...props }, ref) => (
  <tr
    ref={ref}
    data-selected={selected}
    className={cn(
      'transition-colors hover:bg-slate-50 data-[selected=true]:bg-primary-50',
      className
    )}
    {...props}
  />
));
TableRow.displayName = 'TableRow';

export type SortDirection = 'asc' | 'desc' | null;

export interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  sortable?: boolean;
  sortDirection?: SortDirection;
  onSort?: () => void;
}

const TableHead = React.forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ className, sortable, sortDirection, onSort, children, ...props }, ref) => (
    <th
      ref={ref}
      className={cn(
        'h-10 px-4 text-left align-middle text-xs font-semibold text-slate-600 uppercase tracking-wide whitespace-nowrap',
        sortable && 'cursor-pointer select-none hover:text-slate-900',
        className
      )}
      onClick={sortable ? onSort : undefined}
      aria-sort={
        sortDirection === 'asc'
          ? 'ascending'
          : sortDirection === 'desc'
            ? 'descending'
            : sortable
              ? 'none'
              : undefined
      }
      {...props}
    >
      {sortable ? (
        <span className="inline-flex items-center gap-1">
          {children}
          <span className="text-slate-400">
            {sortDirection === 'asc' ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : sortDirection === 'desc' ? (
              <ChevronDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronsUpDown className="h-3.5 w-3.5" />
            )}
          </span>
        </span>
      ) : (
        children
      )}
    </th>
  )
);
TableHead.displayName = 'TableHead';

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn('px-4 py-3 align-middle text-sm text-slate-700', className)}
    {...props}
  />
));
TableCell.displayName = 'TableCell';

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn('mt-4 text-sm text-slate-500', className)}
    {...props}
  />
));
TableCaption.displayName = 'TableCaption';

// ── Skeleton Row ─────────────────────────────────────────────────────────────

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

function TableSkeleton({ rows = 5, columns = 4 }: TableSkeletonProps) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <TableRow key={rowIdx}>
          {Array.from({ length: columns }).map((_, colIdx) => (
            <TableCell key={colIdx}>
              <div className="h-4 rounded bg-slate-200 animate-pulse w-full max-w-[180px]" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

// ── Empty State ───────────────────────────────────────────────────────────────

interface TableEmptyStateProps {
  columns: number;
  message?: string;
  icon?: React.ReactNode;
}

function TableEmptyState({ columns, message = 'No data available', icon }: TableEmptyStateProps) {
  return (
    <TableRow>
      <TableCell colSpan={columns} className="py-16 text-center">
        <div className="flex flex-col items-center gap-2 text-slate-400">
          {icon && <span className="text-4xl">{icon}</span>}
          <p className="text-sm font-medium">{message}</p>
        </div>
      </TableCell>
    </TableRow>
  );
}

// ── Loading Overlay ───────────────────────────────────────────────────────────

interface TableLoadingOverlayProps {
  columns: number;
  rows?: number;
}

function TableLoadingOverlay({ columns, rows = 5 }: TableLoadingOverlayProps) {
  return (
    <>
      <TableRow>
        <TableCell colSpan={columns} className="py-0 border-0">
          <div className="flex items-center justify-center py-4">
            <Spinner size="md" />
          </div>
        </TableCell>
      </TableRow>
      <TableSkeleton rows={rows - 1} columns={columns} />
    </>
  );
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
  TableSkeleton,
  TableEmptyState,
  TableLoadingOverlay,
};
