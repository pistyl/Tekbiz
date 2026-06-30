'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n';
import { getSession } from '@/lib/auth';

const mockOrders = [
  { id: 'TK-2401', customer: 'Aminata Sow', items: 3, total: 45000, status: 'pending', time: '12 min' },
  { id: 'TK-2400', customer: 'Ibrahima Fall', items: 1, total: 15000, status: 'confirmed', time: '1h' },
  { id: 'TK-2399', customer: 'Fatou Diallo', items: 2, total: 32000, status: 'delivered', time: '3h' },
];

const statusColors = {
  pending: 'warning', confirmed: 'info', preparing: 'info', ready: 'primary', delivered: 'success', cancelled: 'danger'
};

function formatCFA(n) { return new Intl.NumberFormat('fr-FR').format(n); }

export default function DashboardHome() {
  const { t } = useLanguage();
  const [session, setSession] = useState(null);

  useEffect(() => {
    setSession(getSession());
  }, []);

  const userName = session?.name?.split(' ')[0] || '...';

  const stats = [
    { label: t('todaySales'), value: `${formatCFA(127500)}`, trend: '+12%', up: true, icon: '💰' },
    { label: t('pendingOrders'), value: '8', trend: '+3', up: true, icon: '📦' },
    { label: t('monthRevenue'), value: `${formatCFA(2450000)}`, trend: '+24%', up: true, icon: '📈' },
    { label: t('totalProducts'), value: '47', trend: '', up: true, icon: '🏷️' },
  ];

  return (
    <div style={{ padding: 16 }}>
      {/* Welcome */}
      <div style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: '1.25rem' }}>👋 Salut, {userName} !</h3>
        <p style={{ color: 'var(--text-tertiary)', fontSize: '0.8125rem' }}>Voici le résumé de votre journée</p>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 24 }}>
        {stats.map((s, i) => (
          <div key={i} className="stats-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span className="stats-card-label">{s.label}</span>
              <span style={{ fontSize: 20 }}>{s.icon}</span>
            </div>
            <div className="stats-card-value">{s.value}</div>
            {s.trend && <div className={`stats-card-trend ${s.up ? 'up' : 'down'}`}>{s.up ? '↑' : '↓'} {s.trend}</div>}
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div style={{ marginBottom: 24 }}>
        <h4 style={{ marginBottom: 12, fontSize: '0.875rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('quickActions')}</h4>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link href="/dashboard/products/new" className="btn btn-primary" style={{ flex: 1, fontSize: '0.8125rem' }}>
            + {t('addProduct')}
          </Link>
          <button className="btn btn-secondary" style={{ flex: 1, fontSize: '0.8125rem' }} onClick={() => { const slug = session?.store?.slug || 'ma-boutique'; const name = session?.store?.name || 'Ma Boutique'; if (navigator.share) { navigator.share({ title: name, url: `https://${slug}.tekbiz.sn` }); } else { navigator.clipboard.writeText(`https://${slug}.tekbiz.sn`); alert('Lien copié !'); } }}>
            🔗 {t('shareStore')}
          </button>
        </div>
      </div>

      {/* Recent Orders */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h4 style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('recentOrders')}</h4>
          <Link href="/dashboard/orders" style={{ fontSize: '0.8125rem', color: 'var(--primary)', fontWeight: 600 }}>{t('viewAll')} →</Link>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {mockOrders.map(order => (
            <Link key={order.id} href={`/dashboard/orders/${order.id}`} className="order-card">
              <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.75rem', color: 'var(--text-secondary)', flexShrink: 0 }}>
                {order.customer.split(' ').map(n => n[0]).join('')}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{order.customer}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{order.id} · {order.items} {t('items')} · {order.time}</div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{formatCFA(order.total)}</div>
                <span className={`badge badge-${statusColors[order.status]}`}>{t(order.status)}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
