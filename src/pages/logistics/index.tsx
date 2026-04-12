import React, { useState } from 'react';
import PageLayout from '@/components/layout/PageLayout';
import ModuleGuard from '@/components/layout/ModuleGuard';
import PageHeader from '@/components/ui/PageHeader';
import StatCard from '@/components/ui/StatCard';
import Badge from '@/components/ui/Badge';
import DataTable, { Column } from '@/components/ui/DataTable';
import { useShipments } from '@/modules/logistics/hooks/useShipments';
import type { Shipment, ShipmentStatus } from '@/modules/logistics/types';
import { colors, radius, font } from '@/lib/styles';

const STATUS_VARIANT: Record<ShipmentStatus, 'success' | 'warning' | 'danger' | 'info' | 'neutral'> = {
  PENDING:    'neutral',
  IN_TRANSIT: 'info',
  DELIVERED:  'success',
  DELAYED:    'danger',
  CANCELLED:  'neutral',
};

const FILTERS = [
  { label: 'All',        value: 'ALL' },
  { label: 'In Transit', value: 'IN_TRANSIT' },
  { label: 'Delayed',    value: 'DELAYED' },
  { label: 'Delivered',  value: 'DELIVERED' },
  { label: 'Pending',    value: 'PENDING' },
];

export default function LogisticsPage() {
  const [activeFilter, setActiveFilter] = useState('ALL');
  const { shipments, loading } = useShipments(activeFilter);

  const inTransit = shipments.filter(s => s.status === 'IN_TRANSIT').length;
  const delayed   = shipments.filter(s => s.status === 'DELAYED').length;
  const delivered = shipments.filter(s => s.status === 'DELIVERED').length;

  const cols: Column<Shipment>[] = [
    {
      key: 'trackingNumber', label: 'Tracking #', width: 150,
      render: (v) => <span style={{ fontFamily: font.sans, fontWeight: 700, fontSize: 13, color: colors.primary }}>{String(v)}</span>,
    },
    { key: 'carrier', label: 'Carrier' },
    { key: 'type',   label: 'Type', render: (v) => <Badge variant="neutral">{String(v)}</Badge> },
    {
      key: 'status', label: 'Status',
      render: (v) => <Badge variant={STATUS_VARIANT[v as ShipmentStatus]}>{String(v).replace('_', ' ')}</Badge>,
    },
    {
      key: 'origin', label: 'Route',
      render: (v, row) => (
        <span style={{ fontSize: 13, color: colors.slate700, fontFamily: font.sans }}>
          {String(v)} <span style={{ color: colors.slate400 }}>→</span> {row.destination}
        </span>
      ),
    },
    { key: 'items',  label: 'Items', align: 'right', render: (v) => <span style={{ fontWeight: 700, color: colors.slate900 }}>{String(v)}</span> },
    { key: 'weight', label: 'Weight', align: 'right', render: (v) => <span style={{ fontSize: 13, color: colors.slate500 }}>{String(v)}</span> },
    {
      key: 'estimatedArrival', label: 'ETA',
      render: (v, row) => (
        <div>
          <div style={{ fontSize: 13, color: row.status === 'DELAYED' ? colors.danger : colors.slate700, fontWeight: row.status === 'DELAYED' ? 600 : 400, fontFamily: font.sans }}>
            {String(v).slice(0, 10)}
          </div>
          {row.status === 'DELAYED' && <div style={{ fontSize: 11, color: colors.danger, fontFamily: font.sans }}>Delayed</div>}
        </div>
      ),
    },
    {
      key: 'driverName', label: 'Driver',
      render: (v) => v ? <span style={{ fontSize: 13, color: colors.slate600, fontFamily: font.sans }}>{String(v)}</span> : <span style={{ color: colors.slate300 }}>—</span>,
    },
  ];

  return (
    <PageLayout>
      <ModuleGuard moduleId="logistics">
        <PageHeader
          title="Logistics"
          description="Shipment tracking, fleet management and route optimization."
          icon="🚛"
          accentColor={colors.info}
          action={{ label: '+ New Shipment' }}
        />

        <div style={{ display: 'flex', gap: 16, marginBottom: 28, flexWrap: 'wrap' }}>
          <StatCard label="Active Shipments"  value={String(inTransit)} sub="in transit"                              icon="🚛" accent={colors.info} />
          <StatCard label="Delayed"           value={String(delayed)}   trendValue="2" trend="down" sub="vs last week" icon="⏰" accent={colors.danger} />
          <StatCard label="Delivered"         value={String(delivered)} sub="this month"                               icon="✅" accent={colors.success} />
          <StatCard label="OTD Rate"          value="87.3%"             trendValue="2.1%" trend="up" sub="on-time delivery" icon="📈" />
        </div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 16, flexWrap: 'wrap' }}>
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setActiveFilter(f.value)}
              style={{
                padding: '6px 16px', borderRadius: radius.full, border: 'none',
                background: activeFilter === f.value ? colors.info : colors.slate100,
                color: activeFilter === f.value ? colors.white : colors.slate600,
                fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: font.sans,
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        <DataTable<Shipment>
          title="Shipments"
          columns={cols}
          rows={shipments}
          loading={loading}
          emptyMessage="No shipments found."
        />

        {/* Fleet overview */}
        <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* Fleet status */}
          <div style={{ background: colors.white, border: `1px solid ${colors.border}`, borderRadius: radius.lg, padding: '20px 24px', boxShadow: colors.shadow }}>
            <h3 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 600, color: colors.slate900, fontFamily: font.sans }}>Fleet Status</h3>
            {[
              { id: 'TRK-001', type: '🚛 Truck',    plate: 'GP 12-34', status: 'ON_ROUTE',    driver: 'Themba M.',   loc: 'N1 Highway' },
              { id: 'TRK-002', type: '🚛 Truck',    plate: 'LP 56-78', status: 'AVAILABLE',   driver: 'Rudi B.',     loc: 'WH-Central' },
              { id: 'VAN-001', type: '🚐 Van',      plate: 'GP 90-12', status: 'ON_ROUTE',    driver: 'Faith N.',    loc: 'Durban Port' },
              { id: 'TRK-003', type: '🚛 Truck',    plate: 'KZN 34-56', status: 'MAINTENANCE', driver: '—',           loc: 'Service Bay' },
            ].map((v, i, arr) => {
              const sc = v.status === 'AVAILABLE' ? colors.success : v.status === 'ON_ROUTE' ? colors.info : colors.warning;
              return (
                <div key={v.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '9px 0', borderBottom: i < arr.length - 1 ? `1px solid ${colors.border}` : 'none' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: sc, marginTop: 5, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: colors.slate900, fontFamily: font.sans }}>{v.type} · {v.plate}</div>
                    <div style={{ fontSize: 12, color: colors.slate400, fontFamily: font.sans }}>{v.driver} · {v.loc}</div>
                  </div>
                  <Badge variant={v.status === 'AVAILABLE' ? 'success' : v.status === 'ON_ROUTE' ? 'info' : 'warning'}>
                    {v.status.replace('_', ' ')}
                  </Badge>
                </div>
              );
            })}
          </div>

          {/* Route performance */}
          <div style={{ background: colors.white, border: `1px solid ${colors.border}`, borderRadius: radius.lg, padding: '20px 24px', boxShadow: colors.shadow }}>
            <h3 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 600, color: colors.slate900, fontFamily: font.sans }}>Top Routes</h3>
            {[
              { route: 'JHB → Limpopo',   avgDays: 1.2, otd: 94, shipments: 28 },
              { route: 'JHB → Durban',    avgDays: 2.1, otd: 91, shipments: 19 },
              { route: 'Limpopo → WH-N',  avgDays: 0.8, otd: 97, shipments: 14 },
              { route: 'JHB → Cape Town', avgDays: 4.3, otd: 78, shipments: 9  },
            ].map((r, i, arr) => (
              <div key={r.route} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 0', borderBottom: i < arr.length - 1 ? `1px solid ${colors.border}` : 'none' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: colors.slate900, fontFamily: font.sans }}>{r.route}</div>
                  <div style={{ fontSize: 12, color: colors.slate400, fontFamily: font.sans }}>Avg {r.avgDays}d · {r.shipments} shipments</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: r.otd >= 90 ? colors.success : r.otd >= 80 ? colors.warning : colors.danger, fontFamily: font.sans }}>{r.otd}%</div>
                  <div style={{ fontSize: 11, color: colors.slate400, fontFamily: font.sans }}>OTD</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </ModuleGuard>
    </PageLayout>
  );
}
