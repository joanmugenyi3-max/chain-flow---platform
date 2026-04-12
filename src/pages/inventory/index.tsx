import React, { useState } from 'react';
import PageLayout from '@/components/layout/PageLayout';
import ModuleGuard from '@/components/layout/ModuleGuard';
import PageHeader from '@/components/ui/PageHeader';
import StatCard from '@/components/ui/StatCard';
import Badge from '@/components/ui/Badge';
import DataTable, { Column } from '@/components/ui/DataTable';
import { useInventory } from '@/modules/inventory/hooks/useInventory';
import type { InventoryItem, StockStatus } from '@/modules/inventory/types';
import { colors, radius, font } from '@/lib/styles';

const STATUS_VARIANT: Record<StockStatus, 'success' | 'warning' | 'danger' | 'info' | 'neutral'> = {
  IN_STOCK:    'success',
  LOW_STOCK:   'warning',
  CRITICAL:    'danger',
  OUT_OF_STOCK:'danger',
  OVERSTOCK:   'info',
};

const FILTERS = [
  { label: 'All',       value: 'ALL' },
  { label: 'Low Stock', value: 'LOW_STOCK' },
  { label: 'Critical',  value: 'CRITICAL' },
  { label: 'In Stock',  value: 'IN_STOCK' },
];

function StockBar({ item }: { item: InventoryItem }) {
  const pct = Math.min(100, Math.round((item.stock / item.maxStock) * 100));
  const color = item.status === 'IN_STOCK' ? colors.success
    : item.status === 'LOW_STOCK' ? colors.warning
    : item.status === 'OVERSTOCK' ? colors.info : colors.danger;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 120 }}>
      <div style={{ flex: 1, height: 6, background: colors.slate100, borderRadius: radius.full, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: radius.full }} />
      </div>
      <span style={{ fontSize: 11, color: colors.slate500, minWidth: 32, fontFamily: font.sans }}>{pct}%</span>
    </div>
  );
}

export default function InventoryPage() {
  const [activeFilter, setActiveFilter] = useState('ALL');
  const { items, loading } = useInventory(activeFilter === 'ALL' ? undefined : activeFilter);

  const lowStock  = items.filter(i => i.status === 'LOW_STOCK' || i.status === 'CRITICAL').length;
  const totalValue = items.reduce((s, i) => s + i.stock * i.unitCost, 0);
  const totalSku  = items.length;

  const cols: Column<InventoryItem>[] = [
    {
      key: 'sku', label: 'SKU', width: 120,
      render: (v) => <span style={{ fontFamily: font.sans, fontWeight: 700, fontSize: 12, color: colors.primary }}>{String(v)}</span>,
    },
    { key: 'name', label: 'Product', render: (v) => <span style={{ fontWeight: 600, fontSize: 13, color: colors.slate900, fontFamily: font.sans }}>{String(v)}</span> },
    { key: 'category', label: 'Category' },
    { key: 'warehouseName', label: 'Warehouse' },
    {
      key: 'stock', label: 'Stock / Level', width: 180,
      render: (v, row) => (
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, color: colors.slate900, marginBottom: 4, fontFamily: font.sans }}>
            {(v as number).toLocaleString()} <span style={{ fontSize: 11, color: colors.slate400 }}>/ {row.maxStock.toLocaleString()}</span>
          </div>
          <StockBar item={row} />
        </div>
      ),
    },
    {
      key: 'status', label: 'Status',
      render: (v) => <Badge variant={STATUS_VARIANT[v as StockStatus]}>{String(v).replace('_', ' ')}</Badge>,
    },
    {
      key: 'unitCost', label: 'Unit Cost', align: 'right',
      render: (v) => <span style={{ fontFamily: font.sans, fontWeight: 600, color: colors.slate700 }}>${(v as number).toFixed(2)}</span>,
    },
    {
      key: 'reorderPoint', label: 'Reorder At', align: 'right',
      render: (v) => <span style={{ fontSize: 13, color: colors.slate500, fontFamily: font.sans }}>{(v as number).toLocaleString()}</span>,
    },
  ];

  return (
    <PageLayout>
      <ModuleGuard moduleId="inventory">
        <PageHeader
          title="Inventory"
          description="Stock levels, warehouse utilization and movement tracking."
          icon="📦"
          accentColor={colors.success}
          action={{ label: '+ Add Item' }}
        />

        <div style={{ display: 'flex', gap: 16, marginBottom: 28, flexWrap: 'wrap' }}>
          <StatCard label="Total SKUs"       value={String(totalSku)}   sub="tracked items"                              icon="📦" />
          <StatCard label="Low Stock Alerts" value={String(lowStock)}   trendValue="1" trend="down" sub="vs last week"  icon="⚠️" accent={colors.warning} />
          <StatCard label="Total Value"      value={'$' + Math.round(totalValue / 1000) + 'K'} sub="at cost"            icon="💎" accent={colors.info} />
          <StatCard label="Warehouses"       value="3"                  sub="active locations"                           icon="🏭" accent={colors.success} />
        </div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 16, flexWrap: 'wrap' }}>
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setActiveFilter(f.value)}
              style={{
                padding: '6px 16px', borderRadius: radius.full, border: 'none',
                background: activeFilter === f.value ? colors.success : colors.slate100,
                color: activeFilter === f.value ? colors.white : colors.slate600,
                fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: font.sans,
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        <DataTable<InventoryItem>
          title="Stock Levels"
          columns={cols}
          rows={items}
          loading={loading}
          emptyMessage="No inventory items found."
        />

        {/* Warehouse utilization */}
        <div style={{ marginTop: 24, background: colors.white, border: `1px solid ${colors.border}`, borderRadius: radius.lg, padding: '20px 24px', boxShadow: colors.shadow }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 600, color: colors.slate900, fontFamily: font.sans }}>Warehouse Utilization</h3>
          {[
            { name: 'WH-Central (Johannesburg)', used: 74, capacity: 50000, unit: 't' },
            { name: 'WH-Nord (Limpopo)',         used: 61, capacity: 30000, unit: 't' },
            { name: 'WH-Transit (Durban)',        used: 38, capacity: 15000, unit: 't' },
          ].map((w) => (
            <div key={w.name} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 13, color: colors.slate700, fontFamily: font.sans }}>{w.name}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: w.used > 70 ? colors.warning : colors.success, fontFamily: font.sans }}>
                  {w.used}% · {Math.round(w.capacity * w.used / 100).toLocaleString()} {w.unit}
                </span>
              </div>
              <div style={{ height: 8, background: colors.slate100, borderRadius: radius.full, overflow: 'hidden' }}>
                <div style={{ width: `${w.used}%`, height: '100%', background: w.used > 80 ? colors.danger : w.used > 60 ? colors.warning : colors.success, borderRadius: radius.full }} />
              </div>
            </div>
          ))}
        </div>

        {/* Recent movements */}
        <div style={{ marginTop: 24, background: colors.white, border: `1px solid ${colors.border}`, borderRadius: radius.lg, padding: '20px 24px', boxShadow: colors.shadow }}>
          <h3 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 600, color: colors.slate900, fontFamily: font.sans }}>Recent Movements</h3>
          {[
            { ref: 'MOV-1042', type: 'INBOUND',  product: 'Drill Bit 12"',   qty: '+24', wh: 'WH-Nord',    time: '08:14' },
            { ref: 'MOV-1041', type: 'OUTBOUND', product: 'Engine Oil 20L',  qty: '-12', wh: 'WH-Central', time: '07:30' },
            { ref: 'MOV-1040', type: 'TRANSFER', product: 'Safety Helmets',  qty: '50',  wh: 'WH-Transit → WH-Nord', time: '06:55' },
            { ref: 'MOV-1039', type: 'INBOUND',  product: 'Steel Cable 100m',qty: '+8',  wh: 'WH-Central', time: 'Yesterday' },
          ].map((m, i, arr) => (
            <div key={m.ref} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 0', borderBottom: i < arr.length - 1 ? `1px solid ${colors.border}` : 'none' }}>
              <Badge variant={m.type === 'INBOUND' ? 'success' : m.type === 'OUTBOUND' ? 'danger' : 'info'}>{m.type}</Badge>
              <span style={{ flex: 1, fontSize: 13, color: colors.slate700, fontFamily: font.sans }}>{m.product}</span>
              <span style={{ fontWeight: 700, fontSize: 13, color: m.qty.startsWith('+') ? colors.success : m.qty.startsWith('-') ? colors.danger : colors.info, fontFamily: font.sans }}>{m.qty}</span>
              <span style={{ fontSize: 12, color: colors.slate400, fontFamily: font.sans }}>{m.wh}</span>
              <span style={{ fontSize: 11, color: colors.slate300, fontFamily: font.sans, minWidth: 60, textAlign: 'right' }}>{m.time}</span>
            </div>
          ))}
        </div>
      </ModuleGuard>
    </PageLayout>
  );
}
