import React from 'react';
import { colors, radius, font } from '../../lib/styles';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'primary' | 'neutral' | 'mining';

const VARIANT_STYLES: Record<BadgeVariant, { bg: string; color: string; border: string }> = {
  success: { bg: colors.successLight,  color: colors.success,  border: colors.successBorder },
  warning: { bg: colors.warningLight,  color: '#b45309',       border: colors.warningBorder },
  danger:  { bg: colors.dangerLight,   color: colors.danger,   border: colors.dangerBorder },
  info:    { bg: colors.infoLight,     color: colors.info,     border: colors.infoBorder },
  primary: { bg: colors.primaryLight,  color: colors.primary,  border: colors.primaryBorder },
  neutral: { bg: colors.slate100,      color: colors.slate600, border: colors.slate200 },
  mining:  { bg: colors.miningLight,   color: colors.mining,   border: colors.miningBorder },
};

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  dot?: boolean;
}

export default function Badge({ label, variant = 'neutral', dot = true }: BadgeProps) {
  const s = VARIANT_STYLES[variant];
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      padding: '3px 10px',
      borderRadius: radius.full,
      background: s.bg,
      color: s.color,
      border: `1px solid ${s.border}`,
      fontSize: 12,
      fontWeight: 600,
      fontFamily: font.sans,
      whiteSpace: 'nowrap',
    }}>
      {dot && (
        <span style={{
          width: 6, height: 6,
          borderRadius: '50%',
          background: s.color,
          flexShrink: 0,
        }} />
      )}
      {label}
    </span>
  );
}
