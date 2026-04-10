import React, { useState } from 'react';
import PageLayout from '@/components/layout/PageLayout';
import PageHeader from '@/components/ui/PageHeader';
import StatCard from '@/components/ui/StatCard';
import Badge from '@/components/ui/Badge';
import DataTable, { Column } from '@/components/ui/DataTable';
import { colors, radius, font } from '@/lib/styles';

// ── Mock data ────────────────────────────────────────────────────────────────
interface PurchaseOrder {
  id: string; supplier: string; category: string; date: string;
  amount: string; currency: string; status: string; priority: string; dueDate: string;
}
interface Supplier {
  id: string; name: string; country: string; category: string;
  rating: number; activeContracts: number; ytdSpend: string; status: string;
}
interface Contract {
  id: string; title: string; supplier: string; type: string;
  value: string; startDate: string; endDate: string; status: string;
}

const POS: PurchaseOrder[] = [
  { id: 'PO-2026-0041', supplier: 'CMCK Mining Supplies',     category: 'Equipment Parts', date: '2026-04-09', amount: '$48,200',  currency: 'USD', status: 'approved',          priority: 'High',   dueDate: '2026-04-20' },
  { id: 'PO-2026-0040', supplier: 'African Steel DRC',        category: 'Raw Materials',   date: '2026-04-08', amount: '$12,750',  currency: 'USD', status: 'pending_approval',  priority: 'Medium', dueDate: '2026-04-25' },
  { id: 'PO-2026-0039', supplier: 'Lubumbashi Tech',          category: 'IT Equipment',    date: '2026-04-07', amount: '$6,400',   currency: 'USD', status: 'sent',              priority: 'Low',    dueDate: '2026-05-01' },
  { id: 'PO-2026-0038', supplier: 'CMCK Mining Supplies',     category: 'Consumables',     date: '2026-04-06', amount: '$3,100',   currency: 'USD', status: 'received',          priority: 'Low',    dueDate: '2026-04-15' },
  { id: 'PO-2026-0037', supplier: 'SafetyFirst Africa',       category: 'Safety Gear',     date: '2026-04-05', amount: '$9,870',   currency: 'USD', status: 'approved',          priority: 'Urgent', dueDate: '2026-04-12' },
  { id: 'PO-2026-0036', supplier: 'Kamoto Copper Company',    category: 'Services',        date: '2026-04-03', amount: '$22,500',  currency: 'USD', status: 'received',          priority: 'Medium', dueDate: '2026-04-10' },
  { id: 'PO-2026-0035', supplier: 'TransAfrique Logistics',   category: 'Logistics',       date: '2026-04-01', amount: '$5,600',   currency: 'USD', status: 'cancelled',         priority: 'Low',    dueDate: '—' },
];

const SUPPLIERS: Supplier[] = [
  { id: 'SUP-001', name: 'CMCK Mining Supplies',   country: 'DRC',      category: 'Equipment',   rating: 4.7, activeContracts: 3, ytdSpend: '$198,400', status: 'active' },
  { id: 'SUP-002', name: 'African Steel DRC',      country: 'DRC',      category: 'Materials',   rating: 4.1, activeContracts: 1, ytdSpend: '$87,200',  status: 'active' },
  { id: 'SUP-003', name: 'SafetyFirst Africa',     country: 'South Africa', category: 'Safety',  rating: 4.8, activeContracts: 2, ytdSpend: '$45,100',  status: 'active' },
  { id: 'SUP-004', name: 'Lubumbashi Tech',        country: 'DRC',      category: 'IT',          rating: 3.9, activeContracts: 1, ytdSpend: '$28,500',  status: 'active' },
  { id: 'SUP-005', name: 'Kamoto Copper Company',  country: 'DRC',      category: 'Services',    rating: 4.5, activeContracts: 2, ytdSpend: '$112,000', status: 'active' },
];

const CONTRACTS: Contract[] = [
  { id: 'CTR-018', title: 'Annual Equipment Supply Agreement', supplier: 'CMCK Mining Supplies', type: 'Supply',    value: '$420,000', startDate: '2026-01-01', endDate: '2026-12-31', status: 'active' },
  { id: 'CTR-017', title: 'Safety Equipment Framework',        supplier: 'SafetyFirst Africa',  type: 'Framework', value: '$80,000',  startDate: '2026-01-01', endDate: '2026-12-31', status: 'active' },
  { id: 'CTR-016', title: 'IT Services & Support SLA',         supplier: 'Lubumbashi Tech',     type: 'Service',   value: '$36,000',  startDate: '2026-01-01', endDate: '2026-06-30', status: 'expiring_soon' },
  { id: 'CTR-015', title: 'Copper Processing Services',        supplier: 'Kamoto Copper Co.',   type: 'Service',   value: '$250,000', startDate: '2025-07-01', endDate: '2026-06-30', status: 'active' },
];

const poStatusVariant = (s: string) => ({
  approved: 'success', pending_approval: 'warning', sent: 'info',
  received: 'neutral', cancelled: 'danger', draft: 'neutral'
} as Record<string, 'success'|'warning'|'info'|'neutral'|'danger'>)[s] ?? 'neutral';

const priorityVariant = (p: string) => ({
  Urgent: 'danger', High: 'warning', Medium: 'info', Low: 'neutral'
} as Record<string, 'danger'|'warning'|'info'|'neutral'>)[p] ?? 'neutral';

// ── Star rating ───────────────────────────────────────────────────────────────
function StarRating({ value }: { value: number }) {
  return (
    <span style={{ fontSize: 13, color: colors.warning }}>
      {'★'.repeat(Math.floor(value))}{'☆'.repeat(5 - Math.floor(value))}
      <span style={{ color: colors.slate500, marginLeft: 4 }}>{value}</span>
    </span>
  );
}

// ── Columns ──────────────────────────────────────────────────────────────────
const poCols: Column<PurchaseOrder>[] = [
  { key: 'id',       label: 'PO Number', width: 130, render: (v) => <span style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: 13 }}>{String(v)}</span> },
  { key: 'supplier', label: 'Supplier', render: (v, r) => (
    <div>
      <div style={{ fontWeight: 500, color: colors.slate900 }}>{String(v)}</div>
      <div style={{ fontSize: 12, color: colors.slate400 }}>{r.category}</div>
    </div>
  )},
  { key: 'date',     label: 'Date' },
  { key: 'amount',   label: 'Amount',   align: 'right', render: (v) => <span style={{ fontWeight: 700, color: colors.slate900 }}>{String(v)}</span> },
  { key: 'priority', label: 'Priority', render: (v) => <Badge label={String(v)} variant={priorityVariant(String(v))} /> },
  { key: 'status',   label: 'Status',   render: (v) => {
    const label = String(v).replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase());
    return <Badge label={label} variant={poStatusVariant(String(v))} />;
  }},
  { key: 'dueDate',  label: 'Due Date' },
];

const supplierCols: Column<Supplier>[] = [
  { key: 'name',            label: 'Supplier', render: (v, r) => (
    <div>
      <div style={{ fontWeight: 600, color: colors.slate900 }}>{String(v)}</div>
      <div style={{ fontSize: 12, color: colors.slate400 }}>{r.id} · {r.country}</div>
    </div>
  )},
  { key: 'category',        label: 'Category' },
  { key: 'rating',          label: 'Rating',   render: (v) => <StarRating value={Number(v)} /> },
  { key: 'activeContracts', label: 'Contracts', align: 'center' },
  { key: 'ytdSpend',        label: 'YTD Spend', align: 'right', render: (v) => <span style={{ fontWeight: 700 }}>{String(v)}</span> },
  { key: 'status',          label: 'Status',   render: (v) => <Badge label={String(v).charAt(0).toUpperCase() + String(v).slice(1)} variant="success" /> },
];

const contractCols: Column<Contract>[] = [
  { key: 'id',        label: 'ID',       width: 90 },
  { key: 'title',     label: 'Contract', render: (v, r) => (
    <div>
      <div style={{ fontWeight: 500, color: colors.slate900 }}>{String(v)}</div>
      <div style={{ fontSize: 12, color: colors.slate400 }}>{r.supplier}</div>
    </div>
  )},
  { key: 'type',      label: 'Type',  render: (v) => <Badge label={String(v)} variant="neutral" dot={false} /> },
  { key: 'value',     label: 'Value', align: 'right', render: (v) => <span style={{ fontWeight: 700 }}>{String(v)}</span> },
  { key: 'startDate', label: 'Start Date' },
  { key: 'endDate',   label: 'End Date' },
  { key: 'status',    label: 'Status', render: (v) => <Badge label={String(v) === 'expiring_soon' ? 'Expiring Soon' : 'Active'} variant={String(v) === 'expiring_soon' ? 'warning' : 'success'} /> },
];

// ── Spend by category ─────────────────────────────────────────────────────────
const SPEND_CATEGORIES = [
  { label: 'Equipment',  pct: 42, amount: '$198K' },
  { label: 'Services',   pct: 24, amount: '$112K' },
  { label: 'Materials',  pct: 19, amount: '$87K' },
  { label: 'Safety',     pct: 10, amount: '$45K' },
  { label: 'IT & Other', pct: 5,  amount: '$22K' },
];

function SpendPanel() {
  const barColors = [colors.primary, colors.info, colors.success, colors.warning, colors.slate400];
  return (
    <div style={{
      background: colors.white, border: `1px solid ${colors.border}`,
      borderRadius: radius.lg, padding: '20px 24px', boxShadow: colors.shadow,
    }}>
      <div style={{ fontWeight: 600, fontSize: 15, color: colors.slate900, marginBottom: 4, fontFamily: font.sans }}>Spend by Category</div>
      <div style={{ fontSize: 12, color: colors.slate400, marginBottom: 16, fontFamily: font.sans }}>YTD 2026</div>
      {SPEND_CATEGORIES.map((c, i) => (
        <div key={c.label} style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: 13, color: colors.slate700, fontFamily: font.sans }}>{c.label}</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: colors.slate900, fontFamily: font.sans }}>{c.amount}</span>
          </div>
          <div style={{ height: 6, background: colors.slate100, borderRadius: radius.full, overflow: 'hidden' }}>
            <div style={{ width: `${c.pct}%`, height: '100%', background: barColors[i], borderRadius: radius.full, transition: 'width 0.5s ease' }} />
          </div>
          <div style={{ fontSize: 11, color: colors.slate400, marginTop: 2, fontFamily: font.sans }}>{c.pct}%</div>
        </div>
      ))}
    </div>
  );
}

// ── Tab filter ────────────────────────────────────────────────────────────────
const TABS = ['All', 'Pending Approval', 'Approved', 'Sent', 'Received'];

export default function ProcurementPage() {
  const [activeTab, setActiveTab] = useState('All');

  const filtered = activeTab === 'All' ? POS : POS.filter(p => {
    const statusMap: Record<string, string> = {
      'Pending Approval': 'pending_approval', 'Approved': 'approved',
      'Sent': 'sent', 'Received': 'received',
    };
    return p.status === statusMap[activeTab];
  });

  return (
    <PageLayout>
      <PageHeader
        title="Procurement"
        description="Manage purchase orders, suppliers, and contracts across your supply chain."
        icon="🛒"
        action={{ label: 'New Purchase Order' }}
      />

      {/* KPIs */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 28, flexWrap: 'wrap' }}>
        <StatCard label="Total PO Value (Apr)"    value="$108,420"   trendValue="12%"  trend="up"   sub="vs March"         icon="💰" />
        <StatCard label="Pending Approval"        value="1"          sub="1 PO awaiting review"     icon="⏳" accent={colors.warning} />
        <StatCard label="Active Suppliers"        value="5"          trendValue="1"    trend="up"   sub="vs last quarter"  icon="🤝" accent={colors.success} />
        <StatCard label="Expiring Contracts"      value="1"          sub="within 90 days"            icon="📋" accent={colors.danger} />
      </div>

      {/* POs + Spend */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 20, marginBottom: 28, alignItems: 'start' }}>
        <div>
          {/* Tab filter */}
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
              </button>
            ))}
          </div>
          <DataTable<PurchaseOrder>
            title="Purchase Orders"
            columns={poCols}
            rows={filtered}
          />
        </div>
        <SpendPanel />
      </div>

      {/* Suppliers */}
      <div style={{ marginBottom: 28 }}>
        <DataTable<Supplier>
          title="Approved Suppliers"
          columns={supplierCols}
          rows={SUPPLIERS}
        />
      </div>

      {/* Contracts */}
      <DataTable<Contract>
        title="Active Contracts"
        columns={contractCols}
        rows={CONTRACTS}
      />
    </PageLayout>
  );
}
