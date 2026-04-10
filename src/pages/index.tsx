import React from 'react';
import Link from 'next/link';
import PageLayout from '@/components/layout/PageLayout';
import { colors, radius, font } from '@/lib/styles';

const MODULES = [
  { href: '/analytics',   icon: '📊', title: 'Analytics',   color: colors.primary, description: 'Real-time KPIs, performance charts and AI-powered insights.', stats: '12 active reports' },
  { href: '/procurement', icon: '🛒', title: 'Procurement', color: '#7c3aed',      description: 'Purchase orders, approved suppliers and contracts.', stats: '1 pending approval' },
  { href: '/inventory',   icon: '📦', title: 'Inventory',   color: colors.success, description: 'Stock levels, warehouse utilization and movements.', stats: '3 low-stock alerts' },
  { href: '/logistics',   icon: '🚛', title: 'Logistics',   color: colors.info,    description: 'Shipment tracking, fleet management and route optimization.', stats: '14 active shipments' },
  { href: '/mining',      icon: '⛏️',  title: 'Mining',     color: colors.mining,  description: 'IoT telemetry, extraction logs, safety and ESG reporting.', stats: '6 equipment online' },
];

const RECENT_ACTIVITY = [
  { time: '08:14', text: '24× Drill Bit 12" received — WH-Nord', type: 'success' },
  { time: '07:50', text: 'PO-2026-0040 submitted for approval', type: 'warning' },
  { time: '07:22', text: 'SHP-1039 marked as delayed — new ETA Apr 12', type: 'danger' },
  { time: '06:55', text: 'AI Insight: Reorder LUB-ENG-20L (critical level)', type: 'info' },
  { time: 'Yesterday', text: 'Contract CTR-016 expiring in 81 days', type: 'warning' },
];

const actColor: Record<string, string> = {
  success: colors.success, warning: colors.warning,
  danger: colors.danger, info: colors.info,
};

export default function HomePage() {
  return (
    <PageLayout>
      {/* Welcome banner */}
      <div style={{
        background: `linear-gradient(135deg, ${colors.slate900} 0%, #1e3a5f 100%)`,
        borderRadius: radius.xl, padding: '28px 32px', marginBottom: 32,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 16,
      }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, color: colors.white, fontFamily: font.sans, letterSpacing: '-0.4px' }}>
            Good morning, JoeObscura 👋
          </div>
          <div style={{ fontSize: 14, color: '#94a3b8', marginTop: 4, fontFamily: font.sans }}>
            minechain-ai · AI-powered Supply Chain · April 10, 2026
          </div>
        </div>
        <div style={{ display: 'flex', gap: 28 }}>
          {[{ label: 'Open POs', value: '7' }, { label: 'Active Shipments', value: '14' }, { label: 'Alerts', value: '3' }].map((s) => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 26, fontWeight: 700, color: colors.white, fontFamily: font.sans }}>{s.value}</div>
              <div style={{ fontSize: 12, color: '#94a3b8', fontFamily: font.sans }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Modules grid */}
      <h2 style={{ fontSize: 15, fontWeight: 600, color: colors.slate700, margin: '0 0 14px', fontFamily: font.sans }}>Modules</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: 14, marginBottom: 32 }}>
        {MODULES.map((m) => (
          <Link key={m.href} href={m.href} style={{ textDecoration: 'none' }}>
            <div
              style={{ background: colors.white, border: `1px solid ${colors.border}`, borderRadius: radius.lg, padding: '18px 20px', cursor: 'pointer', boxShadow: colors.shadow, transition: 'box-shadow 0.15s, transform 0.15s' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = colors.shadowMd; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = colors.shadow; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div style={{ width: 36, height: 36, borderRadius: radius.md, background: m.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{m.icon}</div>
                <span style={{ fontWeight: 700, fontSize: 15, color: colors.slate900, fontFamily: font.sans }}>{m.title}</span>
              </div>
              <p style={{ margin: '0 0 10px', fontSize: 13, color: colors.slate500, lineHeight: 1.5, fontFamily: font.sans }}>{m.description}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: m.color, fontWeight: 600, fontFamily: font.sans }}>{m.stats}</span>
                <span style={{ color: colors.slate300, fontSize: 14 }}>→</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent activity */}
      <div style={{ background: colors.white, border: `1px solid ${colors.border}`, borderRadius: radius.lg, padding: '20px 24px', boxShadow: colors.shadow }}>
        <h3 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 600, color: colors.slate900, fontFamily: font.sans }}>Recent Activity</h3>
        {RECENT_ACTIVITY.map((a, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '9px 0', borderBottom: i < RECENT_ACTIVITY.length - 1 ? `1px solid ${colors.border}` : 'none' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: actColor[a.type] ?? colors.slate400, marginTop: 5, flexShrink: 0 }} />
            <span style={{ flex: 1, fontSize: 13, color: colors.slate700, fontFamily: font.sans }}>{a.text}</span>
            <span style={{ fontSize: 11, color: colors.slate400, fontFamily: font.sans, flexShrink: 0 }}>{a.time}</span>
          </div>
        ))}
      </div>
    </PageLayout>
  );
}
