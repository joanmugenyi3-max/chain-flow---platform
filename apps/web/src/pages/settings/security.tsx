import React, { useState } from 'react';
import Link from 'next/link';
import PageLayout from '@/components/layout/PageLayout';
import PageHeader from '@/components/ui/PageHeader';
import Badge from '@/components/ui/Badge';
import { useTranslation } from '@/i18n/useTranslation';
import { colors, radius, font } from '@/lib/styles';

// ── Mock data ─────────────────────────────────────────────────────────────────

interface ApiKey {
  id: string;
  name: string;
  created: string;
  lastUsed: string;
  scope: string;
  prefix: string;
}

interface AuditEntry {
  id: string;
  action: string;
  user: string;
  timestamp: string;
  ip: string;
  result: 'success' | 'failed';
}

const API_KEYS: ApiKey[] = [
  { id: 'k1', name: 'Production API',    created: '2026-01-01', lastUsed: '2026-04-12', scope: 'read:all write:procurement', prefix: 'mc_live_4xRt…' },
  { id: 'k2', name: 'Analytics Webhook', created: '2026-02-14', lastUsed: '2026-04-11', scope: 'read:analytics',             prefix: 'mc_live_9kMn…' },
  { id: 'k3', name: 'Dev / Staging',     created: '2026-03-05', lastUsed: '2026-04-10', scope: 'read:all write:all',         prefix: 'mc_test_7pQz…' },
];

const AUDIT_LOG: AuditEntry[] = [
  { id: 'a1', action: 'User login',           user: 'p.kabangu@minechain.ai',  timestamp: '2026-04-12 08:02', ip: '41.243.12.88',   result: 'success' },
  { id: 'a2', action: 'Module enabled',        user: 'p.kabangu@minechain.ai',  timestamp: '2026-04-12 08:05', ip: '41.243.12.88',   result: 'success' },
  { id: 'a3', action: 'API key created',       user: 'm.nsenga@minechain.ai',   timestamp: '2026-04-11 14:30', ip: '197.155.4.201',  result: 'success' },
  { id: 'a4', action: 'User login failed',     user: 'unknown@external.com',    timestamp: '2026-04-11 03:12', ip: '185.220.101.5',  result: 'failed'  },
  { id: 'a5', action: 'Settings updated',      user: 'p.kabangu@minechain.ai',  timestamp: '2026-04-10 16:55', ip: '41.243.12.88',   result: 'success' },
  { id: 'a6', action: 'Member invited',        user: 'm.nsenga@minechain.ai',   timestamp: '2026-04-10 11:20', ip: '197.155.4.201',  result: 'success' },
];

// ── Section card ──────────────────────────────────────────────────────────────

function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      background: colors.white, border: `1px solid ${colors.border}`,
      borderRadius: radius.xl, boxShadow: colors.shadow,
      overflow: 'hidden', marginBottom: 24,
    }}>
      {children}
    </div>
  );
}

function SectionHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div style={{
      padding: '18px 24px', borderBottom: `1px solid ${colors.border}`,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: colors.slate900, fontFamily: font.sans }}>
        {title}
      </h3>
      {action}
    </div>
  );
}

// ── Toggle switch ─────────────────────────────────────────────────────────────

function Toggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      style={{
        width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
        background: enabled ? colors.success : colors.slate200,
        position: 'relative', transition: 'background 0.2s', flexShrink: 0,
        padding: 0,
      }}
    >
      <div style={{
        position: 'absolute', top: 2, left: enabled ? 22 : 2,
        width: 20, height: 20, borderRadius: '50%',
        background: colors.white, boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        transition: 'left 0.2s',
      }} />
    </button>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function SecurityPage() {
  const { t } = useTranslation();
  const [mfaEnabled, setMfaEnabled]       = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState('60');

  const NAV_ITEMS = [
    { label: t('settingsPage.navGeneral'),      icon: '⚙️',  href: '/settings' },
    { label: t('settingsPage.navSubscription'), icon: '💳',  href: '/settings/subscription' },
    { label: t('settingsPage.navModules'),      icon: '📦',  href: '/settings/modules' },
    { label: t('settingsPage.navTeam'),         icon: '👥',  href: '/settings/team' },
    { label: t('settingsPage.navSecurity'),     icon: '🔒',  href: '/settings/security' },
  ];

  const thStyle: React.CSSProperties = {
    padding: '10px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700,
    color: colors.slate500, textTransform: 'uppercase', letterSpacing: '0.6px',
    background: colors.slate50, borderBottom: `1px solid ${colors.border}`,
    fontFamily: font.sans,
  };

  return (
    <PageLayout>
      <PageHeader
        title={t('securityPage.title')}
        description={t('securityPage.description')}
        icon="🔒"
      />

      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>

        {/* ── Sidebar nav ─────────────────────────────────────────────────── */}
        <nav style={{
          width: 200, flexShrink: 0, background: colors.white,
          border: `1px solid ${colors.border}`, borderRadius: radius.lg,
          boxShadow: colors.shadow, padding: '8px 0',
          position: 'sticky', top: 80,
        }}>
          {NAV_ITEMS.map((item) => {
            const isActive = item.href === '/settings/security';
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 16px', margin: '2px 8px', borderRadius: radius.md,
                  textDecoration: 'none', fontSize: 14,
                  fontWeight: isActive ? 600 : 500, fontFamily: font.sans,
                  color: isActive ? colors.white : colors.slate700,
                  background: isActive ? colors.primary : 'transparent',
                  transition: 'background 0.15s, color 0.15s',
                }}
              >
                <span style={{ fontSize: 15 }}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* ── Main content ─────────────────────────────────────────────────── */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* ── 1. Authentication ──────────────────────────────────────────── */}
          <SectionCard>
            <SectionHeader title={t('securityPage.sectionAuth')} />
            <div style={{ padding: '0 24px' }}>

              {/* 2FA */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '18px 0', borderBottom: `1px solid ${colors.border}`,
                flexWrap: 'wrap', gap: 12,
              }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: colors.slate800, fontFamily: font.sans, marginBottom: 2 }}>
                    {t('securityPage.mfaLabel')}
                  </div>
                  <div style={{ fontSize: 13, color: colors.slate500, fontFamily: font.sans }}>
                    {t('securityPage.mfaDesc')}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{
                    fontSize: 12, fontWeight: 700,
                    color: mfaEnabled ? colors.success : colors.slate400,
                    fontFamily: font.sans,
                  }}>
                    {mfaEnabled ? t('securityPage.mfaEnabled') : t('securityPage.mfaDisabled')}
                  </span>
                  <Toggle enabled={mfaEnabled} onToggle={() => setMfaEnabled(v => !v)} />
                </div>
              </div>

              {/* SSO */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '18px 0', borderBottom: `1px solid ${colors.border}`,
                flexWrap: 'wrap', gap: 12,
              }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: colors.slate800, fontFamily: font.sans, marginBottom: 2 }}>
                    {t('securityPage.ssoLabel')}
                  </div>
                  <div style={{ fontSize: 13, color: colors.slate500, fontFamily: font.sans }}>
                    {t('securityPage.ssoDesc')}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 12, color: colors.slate400, fontFamily: font.sans }}>
                    {t('securityPage.ssoNotConfigured')}
                  </span>
                  <button
                    onClick={() => {}}
                    style={{
                      padding: '6px 14px', borderRadius: radius.md, fontSize: 12, fontWeight: 600,
                      background: 'transparent', border: `1px solid ${colors.border}`,
                      color: colors.slate700, cursor: 'pointer', fontFamily: font.sans,
                    }}
                  >
                    {t('securityPage.configureBtn')}
                  </button>
                </div>
              </div>

              {/* Session timeout */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '18px 0', flexWrap: 'wrap', gap: 12,
              }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: colors.slate800, fontFamily: font.sans, marginBottom: 2 }}>
                    {t('securityPage.sessionLabel')}
                  </div>
                  <div style={{ fontSize: 13, color: colors.slate500, fontFamily: font.sans }}>
                    {t('securityPage.sessionDesc')}
                  </div>
                </div>
                <select
                  value={sessionTimeout}
                  onChange={(e) => setSessionTimeout(e.target.value)}
                  style={{
                    padding: '6px 12px', borderRadius: radius.md, border: `1px solid ${colors.border}`,
                    fontSize: 13, fontFamily: font.sans, color: colors.slate700,
                    background: colors.white, cursor: 'pointer',
                  }}
                >
                  <option value="30">{t('securityPage.session30')}</option>
                  <option value="60">{t('securityPage.session60')}</option>
                  <option value="240">{t('securityPage.session240')}</option>
                  <option value="480">{t('securityPage.session480')}</option>
                </select>
              </div>
            </div>
          </SectionCard>

          {/* ── 2. API Keys ────────────────────────────────────────────────── */}
          <SectionCard>
            <SectionHeader
              title={t('securityPage.sectionApiKeys')}
              action={
                <button
                  onClick={() => {}}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '7px 14px', borderRadius: radius.md, border: 'none',
                    background: colors.primary, color: colors.white,
                    fontSize: 12, fontWeight: 600, fontFamily: font.sans, cursor: 'pointer',
                  }}
                >
                  + {t('securityPage.newKeyBtn')}
                </button>
              }
            />
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: font.sans }}>
                <thead>
                  <tr>
                    <th style={thStyle}>{t('securityPage.colKeyName')}</th>
                    <th style={thStyle}>{t('securityPage.colCreated')}</th>
                    <th style={thStyle}>{t('securityPage.colLastUsed')}</th>
                    <th style={thStyle}>{t('securityPage.colScope')}</th>
                    <th style={{ ...thStyle, textAlign: 'right' }}>{t('securityPage.revokeBtn')}</th>
                  </tr>
                </thead>
                <tbody>
                  {API_KEYS.map((key, idx) => {
                    const isLast = idx === API_KEYS.length - 1;
                    return (
                      <tr key={key.id} style={{ background: colors.white }}>
                        <td style={{ padding: '13px 20px', borderBottom: isLast ? 'none' : `1px solid ${colors.border}` }}>
                          <div style={{ fontWeight: 600, fontSize: 13, color: colors.slate900 }}>{key.name}</div>
                          <div style={{ fontSize: 11, color: colors.slate400, fontFamily: 'monospace', marginTop: 2 }}>{key.prefix}</div>
                        </td>
                        <td style={{ padding: '13px 20px', borderBottom: isLast ? 'none' : `1px solid ${colors.border}`, fontSize: 13, color: colors.slate500 }}>
                          {key.created}
                        </td>
                        <td style={{ padding: '13px 20px', borderBottom: isLast ? 'none' : `1px solid ${colors.border}`, fontSize: 13, color: colors.slate500 }}>
                          {key.lastUsed}
                        </td>
                        <td style={{ padding: '13px 20px', borderBottom: isLast ? 'none' : `1px solid ${colors.border}` }}>
                          <span style={{ fontSize: 11, fontFamily: 'monospace', color: colors.slate600, background: colors.slate50, border: `1px solid ${colors.border}`, borderRadius: radius.sm, padding: '2px 6px' }}>
                            {key.scope}
                          </span>
                        </td>
                        <td style={{ padding: '13px 20px', borderBottom: isLast ? 'none' : `1px solid ${colors.border}`, textAlign: 'right' }}>
                          <button
                            onClick={() => {}}
                            style={{
                              padding: '4px 10px', borderRadius: radius.sm, fontSize: 12, fontWeight: 600,
                              background: 'transparent', border: `1px solid ${colors.dangerBorder ?? '#fecaca'}`,
                              color: colors.danger, cursor: 'pointer', fontFamily: font.sans,
                            }}
                          >
                            {t('securityPage.revokeBtn')}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </SectionCard>

          {/* ── 3. Audit Log ──────────────────────────────────────────────── */}
          <SectionCard>
            <SectionHeader
              title={t('securityPage.sectionAuditLog')}
              action={
                <button
                  onClick={() => {}}
                  style={{
                    padding: '7px 14px', borderRadius: radius.md, fontSize: 12, fontWeight: 600,
                    background: 'transparent', border: `1px solid ${colors.border}`,
                    color: colors.slate600, cursor: 'pointer', fontFamily: font.sans,
                  }}
                >
                  {t('securityPage.exportLogBtn')}
                </button>
              }
            />
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: font.sans }}>
                <thead>
                  <tr>
                    <th style={thStyle}>{t('securityPage.colAction')}</th>
                    <th style={thStyle}>{t('securityPage.colUser')}</th>
                    <th style={thStyle}>{t('securityPage.colTimestamp')}</th>
                    <th style={thStyle}>{t('securityPage.colIp')}</th>
                    <th style={thStyle}>{t('securityPage.colResult')}</th>
                  </tr>
                </thead>
                <tbody>
                  {AUDIT_LOG.map((entry, idx) => {
                    const isLast = idx === AUDIT_LOG.length - 1;
                    return (
                      <tr key={entry.id} style={{ background: colors.white }}>
                        <td style={{ padding: '12px 20px', borderBottom: isLast ? 'none' : `1px solid ${colors.border}`, fontSize: 13, fontWeight: 500, color: colors.slate800 }}>
                          {entry.action}
                        </td>
                        <td style={{ padding: '12px 20px', borderBottom: isLast ? 'none' : `1px solid ${colors.border}`, fontSize: 12, color: colors.slate500 }}>
                          {entry.user}
                        </td>
                        <td style={{ padding: '12px 20px', borderBottom: isLast ? 'none' : `1px solid ${colors.border}`, fontSize: 12, fontFamily: 'monospace', color: colors.slate500 }}>
                          {entry.timestamp}
                        </td>
                        <td style={{ padding: '12px 20px', borderBottom: isLast ? 'none' : `1px solid ${colors.border}`, fontSize: 12, fontFamily: 'monospace', color: colors.slate500 }}>
                          {entry.ip}
                        </td>
                        <td style={{ padding: '12px 20px', borderBottom: isLast ? 'none' : `1px solid ${colors.border}` }}>
                          <Badge
                            label={entry.result === 'success' ? t('securityPage.resultSuccess') : t('securityPage.resultFailed')}
                            variant={entry.result === 'success' ? 'success' : 'danger'}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </SectionCard>

        </div>
      </div>
    </PageLayout>
  );
}
