import * as React from 'react';
import {
  Search,
  Download,
  Columns3,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Check,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../Button/Button';
import { Input } from '../Input/Input';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableEmptyState,
  TableLoadingOverlay,
  type SortDirection,
} from '../Table/Table';

// ── Types ──────────────────────────────────────────────────────────────────

export interface ColumnDef<T> {
  key: string;
  header: string;
  sortable?: boolean;
  filterable?: boolean;
  hidden?: boolean;
  width?: string;
  className?: string;
  render?: (value: unknown, row: T, rowIndex: number) => React.ReactNode;
}

export interface PaginationState {
  pageIndex: number;
  pageSize: number;
}

export interface SortState {
  key: string | null;
  direction: SortDirection;
}

export interface DataGridProps<T extends Record<string, unknown>> {
  data: T[];
  columns: ColumnDef<T>[];
  loading?: boolean;
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;

  // Search
  searchable?: boolean;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;

  // Sorting
  sortState?: SortState;
  onSortChange?: (sort: SortState) => void;
  serverSideSort?: boolean;

  // Pagination
  pagination?: boolean;
  pageSize?: number;
  pageSizeOptions?: number[];
  totalRows?: number;
  paginationState?: PaginationState;
  onPaginationChange?: (pagination: PaginationState) => void;
  serverSidePagination?: boolean;

  // Row selection
  selectable?: boolean;
  selectedRows?: Set<string | number>;
  rowKey?: keyof T;
  onSelectionChange?: (selectedKeys: Set<string | number>) => void;

  // Export
  exportable?: boolean;
  onExport?: () => void;
  exportFilename?: string;

  // Column visibility
  columnVisibilityToggle?: boolean;

  className?: string;
  tableClassName?: string;
}

// ── Column Visibility Popover ─────────────────────────────────────────────

interface ColVisMenuProps {
  columns: { key: string; header: string }[];
  hidden: Set<string>;
  onToggle: (key: string) => void;
}

function ColVisMenu({ columns, hidden, onToggle }: ColVisMenuProps) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <Button
        variant="outline"
        size="sm"
        leftIcon={<Columns3 className="h-4 w-4" />}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        Columns
      </Button>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 bg-white border border-slate-200 rounded-lg shadow-lg py-1 min-w-[160px]">
          {columns.map((col) => (
            <button
              key={col.key}
              onClick={() => onToggle(col.key)}
              className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 text-left"
            >
              <span
                className={cn(
                  'flex h-4 w-4 items-center justify-center rounded border',
                  hidden.has(col.key)
                    ? 'border-slate-300 bg-white'
                    : 'border-primary-600 bg-primary-600'
                )}
              >
                {!hidden.has(col.key) && <Check className="h-3 w-3 text-white" />}
              </span>
              {col.header}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── CSV Export ────────────────────────────────────────────────────────────

function exportToCSV<T extends Record<string, unknown>>(
  data: T[],
  columns: ColumnDef<T>[],
  filename: string
) {
  const visibleCols = columns.filter((c) => !c.hidden);
  const header = visibleCols.map((c) => `"${c.header}"`).join(',');
  const rows = data.map((row) =>
    visibleCols
      .map((c) => {
        const val = row[c.key];
        const str = val === null || val === undefined ? '' : String(val);
        return `"${str.replace(/"/g, '""')}"`;
      })
      .join(',')
  );
  const csv = [header, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

// ── DataGrid ──────────────────────────────────────────────────────────────

function DataGrid<T extends Record<string, unknown>>({
  data,
  columns,
  loading = false,
  emptyMessage = 'No records found',
  emptyIcon,

  searchable = false,
  searchPlaceholder = 'Search...',
  searchValue: controlledSearch,
  onSearchChange,

  sortState: controlledSort,
  onSortChange,
  serverSideSort = false,

  pagination = true,
  pageSize: defaultPageSize = 10,
  pageSizeOptions = [10, 20, 50, 100],
  totalRows,
  paginationState: controlledPagination,
  onPaginationChange,
  serverSidePagination = false,

  selectable = false,
  selectedRows: controlledSelected,
  rowKey = 'id' as keyof T,
  onSelectionChange,

  exportable = false,
  onExport,
  exportFilename = 'export',

  columnVisibilityToggle = false,
  className,
  tableClassName,
}: DataGridProps<T>) {
  // Internal state (when uncontrolled)
  const [internalSearch, setInternalSearch] = React.useState('');
  const [internalSort, setInternalSort] = React.useState<SortState>({ key: null, direction: null });
  const [internalPage, setInternalPage] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: defaultPageSize,
  });
  const [internalSelected, setInternalSelected] = React.useState<Set<string | number>>(new Set());
  const [hiddenCols, setHiddenCols] = React.useState<Set<string>>(
    new Set(columns.filter((c) => c.hidden).map((c) => c.key))
  );

  const searchVal = controlledSearch ?? internalSearch;
  const sortVal = controlledSort ?? internalSort;
  const pageVal = controlledPagination ?? internalPage;
  const selectedVal = controlledSelected ?? internalSelected;

  const handleSearch = (value: string) => {
    onSearchChange ? onSearchChange(value) : setInternalSearch(value);
    // reset to first page on search
    if (!serverSidePagination) {
      const newPage = { ...pageVal, pageIndex: 0 };
      onPaginationChange ? onPaginationChange(newPage) : setInternalPage(newPage);
    }
  };

  const handleSort = (key: string) => {
    let direction: SortDirection = 'asc';
    if (sortVal.key === key) {
      direction = sortVal.direction === 'asc' ? 'desc' : sortVal.direction === 'desc' ? null : 'asc';
    }
    const newSort: SortState = { key: direction === null ? null : key, direction };
    onSortChange ? onSortChange(newSort) : setInternalSort(newSort);
  };

  const toggleColVisibility = (key: string) => {
    setHiddenCols((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  // ── Derived data ──────────────────────────────────────────────────────

  const filteredData = React.useMemo(() => {
    if (serverSideSort && serverSidePagination) return data;
    let result = [...data];

    // client search
    if (searchable && searchVal && !onSearchChange) {
      const lower = searchVal.toLowerCase();
      result = result.filter((row) =>
        Object.values(row).some((v) => String(v ?? '').toLowerCase().includes(lower))
      );
    }

    // client sort
    if (!serverSideSort && sortVal.key && sortVal.direction) {
      result.sort((a, b) => {
        const aVal = a[sortVal.key!];
        const bVal = b[sortVal.key!];
        const cmp =
          typeof aVal === 'number' && typeof bVal === 'number'
            ? aVal - bVal
            : String(aVal ?? '').localeCompare(String(bVal ?? ''));
        return sortVal.direction === 'asc' ? cmp : -cmp;
      });
    }

    return result;
  }, [data, searchVal, sortVal, serverSideSort, serverSidePagination, searchable, onSearchChange]);

  const totalCount = serverSidePagination ? (totalRows ?? data.length) : filteredData.length;
  const pageCount = Math.max(1, Math.ceil(totalCount / pageVal.pageSize));

  const pagedData = React.useMemo(() => {
    if (serverSidePagination) return filteredData;
    const start = pageVal.pageIndex * pageVal.pageSize;
    return filteredData.slice(start, start + pageVal.pageSize);
  }, [filteredData, pageVal, serverSidePagination]);

  const visibleColumns = columns.filter((c) => !hiddenCols.has(c.key));

  // ── Selection helpers ─────────────────────────────────────────────────

  const allPageKeys = pagedData.map((r) => r[rowKey] as string | number);
  const allPageSelected = allPageKeys.length > 0 && allPageKeys.every((k) => selectedVal.has(k));
  const somePageSelected = allPageKeys.some((k) => selectedVal.has(k));

  const handleToggleAll = () => {
    const next = new Set(selectedVal);
    if (allPageSelected) {
      allPageKeys.forEach((k) => next.delete(k));
    } else {
      allPageKeys.forEach((k) => next.add(k));
    }
    onSelectionChange ? onSelectionChange(next) : setInternalSelected(next);
  };

  const handleToggleRow = (key: string | number) => {
    const next = new Set(selectedVal);
    next.has(key) ? next.delete(key) : next.add(key);
    onSelectionChange ? onSelectionChange(next) : setInternalSelected(next);
  };

  // ── Pagination controls ───────────────────────────────────────────────

  const setPage = (pageIndex: number) => {
    const next = { ...pageVal, pageIndex };
    onPaginationChange ? onPaginationChange(next) : setInternalPage(next);
  };

  const setPageSize = (pageSize: number) => {
    const next = { pageIndex: 0, pageSize };
    onPaginationChange ? onPaginationChange(next) : setInternalPage(next);
  };

  const handleExport = () => {
    if (onExport) {
      onExport();
    } else {
      exportToCSV(filteredData, columns, exportFilename);
    }
  };

  const checkboxColCount = selectable ? 1 : 0;
  const totalColCount = visibleColumns.length + checkboxColCount;

  return (
    <div className={cn('flex flex-col gap-0 rounded-xl border border-slate-200 bg-white overflow-hidden', className)}>
      {/* Toolbar */}
      {(searchable || exportable || columnVisibilityToggle || selectable) && (
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-slate-200">
          <div className="flex items-center gap-2 flex-1">
            {searchable && (
              <Input
                size="sm"
                placeholder={searchPlaceholder}
                value={searchVal}
                onChange={(e) => handleSearch(e.target.value)}
                leftIcon={<Search className="h-3.5 w-3.5" />}
                containerClassName="max-w-xs"
              />
            )}
            {selectable && selectedVal.size > 0 && (
              <span className="text-xs text-slate-500">
                {selectedVal.size} row{selectedVal.size !== 1 ? 's' : ''} selected
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {columnVisibilityToggle && (
              <ColVisMenu
                columns={columns.map((c) => ({ key: c.key, header: c.header }))}
                hidden={hiddenCols}
                onToggle={toggleColVisibility}
              />
            )}
            {exportable && (
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Download className="h-4 w-4" />}
                onClick={handleExport}
              >
                Export
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      <Table className={tableClassName}>
        <TableHeader>
          <TableRow>
            {selectable && (
              <TableHead className="w-10">
                <input
                  type="checkbox"
                  checked={allPageSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = somePageSelected && !allPageSelected;
                  }}
                  onChange={handleToggleAll}
                  className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-600"
                  aria-label="Select all rows on this page"
                />
              </TableHead>
            )}
            {visibleColumns.map((col) => (
              <TableHead
                key={col.key}
                sortable={col.sortable}
                sortDirection={sortVal.key === col.key ? sortVal.direction : null}
                onSort={() => col.sortable && handleSort(col.key)}
                style={col.width ? { width: col.width } : undefined}
                className={col.className}
              >
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableLoadingOverlay columns={totalColCount} rows={pageVal.pageSize} />
          ) : pagedData.length === 0 ? (
            <TableEmptyState
              columns={totalColCount}
              message={emptyMessage}
              icon={emptyIcon}
            />
          ) : (
            pagedData.map((row, rowIdx) => {
              const key = row[rowKey] as string | number;
              const isSelected = selectedVal.has(key);
              return (
                <TableRow
                  key={key ?? rowIdx}
                  selected={isSelected}
                  onClick={selectable ? () => handleToggleRow(key) : undefined}
                  className={selectable ? 'cursor-pointer' : undefined}
                >
                  {selectable && (
                    <TableCell className="w-10" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleRow(key)}
                        className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-600"
                        aria-label={`Select row ${rowIdx + 1}`}
                      />
                    </TableCell>
                  )}
                  {visibleColumns.map((col) => (
                    <TableCell key={col.key} className={col.className}>
                      {col.render
                        ? col.render(row[col.key], row, rowIdx)
                        : (row[col.key] as React.ReactNode) ?? '—'}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      {/* Pagination */}
      {pagination && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <span>Rows per page:</span>
            <select
              value={pageVal.pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="h-7 rounded border border-slate-200 px-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary-600"
              aria-label="Rows per page"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-1 text-xs">
            <span>
              {totalCount === 0
                ? '0 of 0'
                : `${pageVal.pageIndex * pageVal.pageSize + 1}–${Math.min(
                    (pageVal.pageIndex + 1) * pageVal.pageSize,
                    totalCount
                  )} of ${totalCount}`}
            </span>
            <div className="flex items-center gap-0.5 ml-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setPage(0)}
                disabled={pageVal.pageIndex === 0}
                aria-label="First page"
                className="h-7 w-7"
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setPage(pageVal.pageIndex - 1)}
                disabled={pageVal.pageIndex === 0}
                aria-label="Previous page"
                className="h-7 w-7"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="px-2 text-xs">
                Page {pageVal.pageIndex + 1} of {pageCount}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setPage(pageVal.pageIndex + 1)}
                disabled={pageVal.pageIndex >= pageCount - 1}
                aria-label="Next page"
                className="h-7 w-7"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setPage(pageCount - 1)}
                disabled={pageVal.pageIndex >= pageCount - 1}
                aria-label="Last page"
                className="h-7 w-7"
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export { DataGrid };
