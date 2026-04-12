import React from 'react';
import Link from 'next/link';
import { useTenant } from '@/core/tenant/useTenant';
import { colors, radius, font } from '@/lib/styles';

interface ModuleGuardProps {
  moduleId: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function ModuleGuard({ moduleId, children, fallback }: ModuleGuardProps) {
  const { canAccessModule, isLoading } = useTenant();

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 320, color: colors.slate400, fontFamily: font.sans, fontSize: 14 }}>
        Loading module…
      </div>
    );
  }

  if (!canAccessModule(moduleId)) {
    if (fallback) return <>{fallback}</>;
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        height: 320, gap: 12,
      }}>
        <div style={{ fontSize: 40 }}>🔒</div>
        <div style={{ fontWeight: 700, fontSize: 18, color: colors.slate900, fontFamily: font.sans }}>
          Module Not Enabled
        </div>
        <div style={{ fontSize: 14, color: colors.slate500, fontFamily: font.sans, textAlign: 'center', maxWidth: 340 }}>
          The <strong>{moduleId}</strong> module is not enabled for your tenant.
          Enable it from the Marketplace or contact your administrator.
        </div>
        <Link href="/marketplace" style={{ textDecoration: 'none' }}>
          <div style={{
            background: colors.primary, color: colors.white, borderRadius: radius.md,
            padding: '10px 24px', fontWeight: 600, fontSize: 14, fontFamily: font.sans, cursor: 'pointer',
          }}>
            Go to Marketplace
          </div>
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
