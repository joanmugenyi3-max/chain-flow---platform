import React from 'react';
import PageLayout from '@/components/layout/PageLayout';
import PageHeader from '@/components/ui/PageHeader';
import StatCard from '@/components/ui/StatCard';
import DataTable, { Column } from '@/components/ui/DataTable';
import { colors, radius, font } from '@/lib/styles';

// ── Mock data ─────────────────────────────────────────────────────────────────
interface KpiRow { module: string; metric: string; value: string; vs: string; trend: string }

const KPIS: KpiRow[] = [
  { module: 'Procurement', metric: 'PO Cycle Time (avg)',     value: '4.2 days',  vs: '-0.8d vs last month', trend: 'up' },
  { module: 'Procurement', metric: 'Supplier On-Time Rate',   value: '91.4%',     vs: '+1.2% vs last month', trend: 'up' },
  { module: 'Inventory',   metric: 'Stock Turnover Rate',     value: '8.3×/yr',   vs: '+0.4 vs last quarter', trend: 'up' },
  { module: 'Inventory',   metric: 'Fill Rate',               value: '96.1%',     vs: '-0.3% vs last month', trend: 'down' },
  { module: 'Logistics',   metric: 'On-Time Delivery (OTD)',  value: '87.3%',     vs: '+2.1% vs last month', trend: 'up' },
  { module: 'Logistics',   metric: 'Avg. Transit Time',       value: '3.8 days',  vs: '-0.2d vs last month', trend: 'up' },
  { module: 'Mining',      metric: 'Daily Production (avg)',  value: '14,190 t',  vs: '+3.2% vs last week',  trend: 'up' },
  { module: 'Mining',      metric: 'Equipment Availability',  value: '88.2%',     vs: '+1.1% vs last week',  trend: 'up' },
  { module: 'Mining',      metric: 'LTIFR (rolling 12mo)',    value: '0.42',      vs: '-0.08 vs last year',  trend: 'up' },
];

// Sparkline bar visual
function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  const bars = Array.from({ length: 8 }, (_, i) =>
    Math.round(max * (0.6 + Math.random() * 0.4))
  );
  bars[bars.length - 1] = value;
  const barMax = Math.max(...bars);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 28 }}>
      {bars.map((b, i) => (
        <div key={i} style={{ width: 6, height: `${(b / barMax) * 100}%`, background: i === bars.length - 1 ? color : color + '40', borderRadius: 2 }} />
      ))}
    </div>
  );
}

const kpiCols: Column<KpiRow>[] = [
  { key: 'module', label: 'Module', width: 120, render: (v) => (
    <span style={{ fontSize: 12, fontWeight: 600, color: colors.primary, background: colors.primaryLight, padding: '2px 8px', borderRadius: 999, fontFamily: font.sans }}>{String(v)}</span>
  )},
  { key: 'metric', label: 'KPI' },
  { key: 'value',  label: 'Current Value', align: 'right', render: (v) => <span style={{ fontWeight: 700, fontSize: 15, color: colors.slate900 }}>{String(v)}</span> },
  { key: 'vs',     label: 'vs Previous', render: (v, r) => (
    <span style={{ fontSize: 12, fontWeight: 600, color: r.trend === 'up' ? colors.success : colors.danger }}>{r.trend === 'up' ? '↑ ' : '↓ '}{String(v)}</span>
  )},
  { key: 'trend',  label: 'Trend', render: (_, r) => (
    <MiniBar value={80} max={100} color={r.trend === 'up' ? colors.success : colors.danger} />
  )},
];

export default function AnalyticsPage() {
  return (
    <PageLayout>
      <PageHeader
        title="Analytics"
        description="Real-time KPIs and performance metrics across all supply chain modules."
        icon="📊"
        action={{ label: 'Export Report' }}
      />

      {/* Top KPIs */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 28, flexWrap: 'wrap' }}>
        <StatCard label="Overall Supply Chain Score" value="91 / 100"  trendValue="2 pts"  trend="up"   sub="vs last month"       icon="🏆" accent={colors.success} />
        <StatCard label="Total Spend (April)"        value="$108,420"  trendValue="8%"     trend="up"   sub="vs March"            icon="💰" />
        <StatCard label="Active Alerts"              value="3"         trendValue="2"      trend="down" sub="resolved this week"   icon="🔔" accent={colors.warning} />
        <StatCard label="AI Insights Generated"      value="18"        sub="last 7 days"                                          icon="🧠" accent={colors.info} />
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 28 }}>
        {/* Spend over time */}
        <div style={{ background: colors.white, border: `1px solid ${colors.border}`, borderRadius: radius.lg, padding: '20px 24px', boxShadow: colors.shadow }}>
          <div style={{ fontWeight: 600, fontSize: 15, color: colors.slate900, marginBottom: 4, fontFamily: font.sans }}>Monthly Spend</div>
          <div style={{ fontSize: 12, color: colors.slate400, marginBottom: 16, fontFamily: font.sans }}>Last 6 months · USD</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 120 }}>
            {[78400, 92100, 105600, 88200, 95400, 108420].map((v, i) => {
              const months = ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'];
              const max = 120000;
              const isLast = i === 5;
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: '100%', height: `${(v / max) * 100}%`, background: isLast ? colors.primary : colors.primaryLight, borderRadius: '4px 4px 0 0', transition: 'height 0.5s' }} />
                  <div style={{ fontSize: 10, color: colors.slate400, fontFamily: font.sans }}>{months[i]}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Module performance */}
        <div style={{ background: colors.white, border: `1px solid ${colors.border}`, borderRadius: radius.lg, padding: '20px 24px', boxShadow: colors.shadow }}>
          <div style={{ fontWeight: 600, fontSize: 15, color: colors.slate900, marginBottom: 4, fontFamily: font.sans }}>Module Performance</div>
          <div style={{ fontSize: 12, color: colors.slate400, marginBottom: 16, fontFamily: font.sans }}>Score out of 100</div>
          {[
            { label: 'Mining',      score: 91, color: colors.mining },
            { label: 'Logistics',   score: 87, color: colors.info },
            { label: 'Procurement', score: 94, color: '#7c3aed' },
            { label: 'Inventory',   score: 89, color: colors.success },
          ].map((m) => (
            <div key={m.label} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 13, color: colors.slate700, fontFamily: font.sans }}>{m.label}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: m.color, fontFamily: font.sans }}>{m.score}</span>
              </div>
              <div style={{ height: 8, background: colors.slate100, borderRadius: radius.full, overflow: 'hidden' }}>
                <div style={{ width: `${m.score}%`, height: '100%', background: m.color, borderRadius: radius.full }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* KPI table */}
      <DataTable<KpiRow>
        title="All KPIs — Detailed View"
        columns={kpiCols}
        rows={KPIS}
      />
    </PageLayout>
  );
}
