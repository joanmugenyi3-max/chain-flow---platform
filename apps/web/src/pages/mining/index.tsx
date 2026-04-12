import React, { useMemo } from 'react';
import PageLayout from '../../components/layout/PageLayout';
import PageHeader from '../../components/ui/PageHeader';
import StatCard from '../../components/ui/StatCard';
import Badge from '../../components/ui/Badge';
import DataTable, { Column } from '../../components/ui/DataTable';
import { useTranslation } from '@/i18n/useTranslation';
import { colors, radius, font } from '../../lib/styles';

// ── Mock data ────────────────────────────────────────────────────────────────
interface Equipment {
  id: string; name: string; type: string; site: string;
  status: string; availability: number; lastReading: string; alert: string | null;
}
interface Extraction {
  date: string; site: string; shift: string;
  tonnage: number; grade: number; recovery: number; operator: string;
}
interface SafetyIncident {
  id: string; date: string; site: string; type: string; severity: string; status: string;
}

const EQUIPMENT: Equipment[] = [
  { id: 'EQ-001', name: 'Excavator Alpha-7', type: 'Excavator',  site: 'Site Nord', status: 'operational', availability: 94, lastReading: '2 min ago',  alert: null },
  { id: 'EQ-002', name: 'Drill Rig DR-12',   type: 'Drill',      site: 'Site Nord', status: 'operational', availability: 88, lastReading: '1 min ago',  alert: null },
  { id: 'EQ-003', name: 'Crusher CR-04',     type: 'Crusher',    site: 'Site Sud',  status: 'maintenance', availability: 0,  lastReading: '45 min ago', alert: 'Scheduled maintenance' },
  { id: 'EQ-004', name: 'Haul Truck HT-09',  type: 'Haul Truck', site: 'Site Nord', status: 'operational', availability: 91, lastReading: '3 min ago',  alert: null },
  { id: 'EQ-005', name: 'Conveyor CV-02',    type: 'Conveyor',   site: 'Site Sud',  status: 'alert',       availability: 72, lastReading: '8 min ago',  alert: 'High vibration detected' },
  { id: 'EQ-006', name: 'Water Pump WP-03',  type: 'Pump',       site: 'Site Est',  status: 'operational', availability: 99, lastReading: '1 min ago',  alert: null },
];

const EXTRACTIONS: Extraction[] = [
  { date: '2026-04-10', site: 'Site Nord', shift: 'Day',   tonnage: 3840, grade: 1.8, recovery: 92.3, operator: 'Team A' },
  { date: '2026-04-10', site: 'Site Nord', shift: 'Night', tonnage: 3620, grade: 1.7, recovery: 91.1, operator: 'Team B' },
  { date: '2026-04-10', site: 'Site Sud',  shift: 'Day',   tonnage: 2910, grade: 2.1, recovery: 93.7, operator: 'Team C' },
  { date: '2026-04-09', site: 'Site Nord', shift: 'Day',   tonnage: 3750, grade: 1.9, recovery: 92.8, operator: 'Team A' },
  { date: '2026-04-09', site: 'Site Est',  shift: 'Day',   tonnage: 1820, grade: 1.5, recovery: 89.4, operator: 'Team D' },
];

const INCIDENTS: SafetyIncident[] = [
  { id: 'INC-031', date: '2026-04-08', site: 'Site Nord', type: 'Near Miss',       severity: 'Low',    status: 'Closed' },
  { id: 'INC-030', date: '2026-04-05', site: 'Site Sud',  type: 'Property Damage', severity: 'Medium', status: 'Under Review' },
  { id: 'INC-029', date: '2026-04-01', site: 'Site Nord', type: 'Near Miss',       severity: 'Low',    status: 'Closed' },
];

const statusVariant = (s: string) => ({
  operational: 'success', maintenance: 'warning', alert: 'danger'
} as Record<string, 'success' | 'warning' | 'danger'>)[s] ?? 'neutral';

const severityVariant = (s: string) => ({
  Low: 'info', Medium: 'warning', High: 'danger', Critical: 'danger'
} as Record<string, 'info' | 'warning' | 'danger'>)[s] ?? 'neutral';

// ── ESG panel ─────────────────────────────────────────────────────────────────
function EsgPanel({ title, metrics }: {
  title: string;
  metrics: { label: string; value: string; vs: string; trend: string }[];
}) {
  return (
    <div style={{
      background: colors.white, border: `1px solid ${colors.border}`,
      borderRadius: radius.lg, padding: '20px 24px', boxShadow: colors.shadow,
    }}>
      <div style={{ fontWeight: 600, fontSize: 15, color: colors.slate900, marginBottom: 16, fontFamily: font.sans }}>
        {title}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {metrics.map((m) => (
          <div key={m.label} style={{
            padding: '12px 14px', borderRadius: radius.md,
            background: colors.slate50, border: `1px solid ${colors.border}`,
          }}>
            <div style={{ fontSize: 12, color: colors.slate500, marginBottom: 4, fontFamily: font.sans }}>{m.label}</div>
            <div style={{ fontSize: 17, fontWeight: 700, color: colors.slate900, fontFamily: font.sans }}>{m.value}</div>
            <div style={{ fontSize: 11, color: m.trend === 'success' ? colors.success : colors.warning, marginTop: 2, fontFamily: font.sans }}>{m.vs}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function MiningPage() {
  const { t } = useTranslation();

  const esgMetrics = useMemo(() => [
    { label: t('miningPage.esg1Label'), value: '1,240 t CO₂', vs: t('miningPage.esg1Vs'), trend: 'success' },
    { label: t('miningPage.esg2Label'), value: '18,400 m³',   vs: t('miningPage.esg2Vs'), trend: 'warning' },
    { label: t('miningPage.esg3Label'), value: '73%',          vs: t('miningPage.esg3Vs'), trend: 'success' },
    { label: t('miningPage.esg4Label'), value: '94 / 100',     vs: t('miningPage.esg4Vs'), trend: 'success' },
  ], [t]);

  const eqCols = useMemo<Column<Equipment>[]>(() => [
    { key: 'id',           label: t('miningPage.colId'),           width: 90 },
    { key: 'name',         label: t('miningPage.colEquipment'),    render: (v, r) => (
      <div>
        <div style={{ fontWeight: 600, color: colors.slate900, fontSize: 14 }}>{String(v)}</div>
        <div style={{ fontSize: 12, color: colors.slate400 }}>{r.type} · {r.site}</div>
      </div>
    )},
    { key: 'status',       label: t('miningPage.colStatus'),       render: (v) => <Badge label={String(v).charAt(0).toUpperCase() + String(v).slice(1)} variant={statusVariant(String(v))} /> },
    { key: 'availability', label: t('miningPage.colAvailability'), align: 'right', render: (v) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
        <div style={{ width: 60, height: 6, background: colors.slate200, borderRadius: radius.full, overflow: 'hidden' }}>
          <div style={{ width: `${v}%`, height: '100%', background: Number(v) > 80 ? colors.success : Number(v) > 50 ? colors.warning : colors.danger }} />
        </div>
        <span style={{ fontSize: 13, fontWeight: 600, color: colors.slate700, minWidth: 32, textAlign: 'right' }}>{String(v)}%</span>
      </div>
    )},
    { key: 'lastReading',  label: t('miningPage.colLastIotReading') },
    { key: 'alert',        label: t('miningPage.colAlert'),        render: (v) => v ? <Badge label={String(v)} variant="warning" /> : <span style={{ color: colors.slate300, fontSize: 13 }}>—</span> },
  ], [t]);

  const exCols = useMemo<Column<Extraction>[]>(() => [
    { key: 'date',     label: t('miningPage.colDate') },
    { key: 'site',     label: t('miningPage.colSite') },
    { key: 'shift',    label: t('miningPage.colShift'),    render: (v) => <Badge label={String(v)} variant="neutral" dot={false} /> },
    { key: 'tonnage',  label: t('miningPage.colTonnage'),  align: 'right', render: (v) => <span style={{ fontWeight: 600 }}>{Number(v).toLocaleString()} t</span> },
    { key: 'grade',    label: t('miningPage.colOreGrade'), align: 'right', render: (v) => `${v} g/t` },
    { key: 'recovery', label: t('miningPage.colRecovery'), align: 'right', render: (v) => `${v}%` },
    { key: 'operator', label: t('miningPage.colTeam') },
  ], [t]);

  const incCols = useMemo<Column<SafetyIncident>[]>(() => [
    { key: 'id',       label: t('miningPage.colId'),       width: 90 },
    { key: 'date',     label: t('miningPage.colDate') },
    { key: 'site',     label: t('miningPage.colSite') },
    { key: 'type',     label: t('miningPage.colType') },
    { key: 'severity', label: t('miningPage.colSeverity'), render: (v) => <Badge label={String(v)} variant={severityVariant(String(v))} /> },
    { key: 'status',   label: t('miningPage.colStatus'),   render: (v) => <Badge label={String(v)} variant={String(v) === 'Closed' ? 'success' : 'warning'} /> },
  ], [t]);

  return (
    <PageLayout>
      <PageHeader
        title={t('miningPage.title')}
        description={t('miningPage.description')}
        icon="⛏️"
        action={{ label: t('miningPage.recordExtraction') }}
        accentColor={colors.mining}
      />

      {/* KPI Row */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 28, flexWrap: 'wrap' }}>
        <StatCard label={t('miningPage.kpi1Label')} value="14,190 t" trendValue="3.2%" trend="up"      sub={t('miningPage.kpi1Sub')} icon="⛏️" accent={colors.mining} />
        <StatCard label={t('miningPage.kpi2Label')} value="88.2%"    trendValue="1.1%" trend="up"      sub={t('miningPage.kpi2Sub')} icon="⚙️" accent={colors.primary} />
        <StatCard label={t('miningPage.kpi3Label')} value="3"        sub={t('miningPage.kpi3Sub')}                                   icon="📍" accent={colors.info} />
        <StatCard label={t('miningPage.kpi4Label')} value="94 / 100" trendValue="0.42 LTIFR" trend="up" sub={t('miningPage.kpi4Sub')} icon="🛡️" accent={colors.success} />
      </div>

      {/* Equipment + ESG */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 20, marginBottom: 28, alignItems: 'start' }}>
        <DataTable<Equipment>
          title={t('miningPage.eqTableTitle')}
          columns={eqCols}
          rows={EQUIPMENT}
        />
        <EsgPanel title={t('miningPage.esgTitle')} metrics={esgMetrics} />
      </div>

      {/* Extraction log */}
      <div style={{ marginBottom: 28 }}>
        <DataTable<Extraction>
          title={t('miningPage.exTableTitle')}
          columns={exCols}
          rows={EXTRACTIONS}
        />
      </div>

      {/* Safety incidents */}
      <DataTable<SafetyIncident>
        title={t('miningPage.incTableTitle')}
        columns={incCols}
        rows={INCIDENTS}
      />
    </PageLayout>
  );
}
