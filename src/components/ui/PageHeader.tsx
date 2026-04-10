import React from 'react';
import { colors, font, radius } from '@/lib/styles';

interface PageHeaderProps {
  title: string;
  description: string;
  icon?: string;
  action?: { label: string; onClick?: () => void };
  accentColor?: string;
}

export default function PageHeader({ title, description, icon, action, accentColor = colors.primary }: PageHeaderProps) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 28,
      flexWrap: 'wrap',
      gap: 16,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {icon && (
          <div style={{
            width: 44, height: 44,
            borderRadius: radius.lg,
            background: accentColor + '18',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 22,
            flexShrink: 0,
          }}>
            {icon}
          </div>
        )}
        <div>
          <h1 style={{
            margin: 0,
            fontSize: 22,
            fontWeight: 700,
            color: colors.slate900,
            fontFamily: font.sans,
            letterSpacing: '-0.4px',
          }}>
            {title}
          </h1>
          <p style={{
            margin: '3px 0 0',
            fontSize: 14,
            color: colors.slate500,
            fontFamily: font.sans,
          }}>
            {description}
          </p>
        </div>
      </div>
      {action && (
        <button
          onClick={action.onClick}
          style={{
            background: accentColor,
            color: colors.white,
            border: 'none',
            borderRadius: radius.md,
            padding: '9px 18px',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: font.sans,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          + {action.label}
        </button>
      )}
    </div>
  );
}
