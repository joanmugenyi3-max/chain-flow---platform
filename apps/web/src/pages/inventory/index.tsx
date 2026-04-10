import React, { useState } from 'react';
import PageLayout from '../../components/layout/PageLayout';
import PageHeader from '../../components/ui/PageHeader';
import StatCard from '../../components/ui/StatCard';
import Badge from '../../components/ui/Badge';
import DataTable, { Column } from '../../components/ui/DataTable';
import { colors, radius, font } from '../../lib/styles';

// ── Mock data ────────────────────────────────────────────────────────────────
interface InventoryItem {
  sku: string; name: string; category: string; warehouse: string;
  stock: number; reorderPoint: number; unitCost: string; totalValue: string; status: string;
}
interface Warehouse {
  id: string; name: string; location: string; type: string;
  capacity: number; used: number; items: number; manager: string;
}
interface Movement {
  id: string; date: string; type: string; product: string;
  warehouse: string; qty: number; reference: string;
}

const ITEMS: InventoryItem[] = [
  { sku: 'DRL-BIT-12', name: 'Drill Bit 12"',          category: 'Equipment Parts', warehouse: 'WH-Nord',  stock: 48,   reorderPoint: 20,  unitCost: '$124',  totalValue: '$5,952',  status: 'ok' },
  { sku: 'EXP-ANF-50', name: 'ANFO Explosive 50kg',    category: 'Explosives',      warehouse: 'WH-Sud',   stock: 12,   reorderPoint: 30,  unitCost: '$89',   totalValue: '$1,068',  status: 'low' },
  { sku: 'SAF-HELM-L', name: 'Safety Helmet (Large)',   category: 'Safety Gear',     warehouse: 'WH-Nord',  stock: 200,  reorderPoint: 50,  unitCost: '$18',   totalValue: '$3,600',  status: 'ok' },
  { sku: 'LUB-ENG-20L', name: 'Engine Lubricant 20L',  category: 'Consumables',     warehouse: 'WH-Est',   stock: 6,    reorderPoint: 25,  unitCost: '$45',   totalValue: '$270',    status: 'critical' },
  { sku: 'CONV-BELT-A', name: 'Conveyor Belt Type A',   category: 'Equipment Parts', warehouse: 'WH-Sud',   stock: 4,    reorderPoint: 2,   unitCost: '$1,200', totalValue: '$4,800', status: 'ok' },
  { sku: 'FILT-AIR-3', name: 'Air Filter Kit',         category: 'Consumables',     warehouse: 'WH-Nord',  stock: 85,   reorderPoint: 40,  unitCost: '$12',   totalValue: '$1,020',  status: 'ok' },
  { sku: 'PUMP-SEAL-B', name: 'Pump Seal Set B',       category: 'Equipment Parts', warehouse: 'WH-Est',   stock: 3,    reorderPoint: 10,  unitCost: '$340',  totalValue: '$1,020',  status: 'low' },
  { sku: 'CABL-PWR-50', name: 'Power Cable 50m',       category: 'Electrical',      warehouse: 'WH-Nord',  stock: 22,   reorderPoint: 15,  unitCost: '$78',   totalValue: '$1,716',  status: 'ok' },
];

const WAREHOUSES: Warehouse[] = [
  { id: 'WH-Nord', name: 'Warehouse Nord',    location: 'Kolwezi, DRC',     type: 'Central',  capacity: 5000, used: 3840, items: 142, manager: 'Pierre Kabangu' },
  { id: 'WH-Sud',  name: 'Warehouse Sud',     location: 'Likasi, DRC',      type: 'Regional', capacity: 3000, used: 1920, items: 87,  manager: 'Marie Nsenga' },
  { id: 'WH-Est',  name: 'Warehouse Est',     location: 'Lubumbashi, DRC',  type: 'Regional', capacity: 2500, used: 980,  items: 63,  manager: 'Jean Kasongo' },
];

const MOVEMENTS: Movement[] = [
  { id: 'MOV-0441', date: '2026-04-10 08:14', type: 'Inbound',    product: 'Drill Bit 12"',       warehouse: 'WH-Nord', qty: +24,  reference: 'PO-2026-0041' },
  { id: 'MOV-0440', date: '2026-04-10 07:50', type: 'Outbound',   product: 'ANFO Explosive 50kg', warehouse: 'WH-Sud',  qty: -8,   reference: 'WO-Site-Nord-021' },
  { id: 'MOV-0439', date: '2026-04-09 16:30', type: 'Transfer',   product: 'Safety Helmet (L)',   warehouse: 'WH-Est',  qty: +50,  reference: 'TRF-0088' },
  { id: 'MOV-0438', date: '2026-04-09 14:10', type: 'Outbound',   product: 'Engine Lubricant 20L', warehouse: 'WH-Est', qty: -12,  reference: 'WO-Site-Est-007' },
  { id: 'MOV-0437', date: '2026-04-09 11:00', type: 'Adjustment', product: 'Air Filter Kit',      warehouse: 'WH-Nord', qty: -3,   reference: 'ADJ-DAMAGED' },
  { id: 'MOV-0436', date: '2026-04-08 15:22', type: 'Inbound',    product: 'Pump Seal Set B',     warehouse: 'WH-Est',  qty: +5,   reference: 'PO-2026-0038' },
];

const stockStatusVariant = (s: string) =>
  ({ ok: 'success', low: 'warning', critical: 'danger' } as Record<string, 'success'|'warning'|'danger'>)[s] ?? 'neutral';

const movTypeVariant = (t: string) =>
  ({ Inbound: 'success', Outbound: 'info', Transfer: 'primary', Adjustment: 'warning' } as Record<string, 'success'|'info'|'primary'|'warning'>)[t] ?? 'neutral';

// ── Columns ──────────────────────────────────────────────────────────────────
const itemCols: Column<InventoryItem>[] = [
  { key: 'sku',        label: 'SKU',       width: 120, render: (v) => <span style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 600, color: colors.slate600 }}>{String(v)}</span> },
  { key: 'name',       label: 'Product',   render: (v, r) => (
    <div>
      <div style={{ fontWeight: 500, color: colors.slate900 }}>{String(v)}</div>
      <div style={{ fontSize: 12, color: colors.slate400 }}>{r.category}</div>
    </div>
  )},
  { key: 'warehouse',  label: 'Warehouse' },
  { key: 'stock',      label: 'Stock',     align: 'right', render: (v, r) => (
    <div style={{ textAlign: 'right' }}>
      <span style={{ fontWeight: 700, fontSize: 15, color: Number(v) <= r.reorderPoint ? colors.danger : colors.slate900 }}>{Number(v)}</span>
      <div style={{ fontSize: 11, color: colors.slate400 }}>ROP: {r.reorderPoint}</div>
    </div>
  )},
  { key: 'totalValue', label: 'Value',     align: 'right', render: (v) => <span style={{ fontWeight: 600 }}>{String(v)}</span> },
  { key: 'status',     label: 'Status',    render: (v) => {
    const labels: Record<string, string> = { ok: 'In Stock', low: 'Low Stock', critical: 'Critical' };
    return <Badge label={labels[String(v)] ?? String(v)} variant={stockStatusVariant(String(v))} />;
  }},
];

const whCols: Column<Warehouse>[] = [
  { key: 'name',     label: 'Warehouse', render: (v, r) => (
    <div>
      <div style={{ fontWeight: 600, color: colors.slate900 }}>{String(v)}</div>
      <div style={{ fontSize: 12, color: colors.slate400 }}>{r.location}</div>
    </div>
  )},
  { key: 'type',     label: 'Type',     render: (v) => <Badge label={String(v)} variant="neutral" dot={false} /> },
  { key: 'manager',  label: 'Manager' },
  { key: 'items',    label: 'SKUs',     align: 'right' },
  { key: 'used',     label: 'Utilization', align: 'right', render: (v, r) => {
    const pct = Math.round((Number(v) / r.capacity) * 100);
    const color = pct > 85 ? colors.danger : pct > 65 ? colors.warning : colors.success;
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
        <div style={{ width: 64, height: 6, background: colors.slate100, borderRadius: radius.full, overflow: 'hidden' }}>
          <div style={{ width: `${pct}%`, height: '100%', background: color }} />
        </div>
        <span style={{ fontWeight: 600, color, minWidth: 34, textAlign: 'right', fontSize: 13 }}>{pct}%</span>
      </div>
    );
  }},
  { key: 'capacity', label: 'Capacity', align: 'right', render: (v, r) => `${Number(r.used).toLocaleString()} / ${Number(v).toLocaleString()} m²` },
];

const movCols: Column<Movement>[] = [
  { key: 'date',      label: 'Date/Time',  width: 155, render: (v) => <span style={{ fontSize: 12, fontFamily: 'monospace' }}>{String(v)}</span> },
  { key: 'type',      label: 'Type',       render: (v) => <Badge label={String(v)} variant={movTypeVariant(String(v))} /> },
  { key: 'product',   label: 'Product' },
  { key: 'warehouse', label: 'Warehouse' },
  { key: 'qty',       label: 'Qty',  align: 'right', render: (v) => (
    <span style={{ fontWeight: 700, color: Number(v) > 0 ? colors.success : colors.danger }}>
      {Number(v) > 0 ? '+' : ''}{Number(v)}
    </span>
  )},
  { key: 'reference', label: 'Reference', render: (v) => <span style={{ fontSize: 12, fontFamily: 'monospace', color: colors.slate500 }}>{String(v)}</span> },
];

// ── Category donut ────────────────────────────────────────────────────────────
const CATEGORIES = [
  { label: 'Equipment Parts', count: 3, value: '$11,772', color: colors.primary },
  { label: 'Safety Gear',     count: 1, value: '$3,600',  color: colors.success },
  { label: 'Consumables',     count: 2, value: '$1,290',  color: colors.warning },
  { label: 'Explosives',      count: 1, value: '$1,068',  color: colors.danger },
  { label: 'Electrical',      count: 1, value: '$1,716',  color: colors.info },
];

function InventorySummaryPanel() {
  return (
    <div style={{
      background: colors.white, border: `1px solid ${colors.border}`,
      borderRadius: radius.lg, padding: '20px 24px', boxShadow: colors.shadow,
    }}>
      <div style={{ fontWeight: 600, fontSize: 15, color: colors.slate900, marginBottom: 4, fontFamily: font.sans }}>By Category</div>
      <div style={{ fontSize: 12, color: colors.slate400, marginBottom: 16, fontFamily: font.sans }}>Total value: $19,446</div>
      {CATEGORIES.map((c) => (
        <div key={c.label} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: c.color, flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13, color: colors.slate700, fontFamily: font.sans }}>{c.label}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: colors.slate900, fontFamily: font.sans }}>{c.value}</span>
            </div>
            <div style={{ fontSize: 11, color: colors.slate400, fontFamily: font.sans }}>{c.count} SKU{c.count > 1 ? 's' : ''}</div>
          </div>
        </div>
      ))}

      {/* Alerts */}
      <div style={{ marginTop: 20, paddingTop: 16, borderTop: `1px solid ${colors.border}` }}>
        <div style={{ fontWeight: 600, fontSize: 13, color: colors.slate900, marginBottom: 10, fontFamily: font.sans }}>⚠️ Reorder Alerts</div>
        {ITEMS.filter(i => i.status !== 'ok').map(i => (
          <div key={i.sku} style={{
            padding: '8px 10px', borderRadius: radius.md, marginBottom: 6,
            background: i.status === 'critical' ? colors.dangerLight : colors.warningLight,
            border: `1px solid ${i.status === 'critical' ? colors.dangerBorder : colors.warningBorder}`,
          }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: i.status === 'critical' ? colors.danger : '#b45309', fontFamily: font.sans }}>{i.name}</div>
            <div style={{ fontSize: 11, color: colors.slate500, fontFamily: font.sans }}>{i.stock} left · ROP {i.reorderPoint} · {i.warehouse}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Tab filter ────────────────────────────────────────────────────────────────
const TABS = ['All Items', 'Low Stock', 'In Stock'];

export default function InventoryPage() {
  const [activeTab, setActiveTab] = useState('All Items');

  const filtered = activeTab === 'All Items' ? ITEMS
    : activeTab === 'Low Stock' ? ITEMS.filter(i => i.status !== 'ok')
    : ITEMS.filter(i => i.status === 'ok');

  return (
    <PageLayout>
      <PageHeader
        title="Inventory"
        description="Monitor stock levels, warehouse utilization and product movements across all locations."
        icon="📦"
        action={{ label: 'Record Movement' }}
        accentColor={colors.success}
      />

      {/* KPIs */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 28, flexWrap: 'wrap' }}>
        <StatCard label="Total SKUs"        value="380"       sub="across 3 warehouses"             icon="🏷️" />
        <StatCard label="Inventory Value"   value="$19,446"   trendValue="4.2%"  trend="up"  sub="this month"  icon="💎" accent={colors.success} />
        <StatCard label="Low / Critical"    value="3 SKUs"    sub="below reorder point"             icon="⚠️"  accent={colors.warning} />
        <StatCard label="Avg. Utilization"  value="69%"       trendValue="2%"    trend="up"  sub="all warehouses" icon="🏭" accent={colors.info} />
      </div>

      {/* Items table + Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 20, marginBottom: 28, alignItems: 'start' }}>
        <div>
          <div style={{ display: 'flex', gap: 2, marginBottom: 16, background: colors.slate100, borderRadius: radius.lg, padding: 4, width: 'fit-content' }}>
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '6px 14px', borderRadius: radius.md, border: 'none',
                  background: activeTab === tab ? colors.white : 'transparent',
                  color: activeTab === tab ? colors.slate900 : colors.slate500,
                  fontWeight: activeTab === tab ? 600 : 400,
                  fontSize: 13, cursor: 'pointer', fontFamily: font.sans,
                  boxShadow: activeTab === tab ? colors.shadow : 'none',
                  transition: 'all 0.15s',
                }}
              >
                {tab}
                {tab === 'Low Stock' && (
                  <span style={{ marginLeft: 5, background: colors.warning, color: 'white', borderRadius: radius.full, fontSize: 10, padding: '1px 5px', fontWeight: 700 }}>
                    {ITEMS.filter(i => i.status !== 'ok').length}
                  </span>
                )}
              </button>
            ))}
          </div>
          <DataTable<InventoryItem>
            title="Stock Levels"
            columns={itemCols}
            rows={filtered}
          />
        </div>
        <InventorySummaryPanel />
      </div>

      {/* Warehouses */}
      <div style={{ marginBottom: 28 }}>
        <DataTable<Warehouse>
          title="Warehouse Overview"
          columns={whCols}
          rows={WAREHOUSES}
        />
      </div>

      {/* Recent movements */}
      <DataTable<Movement>
        title="Recent Movements"
        columns={movCols}
        rows={MOVEMENTS}
      />
    </PageLayout>
  );
}
