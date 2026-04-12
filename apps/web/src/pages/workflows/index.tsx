import React, { useState, useEffect, useCallback, useMemo } from 'react';
import PageLayout from '@/components/layout/PageLayout';
import PageHeader from '@/components/ui/PageHeader';
import { useTenant } from '@/core/tenant/useTenant';
import { useTranslation } from '@/i18n/useTranslation';
import { apiFetch } from '@/lib/api';
import { colors, radius, font } from '@/lib/styles';

// ── Types ─────────────────────────────────────────────────────────────────────

interface WorkflowStep {
  step: number;
  label: string;
  status: string;
  actor?: string;
  comment?: string;
  timestamp?: string;
}

interface WorkflowItem {
  id: string;
  type: string;
  reference: string;
  title: string;
  status: string;
  currentStep: number;
  totalSteps: number;
  createdAt: string;
  requestedBy: string;
  steps: WorkflowStep[];
}

interface WorkflowsResponse {
  items: WorkflowItem[];
  pendingCount: number;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const STATUS_COLOR: Record<string, string> = {
  PENDING_SUBMISSION: colors.slate400,
  PENDING_REVIEW:     colors.warning,
  PENDING_APPROVAL:   colors.info,
  APPROVED:           colors.success,
  REJECTED:           colors.danger,
  CANCELLED:          colors.slate400,
};

const STATUS_BG: Record<string, string> = {
  PENDING_SUBMISSION: colors.slate100,
  PENDING_REVIEW:     colors.warningLight  ?? '#fffbeb',
  PENDING_APPROVAL:   colors.infoLight     ?? '#f0f9ff',
  APPROVED:           colors.successLight  ?? '#ecfdf5',
  REJECTED:           colors.dangerLight   ?? '#fef2f2',
  CANCELLED:          colors.slate100,
};

const ACCENT = '#7c3aed';

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return iso;
  }
}

function canAct(status: string): boolean {
  return status === 'PENDING_REVIEW' || status === 'PENDING_APPROVAL';
}

// ── Sub-components ────────────────────────────────────────────────────────────

interface StatCardMiniProps {
  label: string;
  value: number | string;
  icon: string;
  color: string;
}

function StatCardMini({ label, value, icon, color }: StatCardMiniProps) {
  return (
    <div style={{
      background: colors.white,
      border: `1px solid ${colors.border}`,
      borderRadius: radius.lg,
      padding: '16px 20px',
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      flex: '1 1 0',
      minWidth: 160,
      boxShadow: colors.shadow,
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: radius.md,
        background: color + '18', display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: 20, flexShrink: 0,
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 22, fontWeight: 700, color: colors.slate900, lineHeight: 1, fontFamily: font.sans }}>
          {value}
        </div>
        <div style={{ fontSize: 12, color: colors.slate500, marginTop: 3, fontFamily: font.sans }}>
          {label}
        </div>
      </div>
    </div>
  );
}

interface StatusBadgeProps { status: string; label: string }
function StatusBadge({ status, label }: StatusBadgeProps) {
  const color = STATUS_COLOR[status] ?? colors.slate400;
  const bg    = STATUS_BG[status]    ?? colors.slate100;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      fontSize: 11, fontWeight: 700, color, background: bg,
      borderRadius: radius.full, padding: '3px 9px', fontFamily: font.sans,
      whiteSpace: 'nowrap' as const, letterSpacing: '0.2px',
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: color, display: 'inline-block', flexShrink: 0 }} />
      {label}
    </span>
  );
}

interface StepProgressProps { current: number; total: number; label: string; color?: string }
function StepProgress({ current, total, label, color = ACCENT }: StepProgressProps) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;
  return (
    <div style={{ fontFamily: font.sans }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: colors.slate700, marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ height: 4, width: 80, background: colors.slate100, borderRadius: radius.full, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: radius.full, transition: 'width 0.3s' }} />
      </div>
    </div>
  );
}

interface ActionButtonProps {
  label: string; color: string; outline?: boolean; onClick: () => void; disabled?: boolean;
}
function ActionButton({ label, color, outline, onClick, disabled }: ActionButtonProps) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '5px 12px', fontSize: 12, fontWeight: 600,
        borderRadius: radius.md, cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: font.sans, transition: 'opacity 0.15s, background 0.15s',
        opacity: disabled ? 0.5 : 1,
        ...(outline
          ? { background: hovered ? color + '10' : 'transparent', border: `1.5px solid ${color}`, color }
          : { background: hovered ? color + 'dd' : color, border: `1.5px solid ${color}`, color: colors.white }),
      }}
    >
      {label}
    </button>
  );
}

function SkeletonRow() {
  return (
    <tr>
      {[120, 200, 110, 100, 130, 80].map((w, i) => (
        <td key={i} style={{ padding: '14px 16px' }}>
          <div style={{ height: 12, width: w, borderRadius: radius.sm, background: colors.slate100 }} />
        </td>
      ))}
    </tr>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function WorkflowsPage() {
  const { tenantId } = useTenant();
  const { t } = useTranslation();
  const [items, setItems] = useState<WorkflowItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [acting, setActing] = useState<string | null>(null);

  // Status label map — derived from translations
  const STATUS_LABEL = useMemo<Record<string, string>>(() => ({
    PENDING_SUBMISSION: t('workflowsPage.statusPendingSubmission'),
    PENDING_REVIEW:     t('workflowsPage.statusPendingReview'),
    PENDING_APPROVAL:   t('workflowsPage.statusPendingApproval'),
    APPROVED:           t('workflowsPage.statusApproved'),
    REJECTED:           t('workflowsPage.statusRejected'),
    CANCELLED:          t('workflowsPage.statusCancelled'),
  }), [t]);

  const FILTER_TABS = useMemo(() => [
    { key: 'ALL',              label: t('workflowsPage.filterAll') },
    { key: 'PENDING_REVIEW',   label: t('workflowsPage.filterPendingReview') },
    { key: 'PENDING_APPROVAL', label: t('workflowsPage.filterPendingApproval') },
    { key: 'APPROVED',         label: t('workflowsPage.filterApproved') },
    { key: 'REJECTED',         label: t('workflowsPage.filterRejected') },
  ], [t]);

  const fetchWorkflows = useCallback(async () => {
    try {
      setError(null);
      const res = await apiFetch<WorkflowsResponse>(
        `/api/workflows?tenantId=${encodeURIComponent(tenantId)}`,
        { tenantId }
      );
      setItems(res.data.items);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : t('workflowsPage.emptyAll'));
    } finally {
      setLoading(false);
    }
  }, [tenantId, t]);

  useEffect(() => { fetchWorkflows(); }, [fetchWorkflows]);

  const handleAction = useCallback(async (item: WorkflowItem, action: 'APPROVED' | 'REJECTED') => {
    setActing(item.id);
    try {
      await apiFetch(`/api/workflows/${item.id}`, {
        method: 'POST',
        body: JSON.stringify({ action }),
        tenantId,
      });
      setItems((prev) => prev.map((w) => w.id === item.id ? { ...w, status: action } : w));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Action failed');
    } finally {
      setActing(null);
    }
  }, [tenantId]);

  const pendingReview   = items.filter((i) => i.status === 'PENDING_REVIEW').length;
  const pendingApproval = items.filter((i) => i.status === 'PENDING_APPROVAL').length;

  const [completedToday, setCompletedToday] = useState(0);
  useEffect(() => {
    const today = new Date().toDateString();
    setCompletedToday(
      items.filter((i) => i.status === 'APPROVED' && new Date(i.createdAt).toDateString() === today).length
    );
  }, [items]);

  const filtered = activeFilter === 'ALL' ? items : items.filter((i) => i.status === activeFilter);

  const thStyle: React.CSSProperties = {
    padding: '11px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700,
    color: colors.slate500, textTransform: 'uppercase', letterSpacing: '0.6px',
    background: colors.slate50, borderBottom: `1px solid ${colors.border}`,
    fontFamily: font.sans, whiteSpace: 'nowrap',
  };

  const tdStyle: React.CSSProperties = {
    padding: '13px 16px', borderBottom: `1px solid ${colors.border}`,
    verticalAlign: 'middle', fontFamily: font.sans,
  };

  return (
    <PageLayout>
      <PageHeader
        title={t('workflowsPage.title')}
        description={t('workflowsPage.description')}
        icon="⚡"
        accentColor={ACCENT}
      />

      {/* Stat cards */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' as const }}>
        <StatCardMini label={t('workflowsPage.stat1Label')} value={loading ? '—' : pendingReview}   icon="👁️" color={colors.warning} />
        <StatCardMini label={t('workflowsPage.stat2Label')} value={loading ? '—' : pendingApproval} icon="✋" color={colors.info} />
        <StatCardMini label={t('workflowsPage.stat3Label')} value={loading ? '—' : completedToday}  icon="✅" color={colors.success} />
      </div>

      {/* Error banner */}
      {error && (
        <div style={{
          background: colors.dangerLight ?? '#fef2f2', border: `1px solid ${colors.dangerBorder ?? '#fecaca'}`,
          borderRadius: radius.lg, padding: '12px 18px', marginBottom: 20,
          fontSize: 13, color: colors.danger, fontFamily: font.sans,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span>⚠️</span>
          {error}
          <button
            onClick={fetchWorkflows}
            style={{
              marginLeft: 'auto', background: 'none', border: `1px solid ${colors.danger}`,
              borderRadius: radius.md, color: colors.danger, fontSize: 12,
              fontWeight: 600, padding: '4px 10px', cursor: 'pointer', fontFamily: font.sans,
            }}
          >
            {t('workflowsPage.retry')}
          </button>
        </div>
      )}

      {/* Main card */}
      <div style={{
        background: colors.white, border: `1px solid ${colors.border}`,
        borderRadius: radius.xl, boxShadow: colors.shadow, overflow: 'hidden',
      }}>
        {/* Filter tabs */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 2, padding: '12px 16px 0',
          borderBottom: `1px solid ${colors.border}`, overflowX: 'auto' as const,
        }}>
          {FILTER_TABS.map((tab) => {
            const isActive = activeFilter === tab.key;
            const count = tab.key === 'ALL' ? items.length : items.filter((i) => i.status === tab.key).length;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveFilter(tab.key)}
                style={{
                  padding: '8px 14px', fontSize: 13, fontWeight: isActive ? 700 : 500,
                  color: isActive ? ACCENT : colors.slate500, background: 'none', border: 'none',
                  borderBottom: isActive ? `2px solid ${ACCENT}` : '2px solid transparent',
                  cursor: 'pointer', fontFamily: font.sans, display: 'flex', alignItems: 'center',
                  gap: 6, whiteSpace: 'nowrap' as const, marginBottom: -1, transition: 'color 0.12s',
                }}
              >
                {tab.label}
                {!loading && (
                  <span style={{
                    fontSize: 10, fontWeight: 700,
                    background: isActive ? ACCENT + '18' : colors.slate100,
                    color: isActive ? ACCENT : colors.slate400,
                    borderRadius: radius.full, padding: '1px 6px', minWidth: 18, textAlign: 'center',
                  }}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' as const }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: font.sans }}>
            <thead>
              <tr>
                <th style={thStyle}>{t('workflowsPage.colReference')}</th>
                <th style={thStyle}>{t('workflowsPage.colTitleType')}</th>
                <th style={thStyle}>{t('workflowsPage.colStatus')}</th>
                <th style={thStyle}>{t('workflowsPage.colProgress')}</th>
                <th style={thStyle}>{t('workflowsPage.colRequestedBy')}</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>{t('workflowsPage.colActions')}</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                : filtered.map((item, idx) => {
                    const isActing = acting === item.id;
                    const isLast   = idx === filtered.length - 1;
                    return (
                      <tr key={item.id} style={{ background: isActing ? colors.slate50 : colors.white, transition: 'background 0.1s' }}>
                        {/* Reference */}
                        <td style={{ ...tdStyle, borderBottom: isLast ? 'none' : `1px solid ${colors.border}` }}>
                          <span style={{ fontFamily: font.mono ?? "'JetBrains Mono', monospace", fontWeight: 700, fontSize: 13, color: colors.primary, letterSpacing: '-0.3px' }}>
                            {item.reference}
                          </span>
                        </td>

                        {/* Title / Type */}
                        <td style={{ ...tdStyle, borderBottom: isLast ? 'none' : `1px solid ${colors.border}` }}>
                          <div style={{ fontWeight: 600, fontSize: 13, color: colors.slate900, marginBottom: 2 }}>{item.title}</div>
                          <div style={{ fontSize: 11, color: colors.slate400, textTransform: 'uppercase' as const, letterSpacing: '0.4px', fontWeight: 600 }}>{item.type}</div>
                        </td>

                        {/* Status */}
                        <td style={{ ...tdStyle, borderBottom: isLast ? 'none' : `1px solid ${colors.border}` }}>
                          <StatusBadge status={item.status} label={STATUS_LABEL[item.status] ?? item.status} />
                        </td>

                        {/* Steps progress */}
                        <td style={{ ...tdStyle, borderBottom: isLast ? 'none' : `1px solid ${colors.border}` }}>
                          <StepProgress
                            current={item.currentStep}
                            total={item.totalSteps}
                            label={t('workflowsPage.stepOf', { current: String(item.currentStep), total: String(item.totalSteps) })}
                            color={STATUS_COLOR[item.status] ?? ACCENT}
                          />
                        </td>

                        {/* Requested by + date */}
                        <td style={{ ...tdStyle, borderBottom: isLast ? 'none' : `1px solid ${colors.border}` }}>
                          <div style={{ fontSize: 13, color: colors.slate700, fontWeight: 500 }}>{item.requestedBy}</div>
                          <div style={{ fontSize: 11, color: colors.slate400, marginTop: 2 }}>{formatDate(item.createdAt)}</div>
                        </td>

                        {/* Actions */}
                        <td style={{ ...tdStyle, borderBottom: isLast ? 'none' : `1px solid ${colors.border}`, textAlign: 'right' }}>
                          {canAct(item.status) ? (
                            <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                              <ActionButton label={t('workflowsPage.approve')} color={colors.success} disabled={isActing} onClick={() => handleAction(item, 'APPROVED')} />
                              <ActionButton label={t('workflowsPage.reject')}  color={colors.danger}  outline disabled={isActing} onClick={() => handleAction(item, 'REJECTED')} />
                            </div>
                          ) : (
                            <span style={{ fontSize: 12, color: colors.slate300, fontFamily: font.sans }}>—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
            </tbody>
          </table>

          {/* Empty state */}
          {!loading && filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '56px 24px', fontFamily: font.sans }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>✅</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: colors.slate700, marginBottom: 6 }}>
                {t('workflowsPage.emptyTitle')}
              </div>
              <div style={{ fontSize: 13, color: colors.slate400 }}>
                {activeFilter === 'ALL'
                  ? t('workflowsPage.emptyAll')
                  : t('workflowsPage.emptyFiltered', { status: STATUS_LABEL[activeFilter] ?? activeFilter })}
              </div>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
