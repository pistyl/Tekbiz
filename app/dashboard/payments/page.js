'use client';
import { useLanguage } from '@/lib/i18n';

function formatCFA(n) { return new Intl.NumberFormat('fr-FR').format(n); }

const mockPayments = [
  { id: 'PAY-001', order: 'TK-2401', amount: 68000, method: 'wave', status: 'completed', date: '28 Jun 2026, 14:32' },
  { id: 'PAY-002', order: 'TK-2400', amount: 35000, method: 'orange_money', status: 'completed', date: '28 Jun 2026, 13:15' },
  { id: 'PAY-003', order: 'TK-2399', amount: 15500, method: 'wave', status: 'completed', date: '28 Jun 2026, 10:45' },
  { id: 'PAY-004', order: 'TK-2398', amount: 15000, method: 'orange_money', status: 'failed', date: '27 Jun 2026, 18:20' },
  { id: 'PAY-005', order: 'TK-2397', amount: 42000, method: 'wave', status: 'completed', date: '27 Jun 2026, 09:10' },
];

const statusColors = { completed: 'success', pending: 'warning', failed: 'danger', refunded: 'info' };

export default function PaymentsPage() {
  const { t } = useLanguage();

  const totalReceived = mockPayments.filter(p => p.status === 'completed').reduce((s, p) => s + p.amount, 0);

  return (
    <div style={{ padding: 16 }}>
      <h3 style={{ marginBottom: 16 }}>{t('paymentHistory')}</h3>

      {/* Summary */}
      <div className="stats-card" style={{ marginBottom: 20, textAlign: 'center' }}>
        <div className="stats-card-label">{t('monthRevenue')}</div>
        <div className="stats-card-value" style={{ fontSize: '2rem', color: 'var(--success)' }}>{formatCFA(totalReceived)} F</div>
        <div className="stats-card-trend up" style={{ justifyContent: 'center' }}>↑ +24% vs mois dernier</div>
      </div>

      {/* Payment List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {mockPayments.map(p => (
          <div key={p.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 14 }}>
            <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: p.method === 'wave' ? '#EFF6FF' : '#FFF7ED', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
              {p.method === 'wave' ? '🌊' : '🟠'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{p.method === 'wave' ? 'Wave' : 'Orange Money'}</div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)' }}>{p.order} · {p.date}</div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: p.status === 'completed' ? 'var(--success)' : p.status === 'failed' ? 'var(--danger)' : 'var(--text)' }}>
                {p.status === 'completed' ? '+' : ''}{formatCFA(p.amount)} F
              </div>
              <span className={`badge badge-${statusColors[p.status]}`}>{t(p.status)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
