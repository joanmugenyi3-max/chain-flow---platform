import React, { useState } from 'react';
import PageLayout from '@/components/layout/PageLayout';
import ModuleGuard from '@/components/layout/ModuleGuard';
import PlanGate from '@/components/layout/PlanGate';
import PageHeader from '@/components/ui/PageHeader';
import StatCard from '@/components/ui/StatCard';
import Badge from '@/components/ui/Badge';
import DataTable, { Column } from '@/components/ui/DataTable';
import { colors, radius, font } from '@/lib/styles';

interface Equipment {
  id: string; name: string; type: string; status: string;
  location: string; utilization: number; fuelLevel: number;
  lastPing: string; operator: string;
}

interface ExtractionLog {
  id: string; date: string; shift: string; zone: string;
  ore: number; waste: number; grade: number; equipment: string;
}

const EQUIPMENT: Equipment[] = [
  { id: 'EQ-001', name: 'CAT 390 Excavator',  type: 'Excavator', status: 'ACTIVE',       location: 'Zone A — Pit 2', utilization: 87, fuelLevel: 72, lastPing: '2 min ago', operator: 'Sipho M.' },
  { id: 'EQ-002', name: 'Komatsu HD785',      type: 'Haul Truck', status: 'ACTIVE',       location: 'Zone B — Dump', utilization: 93, fuelLevel: 55, lastPing: '1 min ago', operator: 'Reza A.' },
  { id: 'EQ-003', name: 'Atlas Drill D65',    type: 'Drill Rig',  status: 'IDLE',         location: 'Zone C — Bench', utilization: 0, fuelLevel: 88, lastPing: '12 min ago', operator: '—' },
  { id: 'EQ-004', name: 'Sandvik LH517i',     type: 'LHD Loader', status: 'ACTIVE',       location: 'Zone A — Ramp', utilization: 79, fuelLevel: 61, lastPing: '3 min ago', operator: 'Thandi K.' },
  { id: 'EQ-005', name: 'CAT 793F',           type: 'Haul Truck', status: 'MAINTENANCE',  location: 'Workshop Bay 2', utilization: 0, fuelLevel: 40, lastPing: '6 hr ago',  operator: '—' },
  { id: 'EQ-006', name: 'Liebherr T 264',     type: 'Haul Truck', status: 'ACTIVE',       location: 'Zone B — Pit 1', utilization: 81, fuelLevel: 66, lastPing: '1 min ago', operator: 'Piet V.' },
];

const EXTRACTION: ExtractionLog[] = [
  { id: 'EX-0041', date: '2026-04-11', shift: 'Day',   zone: 'Zone A', ore: 4820, waste: 2100, grade: 1.42, equipment: 'EQ-001, EQ-002' },
  { id: 'EX-0040', date: '2026-04-11', shift: 'Night', zone: 'Zone B', ore: 3910, waste: 1780, grade: 1.31, equipment: 'EQ-004, EQ-006' },
  { id: 'EX-0039', date: '2026-04-10', shift: 'Day',   zone: 'Zone A', ore: 5230, waste: 2300, grade: 1.58, equipment: 'EQ-001, EQ-004' },
  { id: 'EX-0038', date: '2026-04-10', shift: 'Night', zone: 'Zone C', ore: 3780, waste: 1950, grade: 1.22, equipment: 'EQ-002, EQ-006' },
];

const statusColor = (s: string) =>
  s === 'ACTIVE' ? colors.success : s === 'IDLE' ? colors.warning : s === 'MAINTENANCE' ? colors.danger : colors.slate400;

const eqCols: Column<Equipment>[] = [
  {
    key: 'name', label: 'Equipment',
    render: (v, row) => (
      <div>
        <div style={{ fontWeight: 700, fontSize: 13, color: colors.slate900, fontFamily: font.sans }}>{String(v)}</div>
        <div style={{ fontSize: 11, color: colors.slate400, fontFamily: font.sans }}>{row.type} · {row.id}</div>
      </div>
    ),
  },
  {
    key: 'status', label: 'Status',
    render: (v) => {
      const s = String(v);
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: statusColor(s) }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: statusColor(s), fontFamily: font.sans }}>{s}</span>
        </div>
      );
    },
  },
  { key: 'location', label: 'Location', render: (v) => <span style={{ fontSize: 13, color: colors.slate600, fontFamily: font.sans }}>{String(v)}</span> },
  {
    key: 'utilization', label: 'Utilization', width: 140,
    render: (v) => {
      const n = v as number;
      const c = n > 70 ? colors.success : n > 30 ? colors.warning : colors.slate300;
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ flex: 1, height: 6, background: colors.slate100, borderRadius: radius.full, overflow: 'hidden' }}>
            <div style={{ width: `${n}%`, height: '100%', background: c, borderRadius: radius.full }} />
          </div>
          <span style={{ fontSize: 12, color: colors.slate600, minWidth: 32, fontFamily: font.sans }}>{n}%</span>
        </div>
      );
    },
  },
  {
    key: 'fuelLevel', label: 'Fuel', width: 100,
    render: (v) => {
      const n = v as number;
      const c = n > 50 ? colors.success : n > 25 ? colors.warning : colors.danger;
      return <span style={{ fontWeight: 700, fontSize: 13, color: c, fontFamily: font.sans }}>⛽ {n}%</span>;
    },
  },
  { key: 'operator', label: 'Operator', render: (v) => <span style={{ fontSize: 13, color: colors.slate600, fontFamily: font.sans }}>{String(v)}</span> },
  { key: 'lastPing', label: 'Last Ping', render: (v) => <span style={{ fontSize: 12, color: colors.slate400, fontFamily: font.sans }}>{String(v)}</span> },
];

const exCols: Column<ExtractionLog>[] = [
  { key: 'id',    label: 'Log ID', width: 100, render: (v) => <span style={{ fontWeight: 700, color: colors.mining, fontFamily: font.sans, fontSize: 13 }}>{String(v)}</span> },
  { key: 'date',  label: 'Date', render: (v) => <span style={{ fontSize: 13, color: colors.slate600 }}>{String(v)}</span> },
  { key: 'shift', label: 'Shift', render: (v) => <Badge variant={v === 'Day' ? 'warning' : 'neutral'}>{String(v)}</Badge> },
  { key: 'zone',  label: 'Zone' },
  { key: 'ore',   label: 'Ore (t)', align: 'right', render: (v) => <span style={{ fontWeight: 700, color: colors.mining }}>{(v as number).toLocaleString()}</span> },
  { key: 'waste', label: 'Waste (t)', align: 'right', render: (v) => <span style={{ color: colors.slate500 }}>{(v as number).toLocaleString()}</span> },
  { key: 'grade', label: 'Grade (g/t)', align: 'right', render: (v) => <span style={{ fontWeight: 700, color: colors.slate900 }}>{String(v)}</span> },
  { key: 'equipment', label: 'Equipment Used', render: (v) => <span style={{ fontSize: 12, color: colors.slate500, fontFamily: font.sans }}>{String(v)}</span> },
];

export default function MiningPage() {
  const [activeTab, setActiveTab] = useState<'fleet' | 'extraction' | 'safety' | 'esg'>('fleet');

  const activeEq  = EQUIPMENT.filter(e => e.status === 'ACTIVE').length;
  const totalOre  = EXTRACTION.reduce((s, e) => s + e.ore, 0);
  const avgGrade  = EXTRACTION.reduce((s, e) => s + e.grade, 0) / EXTRACTION.length;

  return (
    <PageLayout>
      <ModuleGuard moduleId="mining">
        <PageHeader
          title="Mining Operations"
          description="IoT telemetry, ore extraction, safety management and ESG reporting."
          icon="⛏️"
          accentColor={colors.mining}
          action={{ label: 'Download Report' }}
        />

        <div style={{ display: 'flex', gap: 16, marginBottom: 28, flexWrap: 'wrap' }}>
          <StatCard label="Active Equipment"    value={`${activeEq} / ${EQUIPMENT.length}`} sub="online now"           icon="⚙️"  accent={colors.success} />
          <StatCard label="Today's Production"  value="8,730 t"            trendValue="3.2%" trend="up" sub="vs yesterday"  icon="⛏️"  accent={colors.mining} />
          <StatCard label="Avg Ore Grade"       value={avgGrade.toFixed(2) + ' g/t'} sub="rolling 48h"               icon="💎" />
          <StatCard label="LTIFR (12mo)"        value="0.42"               trendValue="0.08" trend="up" sub="vs last year"  icon="🦺" accent={colors.success} />
        </div>

        {/* Tab nav */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: `2px solid ${colors.border}`, paddingBottom: 0 }}>
          {(['fleet', 'extraction', 'safety', 'esg'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '8px 20px', background: 'none', border: 'none',
                borderBottom: activeTab === tab ? `3px solid ${colors.mining}` : '3px solid transparent',
                color: activeTab === tab ? colors.mining : colors.slate500,
                fontWeight: activeTab === tab ? 700 : 500,
                fontSize: 14, cursor: 'pointer', fontFamily: font.sans,
                marginBottom: -2, textTransform: 'capitalize',
              }}
            >
              {tab === 'fleet' ? '⚙️ Fleet' : tab === 'extraction' ? '⛏️ Extraction' : tab === 'safety' ? '🦺 Safety' : '🌱 ESG'}
            </button>
          ))}
        </div>

        {/* Fleet tab */}
        {activeTab === 'fleet' && (
          <DataTable<Equipment>
            title="Equipment Fleet"
            columns={eqCols}
            rows={EQUIPMENT}
          />
        )}

        {/* Extraction tab */}
        {activeTab === 'extraction' && (
          <DataTable<ExtractionLog>
            title="Extraction Logs"
            columns={exCols}
            rows={EXTRACTION}
          />
        )}

        {/* Safety tab */}
        {activeTab === 'safety' && (
          <PlanGate requiredPlan="MINING_ENTERPRISE">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div style={{ background: colors.white, border: `1px solid ${colors.border}`, borderRadius: radius.lg, padding: '20px 24px', boxShadow: colors.shadow }}>
                <h3 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 600, color: colors.slate900, fontFamily: font.sans }}>Safety Incidents (Last 30 Days)</h3>
                {[
                  { ref: 'INC-042', type: 'Near Miss',        severity: 'LOW',    zone: 'Zone B',   date: 'Apr 9', status: 'CLOSED' },
                  { ref: 'INC-041', type: 'Minor Injury',     severity: 'MEDIUM', zone: 'Zone A',   date: 'Apr 7', status: 'REVIEWING' },
                  { ref: 'INC-040', type: 'Equipment Damage', severity: 'MEDIUM', zone: 'Workshop', date: 'Apr 3', status: 'CLOSED' },
                  { ref: 'INC-039', type: 'Near Miss',        severity: 'LOW',    zone: 'Zone C',   date: 'Mar 28', status: 'CLOSED' },
                ].map((inc, i, arr) => (
                  <div key={inc.ref} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '9px 0', borderBottom: i < arr.length - 1 ? `1px solid ${colors.border}` : 'none' }}>
                    <Badge variant={inc.severity === 'LOW' ? 'success' : inc.severity === 'MEDIUM' ? 'warning' : 'danger'}>{inc.severity}</Badge>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 13, color: colors.slate900, fontFamily: font.sans }}>{inc.ref} · {inc.type}</div>
                      <div style={{ fontSize: 12, color: colors.slate400, fontFamily: font.sans }}>{inc.zone} · {inc.date}</div>
                    </div>
                    <Badge variant={inc.status === 'CLOSED' ? 'neutral' : 'warning'}>{inc.status}</Badge>
                  </div>
                ))}
              </div>

              <div style={{ background: colors.white, border: `1px solid ${colors.border}`, borderRadius: radius.lg, padding: '20px 24px', boxShadow: colors.shadow }}>
                <h3 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 600, color: colors.slate900, fontFamily: font.sans }}>Safety KPIs</h3>
                {[
                  { label: 'LTIFR (12mo rolling)',   value: '0.42',  target: '< 0.50', ok: true },
                  { label: 'Days Without LTI',        value: '186',   target: '> 180',  ok: true },
                  { label: 'Near-Miss Reported',      value: '12',    target: '> 8/mo', ok: true },
                  { label: 'Safety Training Complete', value: '94%',  target: '> 90%',  ok: true },
                  { label: 'PPE Compliance Rate',     value: '98.2%', target: '100%',   ok: false },
                ].map((k) => (
                  <div key={k.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: `1px solid ${colors.border}` }}>
                    <div style={{ flex: 1, fontSize: 13, color: colors.slate700, fontFamily: font.sans }}>{k.label}</div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: k.ok ? colors.success : colors.warning, fontFamily: font.sans }}>{k.value}</div>
                    <div style={{ fontSize: 11, color: colors.slate400, fontFamily: font.sans }}>Target: {k.target}</div>
                  </div>
                ))}
              </div>
            </div>
          </PlanGate>
        )}

        {/* ESG tab */}
        {activeTab === 'esg' && (
          <PlanGate requiredPlan="MINING_ENTERPRISE">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
              {[
                { icon: '🌍', label: 'CO₂ Emissions', value: '1,842 tCO₂e', target: '< 2,000', trend: '↓ 4.2% vs last month', ok: true, color: colors.success },
                { icon: '💧', label: 'Water Usage',   value: '18,400 kL',   target: '< 20,000', trend: '↓ 6.1% vs last month', ok: true, color: colors.info },
                { icon: '⚡', label: 'Energy Use',    value: '94 GWh',      target: '< 100 GWh', trend: '↑ 1.8% vs last month', ok: false, color: colors.warning },
                { icon: '♻️', label: 'Waste Diverted', value: '81%',        target: '> 80%',    trend: '↑ 3% vs last month',  ok: true,  color: colors.success },
              ].map((e) => (
                <div key={e.label} style={{ background: colors.white, border: `1px solid ${colors.border}`, borderRadius: radius.lg, padding: '24px', boxShadow: colors.shadow }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <div style={{ fontSize: 28 }}>{e.icon}</div>
                    <div>
                      <div style={{ fontSize: 13, color: colors.slate500, fontFamily: font.sans }}>{e.label}</div>
                      <div style={{ fontSize: 26, fontWeight: 700, color: colors.slate900, fontFamily: font.sans }}>{e.value}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: colors.slate400, fontFamily: font.sans, marginBottom: 6 }}>Target: {e.target}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: e.ok ? colors.success : colors.warning, fontFamily: font.sans }}>{e.trend}</div>
                </div>
              ))}
            </div>
          </PlanGate>
        )}
      </ModuleGuard>
    </PageLayout>
  );
}
