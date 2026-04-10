import React from 'react';
import { colors, font, radius } from '@/lib/styles';

export interface Column<T> {
  key: keyof T | string;
  label: string;
  render?: (value: unknown, row: T) => React.ReactNode;
  align?: 'left' | 'right' | 'center';
  width?: string | number;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  title?: string;
  emptyMessage?: string;
}

export default function DataTable<T extends Record<string, unknown>>({
  columns, rows, title, emptyMessage = 'No data available.'
}: DataTableProps<T>) {
  return (
    <div style={{
      background: colors.white,
      borderRadius: radius.lg,
      border: `1px solid ${colors.border}`,
      overflow: 'hidden',
      boxShadow: colors.shadow,
    }}>
      {title && (
        <div style={{
          padding: '16px 24px',
          borderBottom: `1px solid ${colors.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <span style={{ fontWeight: 600, fontSize: 15, color: colors.slate900, fontFamily: font.sans }}>
            {title}
          </span>
          <span style={{ fontSize: 12, color: colors.slate400, fontFamily: font.sans }}>
            {rows.length} record{rows.length !== 1 ? 's' : ''}
          </span>
        </div>
      )}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: font.sans }}>
          <thead>
            <tr style={{ background: colors.slate50, borderBottom: `1px solid ${colors.border}` }}>
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  style={{
                    padding: '11px 20px',
                    textAlign: col.align ?? 'left',
                    fontSize: 12,
                    fontWeight: 600,
                    color: colors.slate500,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    whiteSpace: 'nowrap',
                    width: col.width,
                  }}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  style={{
                    padding: '48px 20px',
                    textAlign: 'center',
                    color: colors.slate400,
                    fontSize: 14,
                  }}
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              rows.map((row, i) => (
                <tr
                  key={i}
                  style={{
                    borderBottom: i < rows.length - 1 ? `1px solid ${colors.border}` : 'none',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = colors.slate50)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  {columns.map((col) => {
                    const value = row[col.key as string];
                    return (
                      <td
                        key={String(col.key)}
                        style={{
                          padding: '13px 20px',
                          fontSize: 14,
                          color: colors.slate700,
                          textAlign: col.align ?? 'left',
                          verticalAlign: 'middle',
                        }}
                      >
                        {col.render ? col.render(value, row) : String(value ?? '—')}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
