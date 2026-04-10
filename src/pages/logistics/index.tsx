import React from 'react';
import PageLayout from '@/components/layout/PageLayout';
import PageHeader from '@/components/ui/PageHeader';
import StatCard from '@/components/ui/StatCard';
import Badge from '@/components/ui/Badge';
import DataTable, { Column } from '@/components/ui/DataTable';
import { colors, radius, font } from '@/lib/styles';

// ── Mock data ────────────────────────────────────────────────────────────────
interface Shipment {
  id: string; origin: string; destination: string; carrier: string;
  status: string; eta: string; items: number; weight: string;
}
interface Vehicle {
  id: string; plate: string; type: string; driver: string;
  status: string; location: string; nextMaintenance: string;
}
interface Route {
  id: string; name: string; stops: number; distanceKm: number;
  vehicle: string; estimatedMin: number; status: string;
}

const SHIPMENTS: Shipment[] = [
  { id: 'SHP-1041', origin: 'Warehouse A — Kinshasa', destination: 'Site Nord — Kolwezi', carrier: 'TransAfrique',  status: 'in_transit',  eta: '2026-04-11', items: 24, weight: '3.2 t' },
  { id: 'SHP-1040', origin: 'Supplier CMCK',          destination: 'Warehouse B — Lubumbashi', carrier: 'FastCargo',  status: 'delivered',   eta: '2026-04-09', items: 8,  weight: '0.9 t' },
  { id: 'SHP-1039', origin: 'Warehouse A — Kinshasa', destination: 'Site Sud — Likasi',   carrier: 'TransAfrique',  status: 'delayed',     eta: '2026-04-12', items: 15, weight: '2.1 t' },
  { id: 'SHP-1038', origin: 'Supplier KAMOTO',        destination: 'Site Nord — Kolwezi', carrier: 'MineLog DRC',   status: 'in_transit',  eta: '2026-04-10', items: 6,  weight: '18.5 t' },
  { id: 'SHP-1037', origin: 'Warehouse C — Likasi',   destination: 'Port — Dar es Salaam',carrier: 'OceanLink',    status: 'pending',     eta: '2026-04-15', items: 42, weight: '12.0 t' },
  { id: 'SHP-1036', origin: 'Site Est',               destination: 'Warehouse A — Kinshasa', carrier: 'FastCargo', status: 'delivered',   eta: '2026-04-07', items: 3,  weight: '0.4 t' },
];

const VEHICLES: Vehicle[] = [
  { id: 'VH-01', plate: 'KIN-4821-A', type: 'Heavy Truck', driver: 'Jean Mukeba',    status: 'on_route',    location: 'N1 Highway, km 340', nextMaintenance: '2026-05-01' },
  { id: 'VH-02', plate: 'LUB-3310-B', type: 'Van',        driver: 'Paul Ilunga',     status: 'available',   location: 'Lubumbashi Depot',   nextMaintenance: '2026-04-20' },
  { id: 'VH-03', plate: 'KOL-7712-C', type: 'Heavy Truck', driver: 'André Mwamba',  status: 'on_route',    location: 'RN39, km 88',        nextMaintenance: '2026-06-15' },
  { id: 'VH-04', plate: 'LUB-0094-D', type: 'Pickup',     driver: 'Unassigned',      status: 'maintenance', location: 'Workshop Lubumbashi', nextMaintenance: '2026-04-10' },
  { id: 'VH-05', plate: 'KIN-5503-E', type: 'Van',        driver: 'Christophe Ngoy', status: 'available',   location: 'Kinshasa Depot',     nextMaintenance: '2026-05-22' },
];

const ROUTES: Route[] = [
  { id: 'RT-11', name: 'Kinshasa → Kolwezi',      stops: 3, distanceKm: 1840, vehicle: 'KIN-4821-A', estimatedMin: 1440, status: 'active' },
  { id: 'RT-12', name: 'Lubumbashi → Site Nord',  stops: 2, distanceKm: 320,  vehicle: 'LUB-3310-B', estimatedMin: 240,  status: 'planned' },
  { id: 'RT-13', name: 'Site Sud → Port Dar',     stops: 5, distanceKm: 2100, vehicle: 'KOL-7712-C', estimatedMin: 1680, status: 'active' },
  { id: 'RT-14', name: 'Likasi → Warehouse A',   stops: 1, distanceKm: 205,  vehicle: 'KIN-5503-E', estimatedMin: 180,  status: 'planned' },
];

const shipmentStatusVariant = (s: string) =>
  ({ in_transit: 'info', delivered: 'success', delayed: 'danger', pending: 'neutral' } as Record<string, 'info'|'success'|'danger'|'neutral'>)[s] ?? 'neutral';

const vehicleStatusVariant = (s: string) =>
  ({ on_route: 'info', available: 'success', maintenance: 'warning' } as Record<string, 'info'|'success'|'warning'>)[s] ?? 'neutral';

// ── Columns ──────────────────────────────────────────────────────────────────
const shipCols: Column<Shipment>[] = [
  { key: 'id',          label: 'Shipment ID', width: 100 },
  { key: 'origin',      label: 'From → To', render: (v, r) => (
    <div>
      <div style={{ fontWeight: 500, color: colors.slate900, fontSize: 14 }}>📍 {String(v)}</div>
      <div style={{ fontSize: 12, color: colors.slate400, marginTop: 2 }}>→ {r.destination}</div>
    </div>
  )},
  { key: 'carrier',     label: 'Carrier' },
  { key: 'status',      label: 'Status',  render: (v) => {
    const label = String(v).replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase());
    return <Badge label={label} variant={shipmentStatusVariant(String(v))} />;
  }},
  { key: 'eta',         label: 'ETA' },
  { key: 'items',       label: 'Items', align: 'right' },
  { key: 'weight',      label: 'Weight', align: 'right' },
];

const vehCols: Column<Vehicle>[] = [
  { key: 'plate',   label: 'Plate',  width: 120, render: (v) => <span style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: 13 }}>{String(v)}</span> },
  { key: 'type',    label: 'Type' },
  { key: 'driver',  label: 'Driver', render: (v, r) => (
    <div>
      <div style={{ fontWeight: 500, color: colors.slate800 }}>{String(v)}</div>
      <div style={{ fontSize: 11, color: colors.slate400 }}>{r.id}</div>
    </div>
  )},
  { key: 'status',  label: 'Status', render: (v) => {
    const label = String(v).replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase());
    return <Badge label={label} variant={vehicleStatusVariant(String(v))} />;
  }},
  { key: 'location', label: 'Current Location', render: (v) => <span style={{ fontSize: 13, color: colors.slate500 }}>{String(v)}</span> },
  { key: 'nextMaintenance', label: 'Next Maintenance', align: 'right' },
];

const routeCols: Column<Route>[] = [
  { key: 'id',           label: 'ID',       width: 80 },
  { key: 'name',         label: 'Route' },
  { key: 'stops',        label: 'Stops',    align: 'center' },
  { key: 'distanceKm',   label: 'Distance', align: 'right', render: (v) => `${Number(v).toLocaleString()} km` },
  { key: 'vehicle',      label: 'Vehicle',  render: (v) => <span style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 600 }}>{String(v)}</span> },
  { key: 'estimatedMin', label: 'Est. Duration', align: 'right', render: (v) => {
    const h = Math.floor(Number(v) / 60);
    const m = Number(v) % 60;
    return `${h}h ${m > 0 ? m + 'm' : ''}`;
  }},
  { key: 'status', label: 'Status', render: (v) => <Badge label={String(v).charAt(0).toUpperCase() + String(v).slice(1)} variant={String(v) === 'active' ? 'info' : 'neutral'} /> },
];

// ── Map placeholder ───────────────────────────────────────────────────────────
function MapPlaceholder() {
  const dots = [
    { label: 'Kinshasa', x: 18, y: 52 },
    { label: 'Lubumbashi', x: 62, y: 68 },
    { label: 'Kolwezi', x: 48, y: 61 },
    { label: 'Likasi', x: 60, y: 63 },
  ];
  return (
    <div style={{
      background: colors.white, border: `1px solid ${colors.border}`,
      borderRadius: radius.lg, padding: '20px 24px', boxShadow: colors.shadow,
    }}>
      <div style={{ fontWeight: 600, fontSize: 15, color: colors.slate900, marginBottom: 16, fontFamily: font.sans }}>
        Fleet Map — Live Positions
      </div>
      <div style={{
        position: 'relative', background: '#e8f4e8',
        borderRadius: radius.md, height: 180, overflow: 'hidden',
        border: `1px solid ${colors.border}`,
      }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.08, background: 'repeating-linear-gradient(0deg, #000 0, #000 1px, transparent 1px, transparent 40px), repeating-linear-gradient(90deg, #000 0, #000 1px, transparent 1px, transparent 40px)' }} />
        {dots.map((d) => (
          <div key={d.label} style={{ position: 'absolute', left: `${d.x}%`, top: `${d.y}%`, transform: 'translate(-50%,-50%)' }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: colors.primary, border: `2px solid white`, boxShadow: `0 0 0 3px ${colors.primary}40` }} />
            <div style={{ background: colors.slate900, color: 'white', fontSize: 10, padding: '1px 5px', borderRadius: 3, marginTop: 3, whiteSpace: 'nowrap', fontFamily: font.sans }}>{d.label}</div>
          </div>
        ))}
        <div style={{ position: 'absolute', bottom: 8, right: 8, fontSize: 10, color: colors.slate400, fontFamily: font.sans }}>DRC — Central Africa</div>
      </div>
      <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Badge label="2 On Route" variant="info" />
        <Badge label="2 Available" variant="success" />
        <Badge label="1 Maintenance" variant="warning" />
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function LogisticsPage() {
  return (
    <PageLayout>
      <PageHeader
        title="Logistics"
        description="Track shipments in real time, manage your fleet and optimize delivery routes."
        icon="🚛"
        action={{ label: 'New Shipment' }}
        accentColor={colors.primary}
      />

      {/* KPIs */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 28, flexWrap: 'wrap' }}>
        <StatCard label="Active Shipments"    value="14"       trendValue="3"     trend="up"   sub="vs last week"      icon="📦" />
        <StatCard label="On-Time Delivery"    value="87.3%"    trendValue="2.1%"  trend="up"   sub="last 30 days"      icon="✅" accent={colors.success} />
        <StatCard label="Delayed"             value="2"        trendValue="1"     trend="down" sub="SHP-1039 · SHP-1035" icon="⚠️" accent={colors.warning} />
        <StatCard label="Fleet Availability"  value="80%"      sub="4 of 5 vehicles"           icon="🚛" accent={colors.info} />
      </div>

      {/* Shipments + Map */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 20, marginBottom: 28, alignItems: 'start' }}>
        <DataTable<Shipment>
          title="Active Shipments"
          columns={shipCols}
          rows={SHIPMENTS}
        />
        <MapPlaceholder />
      </div>

      {/* Fleet */}
      <div style={{ marginBottom: 28 }}>
        <DataTable<Vehicle>
          title="Fleet Management"
          columns={vehCols}
          rows={VEHICLES}
        />
      </div>

      {/* Routes */}
      <DataTable<Route>
        title="Optimized Routes"
        columns={routeCols}
        rows={ROUTES}
      />
    </PageLayout>
  );
}
