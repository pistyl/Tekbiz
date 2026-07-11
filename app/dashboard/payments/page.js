'use client';
import { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n';
import { IconWave, IconCreditCard } from '@/lib/icons';
import { getSession } from '@/lib/auth';

function formatCFA(n) { return new Intl.NumberFormat('fr-FR').format(n); }

const statusColors = { completed: 'success', pending: 'warning', failed: 'danger', refunded: 'info' };

export default function PaymentsPage() {
  const { t } = useLanguage();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPayments() {
      const session = getSession();
      if (session?.store?.id) {
        try {
          const res = await fetch(`/api/orders?storeId=${session.store.id}`);
          const result = await res.json();
          if (result.success && result.orders) {
            const mapped = result.orders.map(order => ({
              id: order.id,
              order: order.orderNumber,
              amount: order.totalAmount,
              method: (order.paymentMethod || 'wave').toLowerCase(),
              status: (order.paymentStatus || 'pending').toLowerCase(),
              date: new Date(order.createdAt).toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })
            }));
            setPayments(mapped);
          }
        } catch (error) {
          console.error('Failed to load payments:', error);
        }
      }
      setLoading(false);
    }
    loadPayments();
  }, []);

  const totalReceived = payments
    .filter(p => p.status === 'completed')
    .reduce((s, p) => s + p.amount, 0);

  return (
    <div style={{ padding: 16 }}>
      <h3 style={{ marginBottom: 16 }}>{t('paymentHistory')}</h3>

      {/* Summary */}
      <div className="stats-card" style={{ marginBottom: 20, textAlign: 'center' }}>
        <div className="stats-card-label">{t('monthRevenue')}</div>
        <div className="stats-card-value" style={{ fontSize: '2rem', color: 'var(--success)' }}>
          {formatCFA(totalReceived)} F
        </div>
        <div className="stats-card-trend up" style={{ justifyContent: 'center' }}>
          ↑ +24% vs mois dernier
        </div>
      </div>

      {/* Payment List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--text-tertiary)' }}>
          Chargement des paiements...
        </div>
      ) : payments.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {payments.map(p => (
            <div key={p.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 14 }}>
              <div style={{ 
                width: 40, 
                height: 40, 
                borderRadius: 'var(--radius-md)', 
                background: p.method === 'wave' ? '#EFF6FF' : '#FFF7ED', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                flexShrink: 0, 
                color: p.method === 'wave' ? '#3B82F6' : '#F97316' 
              }}>
                {p.method === 'wave' ? <IconWave size={20} /> : <IconCreditCard size={20} />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                  {p.method === 'wave' ? 'Wave' : 'Orange Money'}
                </div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)' }}>
                  {p.order} · {p.date}
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ 
                  fontWeight: 700, 
                  fontSize: '0.9375rem', 
                  color: p.status === 'completed' ? 'var(--success)' : p.status === 'failed' ? 'var(--danger)' : 'var(--text)' 
                }}>
                  {p.status === 'completed' ? '+' : ''}{formatCFA(p.amount)} F
                </div>
                <span className={`badge badge-${statusColors[p.status] || 'warning'}`}>
                  {t(p.status) || p.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--text-tertiary)' }}>
          Aucun paiement reçu pour le moment.
        </div>
      )}
    </div>
  );
}
