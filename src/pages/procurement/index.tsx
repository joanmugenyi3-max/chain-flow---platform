import React, { useState } from 'react';
import PageLayout from '@/components/layout/PageLayout';
import ModuleGuard from '@/components/layout/ModuleGuard';
import PageHeader from '@/components/ui/PageHeader';
import StatCard from '@/components/ui/StatCard';
import Badge from '@/components/ui/Badge';
import DataTable, { Column } from '@/components/ui/DataTable';
import { usePurchaseOrders } from '@/modules/procurement/hooks/usePurchaseOrders';
import type { PurchaseOrder, POStatus } from '@/modules/procurement/types';
import { colors, radius, font } from '@/lib/styles';

const STATUS_VARIANT: Record<POStatus, 'success' | 'warning' | 'danger' | 'info' | 'neutral'> = {
  DRAFT:            'neutral',
  PENDING_APPROVAL: 'warning',
  APPROVED:         'success',
  SENT:             'info',
  RECEIVED:         'success',
  CANCELLED:        'neutral',
};

const FILTERS = [
  { label: 'All',      value: 'ALL' },
  { label: 'Pending',  value: 'PENDING_APPROVAL' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Sent',     value: 'SENT' },
  { label: 'Received', value: 'RECEIVED' },
];

function fmt(n: number) {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function ProcurementPage() {
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const { orders, loading, approve, reject } = usePurchaseOrders({ status: activeFilter });

  const pending   = orders.filter(o => o.status === 'PENDING_APPROVAL').length;
  const approved  = orders.filter(o => o.status === 'APPROVED').length;
  const totalSpend = orders.reduce((s, o) => s + o.amount, 0);

  const cols: Column<PurchaseOrder>[] = [
    {
      key: 'number', label: 'PO Number', width: 130,
      render: (v) => (
        <span style={{ fontFamily: font.sans, fontWeight: 700, fontSize: 13, color: colors.primary, letterSpacing: '-0.2px' }}>{String(v)}</span>
      ),
    },
    { key: 'supplierName', label: 'Supplier' },
    { key: 'category', label: 'Category' },
    {
      key: 'status', label: 'Status',
      render: (v) => <Badge variant={STATUS_VARIANT[v as POStatus]}>{String(v).replace('_', ' ')}</Badge>,
    },
    {
      key: 'priority', label: 'Priority',
      render: (v) => {
        const c = v === 'URGENT' ? colors.danger : v === 'HIGH' ? colors.warning : colors.slate400;
        return <span style={{ fontSize: 12, fontWeight: 600, color: c, fontFamily: font.sans }}>{String(v)}</span>;
      },
    },
    {
      key: 'amount', label: 'Amount', align: 'right',
      render: (v) => <span style={{ fontWeight: 700, color: colors.slate900, fontFamily: font.sans }}>{fmt(v as number)}</span>,
    },
    {
      key: 'dueDate', label: 'Due Date',
      render: (v) => <span style={{ fontSize: 13, color: colors.slate500 }}>{String(v).slice(0, 10)}</span>,
    },
    {
      key: 'id', label: 'Actions', width: 160,
      render: (v, row) => row.status === 'PENDING_APPROVAL' ? (
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            disabled={approvingId === row.id}
            onClick={async (e) => { e.stopPropagation(); setApprovingId(row.id); await approve(row.id); setApprovingId(null); }}
            style={{
              background: colors.success, color: colors.white, border: 'none',
              borderRadius: radius.sm, padding: '4px 12px', fontSize: 12,
              fontWeight: 600, cursor: 'pointer', fontFamily: font.sans,
            }}
          >
            Approve
          </button>
          <button
            disabled={approvingId === row.id}
            onClick={async (e) => { e.stopPropagation(); setApprovingId(row.id); await reject(row.id, 'Rejected'); setApprovingId(null); }}
            style={{
              background: 'none', color: colors.danger,
              border: `1px solid ${colors.danger}`,
              borderRadius: radius.sm, padding: '4px 12px', fontSize: 12,
              fontWeight: 600, cursor: 'pointer', fontFamily: font.sans,
            }}
          >
            Reject
          </button>
        </div>
      ) : null,
    },
  ];

  return (
    <PageLayout>
      <ModuleGuard moduleId="procurement">
        <PageHeader
          title="Procurement"
          description="Purchase orders, supplier management and contract lifecycle."
          icon="🛒"
          accentColor="#7c3aed"
          action={{ label: '+ New PO' }}
        />

        <div style={{ display: 'flex', gap: 16, marginBottom: 28, flexWrap: 'wrap' }}>
          <StatCard label="Pending Approvals"  value={String(pending)}      trendValue="1" trend="down" sub="vs last week"   icon="⏳" accent={colors.warning} />
          <StatCard label="Approved This Month" value={String(approved)}     sub="purchase orders"                            icon="✅" accent={colors.success} />
          <StatCard label="Total Spend"         value={fmt(totalSpend)}      sub="all active POs"                             icon="💰" />
          <StatCard label="Active Suppliers"    value="12"                   sub="approved vendors"                           icon="🏭" accent="#7c3aed" />
        </div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 16, flexWrap: 'wrap' }}>
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setActiveFilter(f.value)}
              style={{
                padding: '6px 16px', borderRadius: radius.full, border: 'none',
                background: activeFilter === f.value ? colors.primary : colors.slate100,
                color: activeFilter === f.value ? colors.white : colors.slate600,
                fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: font.sans,
                transition: 'all 0.15s',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        <DataTable<PurchaseOrder>
          title="Purchase Orders"
          columns={cols}
          rows={orders}
          loading={loading}
          emptyMessage="No purchase orders found."
        />

        {/* Supplier scorecard */}
        <div style={{ marginTop: 24, background: colors.white, border: `1px solid ${colors.border}`, borderRadius: radius.lg, padding: '20px 24px', boxShadow: colors.shadow }}>
          <h3 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 600, color: colors.slate900, fontFamily: font.sans }}>Top Suppliers</h3>
          {[
            { name: 'Atlas Mining Supplies', score: 96, ytd: '$42,000', country: 'ZA' },
            { name: 'Nordic Drill Corp',     score: 91, ytd: '$28,500', country: 'NO' },
            { name: 'SafeGuard PPE Ltd',     score: 88, ytd: '$14,200', country: 'ZA' },
            { name: 'TechParts Global',      score: 84, ytd: '$21,300', country: 'US' },
          ].map((s, i, arr) => (
            <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 0', borderBottom: i < arr.length - 1 ? `1px solid ${colors.border}` : 'none' }}>
              <div style={{ width: 36, height: 36, borderRadius: radius.md, background: '#7c3aed18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 11, color: '#7c3aed', fontFamily: font.sans }}>
                {s.country}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14, color: colors.slate900, fontFamily: font.sans }}>{s.name}</div>
                <div style={{ fontSize: 12, color: colors.slate400, fontFamily: font.sans }}>YTD Spend: {s.ytd}</div>
              </div>
              <div style={{ textAlign: 'right', minWidth: 60 }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: s.score >= 90 ? colors.success : colors.warning, fontFamily: font.sans }}>{s.score}</div>
                <div style={{ fontSize: 11, color: colors.slate400, fontFamily: font.sans }}>Score</div>
              </div>
              <div style={{ width: 80, height: 6, background: colors.slate100, borderRadius: radius.full, overflow: 'hidden' }}>
                <div style={{ width: `${s.score}%`, height: '100%', background: s.score >= 90 ? colors.success : colors.warning, borderRadius: radius.full }} />
              </div>
            </div>
          ))}
        </div>
      </ModuleGuard>
    </PageLayout>
  );
}
