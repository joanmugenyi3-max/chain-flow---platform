import React from 'react';
import { colors, radius, font } from '../../lib/styles';

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  accent?: string;
  icon?: string;
}

export default function StatCard({ label, value, sub, trend, trendValue, accent = colors.primary, icon }: StatCardProps) {
  const trendColor = trend === 'up' ? colors.success : trend === 'down' ? colors.danger : colors.slate500;
  const trendIcon = trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→';

  return (
    <div style={{
      background: colors.white,
      borderRadius: radius.lg,
      padding: '20px 24px',
      boxShadow: colors.shadow,
      border: `1px solid ${colors.border}`,
      flex: 1,
      minWidth: 0,
      fontFamily: font.sans,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: 13, color: colors.slate500, fontWeight: 500 }}>{label}</span>
        {icon && (
          <span style={{
            fontSize: 18,
            background: accent + '18',
            padding: '6px 8px',
            borderRadius: radius.md,
            lineHeight: 1,
          }}>
            {icon}
          </span>
        )}
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, color: colors.slate900, letterSpacing: '-0.5px', lineHeight: 1, marginBottom: 8 }}>
        {value}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {trendValue && (
          <span style={{ fontSize: 12, color: trendColor, fontWeight: 600 }}>
            {trendIcon} {trendValue}
          </span>
        )}
        {sub && (
          <span style={{ fontSize: 12, color: colors.slate400 }}>{sub}</span>
        )}
      </div>
    </div>
  );
}
