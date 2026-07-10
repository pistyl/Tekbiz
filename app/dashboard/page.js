'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n';
import { getSession } from '@/lib/auth';
import { IconDollar, IconPackage, IconTrendUp, IconTag, IconLink, IconHand } from '@/lib/icons';

const statusColors = {
  PENDING: 'warning', 
  CONFIRMED: 'info', 
  PREPARING: 'info', 
  READY: 'primary', 
  DELIVERED: 'success', 
  CANCELLED: 'danger'
};

function formatCFA(n) { return new Intl.NumberFormat('fr-FR').format(n); }

export default function DashboardHome() {
  const { t } = useLanguage();
  const [session, setSession] = useState(null);
  const [productsCount, setProductsCount] = useState(0);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const dateInputRef = useRef(null);
  const monthInputRef = useRef(null);

  // Filtres de date
  const [filterMode, setFilterMode] = useState('all'); // 'all', 'today', 'month', 'custom-date', 'custom-month'
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setSelectedDate(today);
    setSelectedMonth(today.substring(0, 7));

    const s = getSession();
    setSession(s);

    if (s?.store?.id) {
      Promise.all([
        fetch(`/api/products?storeId=${s.store.id}`).then(res => res.json()),
        fetch(`/api/orders?storeId=${s.store.id}`).then(res => res.json())
      ])
      .then(([prodRes, ordRes]) => {
        if (prodRes.success) setProductsCount(prodRes.products.length);
        if (ordRes.success) setOrders(ordRes.orders || []);
      })
      .catch(err => console.error('Failed to load dashboard stats:', err))
      .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const userName = session?.name?.split(' ')[0] || '...';

  // Helpers pour le filtrage par date
  const isToday = (dateStr) => {
    const d = new Date(dateStr);
    const today = new Date();
    return d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear();
  };

  const isThisMonth = (dateStr) => {
    const d = new Date(dateStr);
    const today = new Date();
    return d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear();
  };

  const isCustomDate = (dateStr) => {
    if (!selectedDate) return false;
    const d = new Date(dateStr);
    const target = new Date(selectedDate);
    return d.getDate() === target.getDate() &&
      d.getMonth() === target.getMonth() &&
      d.getFullYear() === target.getFullYear();
  };

  const isCustomMonth = (dateStr) => {
    if (!selectedMonth) return false;
    const d = new Date(dateStr);
    const [year, month] = selectedMonth.split('-').map(Number);
    return d.getFullYear() === year && d.getMonth() + 1 === month;
  };

  // 1. Somme totale historique des ventes (commandes validées uniquement)
  const globalTotalSales = orders
    .filter(o => o.status !== 'PENDING' && o.status !== 'CANCELLED')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  // 2. Filtrage des commandes de la période sélectionnée
  const filteredOrders = orders.filter(o => {
    if (filterMode === 'today') return isToday(o.createdAt);
    if (filterMode === 'month') return isThisMonth(o.createdAt);
    if (filterMode === 'custom-date') return isCustomDate(o.createdAt);
    if (filterMode === 'custom-month') return isCustomMonth(o.createdAt);
    return true; // 'all'
  });

  // Calcul des statistiques de la période (exclure PENDING et CANCELLED)
  const periodRevenue = filteredOrders
    .filter(o => o.status !== 'PENDING' && o.status !== 'CANCELLED')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const periodValidatedCount = filteredOrders.filter(o => o.status !== 'PENDING' && o.status !== 'CANCELLED').length;
  const periodPendingCount = filteredOrders.filter(o => o.status === 'PENDING').length;
  const periodCancelledCount = filteredOrders.filter(o => o.status === 'CANCELLED').length;

  // Libellé dynamique de la période
  const getPeriodLabel = () => {
    if (filterMode === 'today') return "Ventes d'aujourd'hui";
    if (filterMode === 'month') return "Ventes du mois en cours";
    if (filterMode === 'custom-date') {
      const d = new Date(selectedDate);
      return isNaN(d.getTime()) ? "Ventes du jour choisi" : `Ventes du ${d.toLocaleDateString('fr-FR')}`;
    }
    if (filterMode === 'custom-month') {
      if (!selectedMonth) return "Ventes du mois choisi";
      const [year, month] = selectedMonth.split('-');
      const d = new Date(year, month - 1);
      return isNaN(d.getTime()) ? "Ventes du mois choisi" : `Ventes de ${d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}`;
    }
    return "Ventes de la période";
  };

  const stats = [
    { label: getPeriodLabel(), value: `${formatCFA(periodRevenue)} F`, icon: <IconDollar size={20} />, color: '#10B981' },
    { label: "Validées / Livrées", value: String(periodValidatedCount), icon: <IconTrendUp size={20} />, color: '#3B82F6' },
    { label: "En attente", value: String(periodPendingCount), icon: <IconPackage size={20} />, color: '#F97316' },
    { label: "Annulées", value: String(periodCancelledCount), icon: <IconTag size={20} />, color: '#EF4444' },
  ];

  const recentOrders = orders.slice(0, 3);

  return (
    <div style={{ padding: 16 }}>
      {/* Welcome */}
      <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
          <IconHand size={22} />
        </div>
        <div>
          <h3 style={{ fontSize: '1.25rem' }}>Salut, {userName} !</h3>
          <p style={{ color: 'var(--text-tertiary)', fontSize: '0.8125rem' }}>Voici le tableau de bord de votre boutique</p>
        </div>
      </div>

      {/* Somme Totale Historique des Ventes (Grand Encadré Premium) */}
      <div style={{ background: 'var(--gradient-primary)', borderRadius: 'var(--radius-lg)', padding: '20px 16px', color: 'white', marginBottom: 20, boxShadow: 'var(--shadow-md)' }}>
        <div style={{ fontSize: '0.75rem', opacity: 0.85, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Chiffre d'Affaires Global (Commandes Validées)
        </div>
        <div style={{ fontSize: '1.875rem', fontWeight: 800, marginTop: 4, fontFamily: 'var(--font-display)' }}>
          {formatCFA(globalTotalSales)} F
        </div>
        <div style={{ fontSize: '0.6875rem', opacity: 0.75, marginTop: 8 }}>
          Exclut les commandes en attente (PENDING) et annulées (CANCELLED)
        </div>
      </div>

      {/* Filtre de date personnalisé (Permanent, sans layout shift ni dropdown instable) */}
      <div 
        style={{ 
          background: 'var(--surface)', 
          borderRadius: 'var(--radius-lg)', 
          padding: '16px', 
          marginBottom: 20, 
          boxShadow: 'var(--shadow-sm)',
          border: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          gap: 12
        }}
      >
        <h4 style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0, fontWeight: 700 }}>
          Période d'analyse
        </h4>

        {/* Boutons rapides */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          <button 
            type="button"
            onClick={() => setFilterMode('all')}
            style={{
              padding: '10px 6px',
              fontSize: '0.75rem',
              fontWeight: 700,
              borderRadius: 'var(--radius-md)',
              border: '1.5px solid var(--border)',
              background: filterMode === 'all' ? 'var(--primary)' : 'var(--bg-secondary)',
              color: filterMode === 'all' ? 'white' : 'var(--text-main)',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Tout l'historique
          </button>
          <button 
            type="button"
            onClick={() => setFilterMode('today')}
            style={{
              padding: '10px 6px',
              fontSize: '0.75rem',
              fontWeight: 700,
              borderRadius: 'var(--radius-md)',
              border: '1.5px solid var(--border)',
              background: filterMode === 'today' ? 'var(--primary)' : 'var(--bg-secondary)',
              color: filterMode === 'today' ? 'white' : 'var(--text-main)',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Aujourd'hui
          </button>
          <button 
            type="button"
            onClick={() => setFilterMode('month')}
            style={{
              padding: '10px 6px',
              fontSize: '0.75rem',
              fontWeight: 700,
              borderRadius: 'var(--radius-md)',
              border: '1.5px solid var(--border)',
              background: filterMode === 'month' ? 'var(--primary)' : 'var(--bg-secondary)',
              color: filterMode === 'month' ? 'white' : 'var(--text-main)',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Ce mois-ci
          </button>
        </div>

        {/* Inputs calendrier permanents */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 4, paddingTop: 12, borderTop: '1px solid var(--border-light)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>Filtrer par jour :</span>
            <input 
              type="date" 
              value={selectedDate} 
              onChange={e => {
                setSelectedDate(e.target.value);
                setFilterMode('custom-date');
              }}
              onClick={() => setFilterMode('custom-date')}
              style={{
                padding: '10px 8px',
                fontSize: '0.8125rem',
                fontWeight: 600,
                borderRadius: 'var(--radius-md)',
                border: '1.5px solid var(--border)',
                borderColor: filterMode === 'custom-date' ? 'var(--primary)' : 'var(--border)',
                background: 'var(--bg-secondary)',
                color: 'var(--text-main)',
                outline: 'none',
                cursor: 'pointer',
                width: '100%',
                boxShadow: filterMode === 'custom-date' ? '0 0 0 3px var(--primary-light)' : 'none'
              }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>Filtrer par mois :</span>
            <input 
              type="month" 
              value={selectedMonth} 
              onChange={e => {
                setSelectedMonth(e.target.value);
                setFilterMode('custom-month');
              }}
              onClick={() => setFilterMode('custom-month')}
              style={{
                padding: '10px 8px',
                fontSize: '0.8125rem',
                fontWeight: 600,
                borderRadius: 'var(--radius-md)',
                border: '1.5px solid var(--border)',
                borderColor: filterMode === 'custom-month' ? 'var(--primary)' : 'var(--border)',
                background: 'var(--bg-secondary)',
                color: 'var(--text-main)',
                outline: 'none',
                cursor: 'pointer',
                width: '100%',
                boxShadow: filterMode === 'custom-month' ? '0 0 0 3px var(--primary-light)' : 'none'
              }}
            />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 24 }}>
        {stats.map((s, i) => (
          <div key={i} className="stats-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span className="stats-card-label" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{s.label}</span>
              <div style={{ width: 32, height: 32, borderRadius: 'var(--radius-md)', background: `${s.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, flexShrink: 0 }}>
                {s.icon}
              </div>
            </div>
            <div className="stats-card-value" style={{ fontSize: '1.125rem', marginTop: 4 }}>{s.value}</div>
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
          <button className="btn btn-secondary" style={{ flex: 1, fontSize: '0.8125rem', gap: 6 }} onClick={() => { const slug = session?.store?.slug || 'ma-boutique'; const name = session?.store?.name || 'Ma Boutique'; if (navigator.share) { navigator.share({ title: name, url: `http://localhost:3000/shop/${slug}` }); } else { navigator.clipboard.writeText(`http://localhost:3000/shop/${slug}`); alert('Lien copié !'); } }}>
            <IconLink size={14} /> {t('shareStore')}
          </button>
        </div>
      </div>

      {/* Recent Orders */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h4 style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('recentOrders')}</h4>
          <Link href="/dashboard/orders" style={{ fontSize: '0.8125rem', color: 'var(--primary)', fontWeight: 600 }}>{t('viewAll')} →</Link>
        </div>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: 20, color: 'var(--text-tertiary)' }}>Chargement...</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {recentOrders.map(order => (
              <Link key={order.id} href={`/dashboard/orders`} className="order-card">
                <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.75rem', color: 'var(--text-secondary)', flexShrink: 0 }}>
                  {order.customerName.split(' ').map(n => n[0]).join('')}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{order.customerName}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{order.orderNumber} · {order.items?.length || 0} {t('items')}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{formatCFA(order.totalAmount)} F</div>
                  <span className={`badge badge-${statusColors[order.status]}`}>{t(order.status.toLowerCase())}</span>
                </div>
              </Link>
            ))}
            
            {recentOrders.length === 0 && (
              <div style={{ textAlign: 'center', padding: 20, color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
                Aucune commande récente
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
