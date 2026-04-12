import React, { useState } from 'react';
import Link from 'next/link';
import PageLayout from '@/components/layout/PageLayout';
import PageHeader from '@/components/ui/PageHeader';
import Badge from '@/components/ui/Badge';
import { useTenant } from '@/core/tenant/useTenant';
import { useTranslation } from '@/i18n/useTranslation';
import { colors, radius, font } from '@/lib/styles';

// ── Mock team data ────────────────────────────────────────────────────────────

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  joined: string;
  avatar: string;
}

const TEAM_MEMBERS: TeamMember[] = [
  { id: 'u1', name: 'Pierre Kabangu',    email: 'p.kabangu@minechain.ai',   role: 'Owner',   status: 'active',   joined: '2025-01-01', avatar: 'PK' },
  { id: 'u2', name: 'Marie Nsenga',      email: 'm.nsenga@minechain.ai',    role: 'Admin',   status: 'active',   joined: '2025-01-15', avatar: 'MN' },
  { id: 'u3', name: 'Jean Kasongo',      email: 'j.kasongo@minechain.ai',   role: 'Manager', status: 'active',   joined: '2025-02-03', avatar: 'JK' },
  { id: 'u4', name: 'André Mwamba',      email: 'a.mwamba@minechain.ai',    role: 'Member',  status: 'active',   joined: '2025-03-10', avatar: 'AM' },
  { id: 'u5', name: 'Sophie Tshimanga', email: 's.tshimanga@minechain.ai', role: 'Viewer',  status: 'invited',  joined: '2026-04-11', avatar: 'ST' },
];

const ROLE_COLORS: Record<string, string> = {
  Owner:   '#7c3aed',
  Admin:   colors.primary,
  Manager: colors.info,
  Member:  colors.success,
  Viewer:  colors.slate400,
};

const STATUS_VARIANT: Record<string, 'success' | 'warning' | 'neutral'> = {
  active:    'success',
  invited:   'warning',
  suspended: 'neutral',
};

// ── Avatar ────────────────────────────────────────────────────────────────────

function Avatar({ initials, color }: { initials: string; color: string }) {
  return (
    <div style={{
      width: 36, height: 36, borderRadius: '50%',
      background: color + '22', border: `2px solid ${color}44`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 12, fontWeight: 700, color, fontFamily: font.sans,
      flexShrink: 0,
    }}>
      {initials}
    </div>
  );
}

// ── Role pill ─────────────────────────────────────────────────────────────────

function RolePill({ role, label }: { role: string; label: string }) {
  const col = ROLE_COLORS[role] ?? colors.slate400;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      fontSize: 11, fontWeight: 700, color: col,
      background: col + '18', border: `1px solid ${col}40`,
      borderRadius: radius.full, padding: '2px 9px',
      fontFamily: font.sans, letterSpacing: '0.2px',
    }}>
      {label}
    </span>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function TeamPage() {
  const { tenantName } = useTenant();
  const { t } = useTranslation();
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  const NAV_ITEMS = [
    { label: t('settingsPage.navGeneral'),      icon: '⚙️',  href: '/settings' },
    { label: t('settingsPage.navSubscription'), icon: '💳',  href: '/settings/subscription' },
    { label: t('settingsPage.navModules'),      icon: '📦',  href: '/settings/modules' },
    { label: t('settingsPage.navTeam'),         icon: '👥',  href: '/settings/team' },
    { label: t('settingsPage.navSecurity'),     icon: '🔒',  href: '/settings/security' },
  ];

  const ROLE_LABELS: Record<string, string> = {
    Owner:   t('teamPage.roleOwner'),
    Admin:   t('teamPage.roleAdmin'),
    Manager: t('teamPage.roleManager'),
    Member:  t('teamPage.roleMember'),
    Viewer:  t('teamPage.roleViewer'),
  };

  const STATUS_LABELS: Record<string, string> = {
    active:    t('teamPage.statusActive'),
    invited:   t('teamPage.statusInvited'),
    suspended: t('teamPage.statusSuspended'),
  };

  const memberCount = TEAM_MEMBERS.length;

  const thStyle: React.CSSProperties = {
    padding: '10px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700,
    color: colors.slate500, textTransform: 'uppercase', letterSpacing: '0.6px',
    background: colors.slate50, borderBottom: `1px solid ${colors.border}`,
    fontFamily: font.sans,
  };

  return (
    <PageLayout>
      <PageHeader
        title={t('teamPage.title')}
        description={t('teamPage.description')}
        icon="👥"
        action={{ label: t('teamPage.inviteMember') }}
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
            const isActive = item.href === '/settings/team';
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

          {/* Members table */}
          <div style={{
            background: colors.white, border: `1px solid ${colors.border}`,
            borderRadius: radius.xl, boxShadow: colors.shadow, overflow: 'hidden', marginBottom: 24,
          }}>
            {/* Header */}
            <div style={{
              padding: '18px 24px', borderBottom: `1px solid ${colors.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: colors.slate900, fontFamily: font.sans }}>
                  {t('teamPage.sectionMembers')}
                </h3>
                <div style={{ fontSize: 12, color: colors.slate400, marginTop: 2, fontFamily: font.sans }}>
                  {memberCount !== 1
                    ? t('teamPage.memberCountPlural', { n: String(memberCount) })
                    : t('teamPage.memberCount', { n: String(memberCount) })}
                  {' · '}{tenantName}
                </div>
              </div>
              <button
                onClick={() => {}}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '8px 16px', borderRadius: radius.md, border: 'none',
                  background: colors.primary, color: colors.white,
                  fontSize: 13, fontWeight: 600, fontFamily: font.sans, cursor: 'pointer',
                }}
              >
                <span>+</span>
                {t('teamPage.inviteMember')}
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: font.sans }}>
                <thead>
                  <tr>
                    <th style={thStyle}>{t('teamPage.colMember')}</th>
                    <th style={thStyle}>{t('teamPage.colRole')}</th>
                    <th style={thStyle}>{t('teamPage.colStatus')}</th>
                    <th style={thStyle}>{t('teamPage.colJoined')}</th>
                    <th style={{ ...thStyle, textAlign: 'right' }}>{t('teamPage.colActions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {TEAM_MEMBERS.map((member, idx) => {
                    const isLast = idx === TEAM_MEMBERS.length - 1;
                    const isHovered = hoveredRow === member.id;
                    return (
                      <tr
                        key={member.id}
                        onMouseEnter={() => setHoveredRow(member.id)}
                        onMouseLeave={() => setHoveredRow(null)}
                        style={{
                          background: isHovered ? colors.slate50 : colors.white,
                          transition: 'background 0.1s',
                        }}
                      >
                        {/* Member */}
                        <td style={{ padding: '14px 20px', borderBottom: isLast ? 'none' : `1px solid ${colors.border}` }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <Avatar initials={member.avatar} color={ROLE_COLORS[member.role] ?? colors.slate400} />
                            <div>
                              <div style={{ fontSize: 14, fontWeight: 600, color: colors.slate900 }}>{member.name}</div>
                              <div style={{ fontSize: 12, color: colors.slate400 }}>{member.email}</div>
                            </div>
                          </div>
                        </td>

                        {/* Role */}
                        <td style={{ padding: '14px 20px', borderBottom: isLast ? 'none' : `1px solid ${colors.border}` }}>
                          <RolePill role={member.role} label={ROLE_LABELS[member.role] ?? member.role} />
                        </td>

                        {/* Status */}
                        <td style={{ padding: '14px 20px', borderBottom: isLast ? 'none' : `1px solid ${colors.border}` }}>
                          <Badge
                            label={STATUS_LABELS[member.status] ?? member.status}
                            variant={STATUS_VARIANT[member.status] ?? 'neutral'}
                          />
                        </td>

                        {/* Joined */}
                        <td style={{ padding: '14px 20px', borderBottom: isLast ? 'none' : `1px solid ${colors.border}`, fontSize: 13, color: colors.slate500 }}>
                          {member.joined}
                        </td>

                        {/* Actions */}
                        <td style={{ padding: '14px 20px', borderBottom: isLast ? 'none' : `1px solid ${colors.border}`, textAlign: 'right' }}>
                          {member.role !== 'Owner' && (
                            <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                              <button
                                onClick={() => {}}
                                style={{
                                  padding: '4px 10px', borderRadius: radius.sm, fontSize: 12, fontWeight: 600,
                                  background: 'transparent', border: `1px solid ${colors.border}`,
                                  color: colors.slate600, cursor: 'pointer', fontFamily: font.sans,
                                }}
                              >
                                {t('teamPage.editRoleBtn')}
                              </button>
                              <button
                                onClick={() => {}}
                                style={{
                                  padding: '4px 10px', borderRadius: radius.sm, fontSize: 12, fontWeight: 600,
                                  background: 'transparent', border: `1px solid ${colors.dangerBorder ?? '#fecaca'}`,
                                  color: colors.danger, cursor: 'pointer', fontFamily: font.sans,
                                }}
                              >
                                {t('teamPage.removeBtn')}
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Roles & Permissions info */}
          <div style={{
            background: colors.white, border: `1px solid ${colors.border}`,
            borderRadius: radius.xl, padding: '20px 24px', boxShadow: colors.shadow,
          }}>
            <h3 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 700, color: colors.slate900, fontFamily: font.sans }}>
              {t('teamPage.sectionRoles')}
            </h3>
            <p style={{ margin: '0 0 20px', fontSize: 13, color: colors.slate500, fontFamily: font.sans }}>
              {t('teamPage.rolesDesc')}
            </p>

            {/* Role cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
              {Object.entries(ROLE_LABELS).map(([role, label]) => {
                const col = ROLE_COLORS[role] ?? colors.slate400;
                const perms: Record<string, string[]> = {
                  Owner:   ['Full access', 'Billing', 'Delete org'],
                  Admin:   ['Full access', 'Invite users'],
                  Manager: ['Manage modules', 'View reports'],
                  Member:  ['Use modules', 'View data'],
                  Viewer:  ['View data only'],
                };
                return (
                  <div key={role} style={{
                    padding: '14px 16px', borderRadius: radius.lg,
                    border: `1px solid ${col}30`, background: col + '06',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: col }} />
                      <span style={{ fontSize: 13, fontWeight: 700, color: col, fontFamily: font.sans }}>{label}</span>
                    </div>
                    {(perms[role] ?? []).map((p) => (
                      <div key={p} style={{ fontSize: 11, color: colors.slate500, fontFamily: font.sans, marginBottom: 3, paddingLeft: 14 }}>
                        · {p}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </PageLayout>
  );
}
