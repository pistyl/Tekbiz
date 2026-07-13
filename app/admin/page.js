'use client';
import { useState, useEffect } from 'react';

function formatCFA(n) { return new Intl.NumberFormat('fr-FR').format(n); }

export default function AdminDashboard() {
  const [passcode, setPasscode] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [rawStats, setRawStats] = useState(null);
  const [stores, setStores] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPlan, setFilterPlan] = useState('ALL'); // 'ALL', 'FREE', 'PRO'

  // États pour la période d'analyse
  const [filterPeriod, setFilterPeriod] = useState('all'); // 'all', 'today', 'month', 'custom-date', 'custom-month'
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');

  // Initialiser les dates par défaut
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setSelectedDate(today);
    setSelectedMonth(today.substring(0, 7));
  }, []);

  // Vérifier si le mot de passe est déjà en mémoire session
  useEffect(() => {
    const saved = sessionStorage.getItem('tekbiz_admin_token');
    if (saved) {
      loadAdminData(saved);
    }
  }, []);

  const loadAdminData = async (token) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStats(data.stats);
        setRawStats(data.rawStats);
        setStores(data.stores || []);
        setIsUnlocked(true);
        sessionStorage.setItem('tekbiz_admin_token', token);
      } else {
        setError(data.error || 'Mot de passe incorrect');
        sessionStorage.removeItem('tekbiz_admin_token');
      }
    } catch (err) {
      console.error(err);
      setError('Erreur de connexion avec le serveur');
    } finally {
      setLoading(false);
    }
  };

  const handleUnlock = (e) => {
    e.preventDefault();
    if (!passcode.trim()) return;
    loadAdminData(passcode.trim());
  };

  const handleLogout = () => {
    sessionStorage.removeItem('tekbiz_admin_token');
    setIsUnlocked(false);
    setStats(null);
    setRawStats(null);
    setStores([]);
    setPasscode('');
  };

  // Helper pour vérifier si une date appartient à la période d'analyse
  const isDateInPeriod = (dateStr) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    const today = new Date();

    if (filterPeriod === 'all') return true;

    if (filterPeriod === 'today') {
      return d.getDate() === today.getDate() &&
        d.getMonth() === today.getMonth() &&
        d.getFullYear() === today.getFullYear();
    }

    if (filterPeriod === 'month') {
      return d.getMonth() === today.getMonth() &&
        d.getFullYear() === today.getFullYear();
    }

    if (filterPeriod === 'custom-date') {
      if (!selectedDate) return false;
      const target = new Date(selectedDate);
      return d.getDate() === target.getDate() &&
        d.getMonth() === target.getMonth() &&
        d.getFullYear() === target.getFullYear();
    }

    if (filterPeriod === 'custom-month') {
      if (!selectedMonth) return false;
      const [year, month] = selectedMonth.split('-').map(Number);
      return d.getFullYear() === year && d.getMonth() + 1 === month;
    }

    return true;
  };

  // --- STATISTIQUES FILTRÉES PAR PÉRIODE ---

  // 1. Nouvelles boutiques
  const periodStores = stores.filter(s => isDateInPeriod(s.createdAt));
  const periodStoresCount = periodStores.length;
  
  // Nouveaux abonnements PRO activés sur la période
  const periodProStoresCount = periodStores.filter(s => s.plan === 'PRO').length;
  const periodFreeStoresCount = periodStoresCount - periodProStoresCount;

  // 2. Nouveaux utilisateurs
  const periodUsersCount = rawStats?.users 
    ? rawStats.users.filter(u => isDateInPeriod(u.createdAt)).length 
    : 0;

  // 3. Ventes (Commandes) boutiques
  const periodOrders = rawStats?.orders 
    ? rawStats.orders.filter(o => isDateInPeriod(o.createdAt))
    : [];
  const periodOrdersCount = periodOrders.length;
  const periodOrdersRevenue = periodOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  // 4. Revenus abonnements perçus sur la période
  const periodSubscriptionRevenue = periodProStoresCount * 5000;

  // --- FILTRAGE DE LA TABLE DES BOUTIQUES ---
  const filteredStores = stores.filter(s => {
    const matchesSearch = 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.owner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.owner.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesPeriod = isDateInPeriod(s.createdAt);

    if (filterPlan === 'ALL') return matchesSearch && matchesPeriod;
    return matchesSearch && matchesPeriod && s.plan === filterPlan;
  });

  // Libellé de la période d'analyse
  const getPeriodLabel = () => {
    if (filterPeriod === 'all') return "Toutes les statistiques";
    if (filterPeriod === 'today') return "Statistiques d'aujourd'hui";
    if (filterPeriod === 'month') return "Statistiques de ce mois-ci";
    if (filterPeriod === 'custom-date') {
      const d = new Date(selectedDate);
      return isNaN(d.getTime()) ? "Statistiques du jour" : `Statistiques du ${d.toLocaleDateString('fr-FR')}`;
    }
    if (filterPeriod === 'custom-month') {
      if (!selectedMonth) return "Statistiques du mois choisi";
      const [year, month] = selectedMonth.split('-');
      const d = new Date(year, month - 1);
      return isNaN(d.getTime()) ? "Statistiques du mois choisi" : `Statistiques de ${d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}`;
    }
    return "Statistiques de la période";
  };

  // --- CALCUL DES STATS DES 7 DERNIERS JOURS POUR LE DIAGRAMME ---
  const getChartData = () => {
    const list = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' });
      
      const dayStores = stores.filter(s => {
        const sd = new Date(s.createdAt).toISOString().split('T')[0];
        return sd === dateStr;
      }).length;

      const dayOrders = rawStats?.orders 
        ? rawStats.orders.filter(o => {
            const od = new Date(o.createdAt).toISOString().split('T')[0];
            return od === dateStr;
          })
        : [];
      const dayRevenue = dayOrders.reduce((sum, o) => sum + o.totalAmount, 0);

      list.push({ label, storesCount: dayStores, revenue: dayRevenue });
    }
    return list;
  };

  const chartData = getChartData();
  const maxRevenue = Math.max(...chartData.map(d => d.revenue), 1000);

  if (!isUnlocked) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0f172a, #1e293b)', padding: 16, color: '#f8fafc' }}>
        <div style={{ background: '#1e293b', border: '1px solid #334155', padding: '32px 24px', borderRadius: 16, width: '100%', maxWidth: 400, boxShadow: '0 10px 25px rgba(0,0,0,0.3)', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.75rem', marginBottom: 8, background: 'linear-gradient(to right, #3b82f6, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>TEKBIZ ADMIN</h2>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: 24 }}>Saisissez le mot de passe administrateur pour accéder aux données analytiques.</p>

          <form onSubmit={handleUnlock} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <input 
              type="password" 
              className="input" 
              placeholder="Mot de passe" 
              value={passcode} 
              onChange={e => setPasscode(e.target.value)} 
              required 
              style={{ background: '#0f172a', border: '1px solid #475569', color: 'white', textAlign: 'center', padding: '12px', fontSize: '1.0625rem' }} 
            />
            {error && <p style={{ color: '#ef4444', fontSize: '0.8125rem', margin: 0 }}>{error}</p>}
            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading} style={{ background: 'linear-gradient(to right, #3b82f6, #2563eb)' }}>
              {loading ? 'Connexion...' : 'Déverrouiller →'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: '#e2e8f0', fontFamily: 'system-ui, sans-serif' }}>
      {/* Admin Navbar */}
      <header style={{ background: '#1e293b', borderBottom: '1px solid #334155', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 40 }}>
        <div>
          <h2 style={{ fontWeight: 850, fontSize: '1.25rem', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ padding: '4px 8px', background: 'linear-gradient(to right, #3b82f6, #06b6d4)', borderRadius: 6, fontSize: '0.75rem', fontWeight: 900, color: 'white' }}>ADMIN</span>
            TEKBIZ Panel
          </h2>
        </div>
        <button onClick={handleLogout} style={{ border: '1px solid #475569', background: 'transparent', color: '#94a3b8', padding: '6px 12px', borderRadius: 8, fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s' }}>
          Déconnexion
        </button>
      </header>

      <main style={{ padding: '24px 20px', maxWidth: 1200, margin: '0 auto' }}>
        {/* Page Title */}
        <div style={{ marginBottom: 24 }}>
          <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>Données Analytiques</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: 0 }}>Analyse d'activité et gestion des abonnements SaaS.</p>
        </div>

        {/* Section Filtre Période */}
        <div 
          style={{ 
            background: '#1e293b', 
            border: '1px solid #334155',
            borderRadius: 16, 
            padding: '16px', 
            marginBottom: 24, 
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            flexDirection: 'column',
            gap: 12
          }}
        >
          <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Période d'analyse</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: 8 }}>
            <button 
              type="button"
              onClick={() => setFilterPeriod('all')}
              style={{
                padding: '10px 6px',
                fontSize: '0.75rem',
                fontWeight: 700,
                borderRadius: 8,
                border: '1px solid #475569',
                background: filterPeriod === 'all' ? '#3b82f6' : '#0f172a',
                color: filterPeriod === 'all' ? 'white' : '#94a3b8',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Historique
            </button>
            <button 
              type="button"
              onClick={() => setFilterPeriod('today')}
              style={{
                padding: '10px 6px',
                fontSize: '0.75rem',
                fontWeight: 700,
                borderRadius: 8,
                border: '1px solid #475569',
                background: filterPeriod === 'today' ? '#3b82f6' : '#0f172a',
                color: filterPeriod === 'today' ? 'white' : '#94a3b8',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Aujourd'hui
            </button>
            <button 
              type="button"
              onClick={() => setFilterPeriod('month')}
              style={{
                padding: '10px 6px',
                fontSize: '0.75rem',
                fontWeight: 700,
                borderRadius: 8,
                border: '1px solid #475569',
                background: filterPeriod === 'month' ? '#3b82f6' : '#0f172a',
                color: filterPeriod === 'month' ? 'white' : '#94a3b8',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Ce mois-ci
            </button>
            <button 
              type="button"
              onClick={() => setFilterPeriod('custom-date')}
              style={{
                padding: '10px 6px',
                fontSize: '0.75rem',
                fontWeight: 700,
                borderRadius: 8,
                border: '1px solid #475569',
                background: filterPeriod === 'custom-date' ? '#3b82f6' : '#0f172a',
                color: filterPeriod === 'custom-date' ? 'white' : '#94a3b8',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Par Jour
            </button>
            <button 
              type="button"
              onClick={() => setFilterPeriod('custom-month')}
              style={{
                padding: '10px 6px',
                fontSize: '0.75rem',
                fontWeight: 700,
                borderRadius: 8,
                border: '1px solid #475569',
                background: filterPeriod === 'custom-month' ? '#3b82f6' : '#0f172a',
                color: filterPeriod === 'custom-month' ? 'white' : '#94a3b8',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Par Mois
            </button>
          </div>

          {/* Calendars */}
          {(filterPeriod === 'custom-date' || filterPeriod === 'custom-month') && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10, marginTop: 4, paddingTop: 12, borderTop: '1px solid #334155' }}>
              {filterPeriod === 'custom-date' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ fontSize: '0.6875rem', color: '#94a3b8', fontWeight: 600 }}>Choisir le jour :</span>
                  <input 
                    type="date" 
                    className="input" 
                    value={selectedDate} 
                    onChange={e => setSelectedDate(e.target.value)} 
                    style={{ background: '#0f172a', border: '1px solid #334155', color: 'white', padding: '10px', fontSize: '0.8125rem' }}
                  />
                </div>
              )}
              {filterPeriod === 'custom-month' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ fontSize: '0.6875rem', color: '#94a3b8', fontWeight: 600 }}>Choisir le mois :</span>
                  <input 
                    type="month" 
                    className="input" 
                    value={selectedMonth} 
                    onChange={e => setSelectedMonth(e.target.value)} 
                    style={{ background: '#0f172a', border: '1px solid #334155', color: 'white', padding: '10px', fontSize: '0.8125rem' }}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Section Titre Période Active */}
        <div style={{ fontSize: '1rem', fontWeight: 750, color: '#3b82f6', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {getPeriodLabel()}
        </div>

        {/* Statistics Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
          {/* Abonnement / MRR Card */}
          <div style={{ background: '#1e293b', border: '1px solid #334155', padding: 20, borderRadius: 12 }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>REVENUS ABONNEMENTS</span>
            <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: 6, color: '#10b981' }}>
              {formatCFA(periodSubscriptionRevenue)} F
            </div>
            <span style={{ fontSize: '0.6875rem', color: '#64748b' }}>
              {filterPeriod === 'all' 
                ? 'MRR Actuel (5 000 F / boutique PRO)' 
                : 'Souscriptions initiées sur la période'}
            </span>
          </div>

          <div style={{ background: '#1e293b', border: '1px solid #334155', padding: 20, borderRadius: 12 }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>NOUVELLES BOUTIQUES</span>
            <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: 6, color: '#3b82f6' }}>
              {periodStoresCount}
            </div>
            <span style={{ fontSize: '0.6875rem', color: '#64748b' }}>
              {periodProStoresCount} PRO · {periodFreeStoresCount} Gratuites
            </span>
          </div>

          <div style={{ background: '#1e293b', border: '1px solid #334155', padding: 20, borderRadius: 12 }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>NOUVEAUX UTILISATEURS</span>
            <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: 6, color: '#06b6d4' }}>
              {periodUsersCount}
            </div>
            <span style={{ fontSize: '0.6875rem', color: '#64748b' }}>Marchands inscrits sur la période</span>
          </div>

          <div style={{ background: '#1e293b', border: '1px solid #334155', padding: 20, borderRadius: 12 }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>VENTES BOUTIQUES (PÉRIODE)</span>
            <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: 6, color: '#eab308' }}>
              {formatCFA(periodOrdersRevenue)} F
            </div>
            <span style={{ fontSize: '0.6875rem', color: '#64748b' }}>
              {periodOrdersCount} commande(s) confirmée(s)
            </span>
          </div>
        </div>

        {/* Global Lifetime SaaS Metrics */}
        <div style={{ background: '#111827', border: '1px solid #1f2937', padding: '14px 20px', borderRadius: 12, display: 'flex', flexWrap: 'wrap', gap: 24, marginBottom: 24, fontSize: '0.8125rem', color: '#94a3b8' }}>
          <div>Cumul Total SaaS :</div>
          <div>Boutiques Total : <strong style={{ color: 'white' }}>{stores.length}</strong></div>
          <div>Marchands Total : <strong style={{ color: 'white' }}>{stats?.usersCount || 0}</strong></div>
          <div>Produits Total : <strong style={{ color: 'white' }}>{stats?.productsCount || 0}</strong></div>
          <div>Chiffre d'Affaires Global : <strong style={{ color: '#10b981' }}>{stats ? `${formatCFA(stats.totalOrdersRevenue)} F` : '0 F'}</strong></div>
          <div>Revenus Récurrents Mensuels (MRR) : <strong style={{ color: '#10b981' }}>{stats ? `${formatCFA(stats.subscriptionMRR)} F` : '0 F'}</strong></div>
        </div>

        {/* DIAGRAMMES ANALYTIQUES (PURE CSS / HTML - ZERO DEPENDENCY) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16, marginBottom: 32 }}>
          {/* Chart 1: Ventes des 7 derniers jours */}
          <div style={{ background: '#1e293b', border: '1px solid #334155', padding: 20, borderRadius: 16 }}>
            <h4 style={{ margin: '0 0 16px', fontSize: '1rem', fontWeight: 700, color: '#f1f5f9' }}>Chiffre d'affaires (7 derniers jours)</h4>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: 180, paddingTop: 10, borderBottom: '1px solid #334155', gap: 8 }}>
              {chartData.map((d, i) => {
                const heightPercent = (d.revenue / maxRevenue) * 100;
                return (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                    {/* Value label on top */}
                    {d.revenue > 0 && (
                      <span style={{ fontSize: '0.625rem', color: '#10b981', fontWeight: 700, marginBottom: 4, whiteSpace: 'nowrap' }}>
                        {d.revenue >= 1000 ? `${(d.revenue / 1000).toFixed(0)}k` : d.revenue}
                      </span>
                    )}
                    {/* Visual Bar */}
                    <div style={{ 
                      width: '100%', 
                      maxWidth: 24, 
                      height: `${Math.max(heightPercent, 3)}%`, 
                      background: d.revenue > 0 ? 'linear-gradient(to top, #10b981, #34d399)' : '#0f172a', 
                      borderRadius: '4px 4px 0 0',
                      transition: 'height 0.4s ease-in-out',
                      border: d.revenue > 0 ? 'none' : '1px dashed #334155'
                    }} title={`${d.revenue} FCFA`} />
                    {/* Day label */}
                    <span style={{ fontSize: '0.625rem', color: '#94a3b8', marginTop: 8, textAlign: 'center', width: '100%', whiteSpace: 'nowrap' }}>{d.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Chart 2: Distribution des catégories de boutiques */}
          <div style={{ background: '#1e293b', border: '1px solid #334155', padding: 20, borderRadius: 16 }}>
            <h4 style={{ margin: '0 0 16px', fontSize: '1rem', fontWeight: 700, color: '#f1f5f9' }}>Répartition par Catégorie</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {(() => {
                const categoriesMap = {};
                stores.forEach(s => {
                  const cat = s.category || 'Non spécifié';
                  categoriesMap[cat] = (categoriesMap[cat] || 0) + 1;
                });
                
                const sortedCats = Object.entries(categoriesMap)
                  .map(([name, count]) => ({ name, count, percent: (count / (stores.length || 1)) * 100 }))
                  .sort((a, b) => b.count - a.count)
                  .slice(0, 5); // top 5

                const colors = ['#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

                if (sortedCats.length === 0) {
                  return <div style={{ fontSize: '0.8125rem', color: '#64748b', textAlign: 'center', padding: '20px 0' }}>Aucune donnée disponible</div>;
                }

                return sortedCats.map((cat, idx) => (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600 }}>
                      <span style={{ color: '#e2e8f0' }}>{cat.name}</span>
                      <span style={{ color: '#94a3b8' }}>{cat.count} ({cat.percent.toFixed(0)}%)</span>
                    </div>
                    {/* Horizontal progress bar */}
                    <div style={{ width: '100%', height: 8, background: '#0f172a', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ width: `${cat.percent}%`, height: '100%', background: colors[idx % colors.length], borderRadius: 4, transition: 'width 0.4s ease-in-out' }} />
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>

        {/* Merchants List / Subscribers */}
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 16, padding: '24px 20px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
            <h4 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700 }}>Liste des Boutiques & Abonnés ({filteredStores.length})</h4>
            
            {/* Filter buttons */}
            <div style={{ display: 'flex', gap: 6, background: '#0f172a', padding: 4, borderRadius: 8, border: '1px solid #334155' }}>
              <button onClick={() => setFilterPlan('ALL')} style={{ padding: '6px 12px', fontSize: '0.75rem', fontWeight: 600, border: 'none', background: filterPlan === 'ALL' ? '#3b82f6' : 'transparent', color: filterPlan === 'ALL' ? 'white' : '#94a3b8', borderRadius: 6, cursor: 'pointer', transition: 'all 0.2s' }}>
                Tous
              </button>
              <button onClick={() => setFilterPlan('FREE')} style={{ padding: '6px 12px', fontSize: '0.75rem', fontWeight: 600, border: 'none', background: filterPlan === 'FREE' ? '#3b82f6' : 'transparent', color: filterPlan === 'FREE' ? 'white' : '#94a3b8', borderRadius: 6, cursor: 'pointer', transition: 'all 0.2s' }}>
                Gratuits
              </button>
              <button onClick={() => setFilterPlan('PRO')} style={{ padding: '6px 12px', fontSize: '0.75rem', fontWeight: 600, border: 'none', background: filterPlan === 'PRO' ? '#3b82f6' : 'transparent', color: filterPlan === 'PRO' ? 'white' : '#94a3b8', borderRadius: 6, cursor: 'pointer', transition: 'all 0.2s' }}>
                Pro (Payants)
              </button>
            </div>
          </div>

          {/* Search input */}
          <div style={{ marginBottom: 20 }}>
            <input 
              type="text" 
              className="input" 
              placeholder="Rechercher par nom de boutique, slug, marchand, email..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ background: '#0f172a', border: '1px solid #334155', color: '#f8fafc', padding: '12px 14px', borderRadius: 8, width: '100%', fontSize: '0.875rem' }}
            />
          </div>

          {/* Table Container */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 700 }}>
              <thead>
                <tr style={{ borderBottom: '1.5px solid #334155', color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>
                  <th style={{ padding: '12px 10px' }}>Boutique</th>
                  <th style={{ padding: '12px 10px' }}>Propriétaire</th>
                  <th style={{ padding: '12px 10px' }}>Date d'inscription</th>
                  <th style={{ padding: '12px 10px' }}>Produits</th>
                  <th style={{ padding: '12px 10px' }}>Commandes</th>
                  <th style={{ padding: '12px 10px' }}>Statut Plan</th>
                  <th style={{ padding: '12px 10px' }}>Expiration Pro</th>
                </tr>
              </thead>
              <tbody style={{ fontSize: '0.875rem' }}>
                {filteredStores.map(s => {
                  const isProExpired = s.plan === 'PRO' && s.subscriptionEnd && new Date() > new Date(s.subscriptionEnd);
                  return (
                    <tr key={s.id} style={{ borderBottom: '1px solid #334155', color: '#f1f5f9', transition: 'background-color 0.2s' }} className="admin-table-row">
                      <td style={{ padding: '14px 10px' }}>
                        <div style={{ fontWeight: 650 }}>{s.name}</div>
                        <a href={`/shop/${s.slug}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.75rem', color: '#3b82f6', textDecoration: 'none' }}>
                          /{s.slug} ↗
                        </a>
                      </td>
                      <td style={{ padding: '14px 10px' }}>
                        <div style={{ fontWeight: 500 }}>{s.owner.name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{s.owner.email}</div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{s.owner.phone}</div>
                      </td>
                      <td style={{ padding: '14px 10px', color: '#94a3b8' }}>
                        {new Date(s.createdAt).toLocaleDateString('fr-FR')}
                      </td>
                      <td style={{ padding: '14px 10px', fontWeight: 600, color: s.productsCount >= 5 ? '#f59e0b' : 'inherit' }}>
                        {s.productsCount}
                      </td>
                      <td style={{ padding: '14px 10px', fontWeight: 600 }}>
                        {s.ordersCount}
                      </td>
                      <td style={{ padding: '14px 10px' }}>
                        <span style={{ 
                          padding: '3px 8px', 
                          borderRadius: 6, 
                          fontSize: '0.6875rem', 
                          fontWeight: 700, 
                          background: s.plan === 'PRO' ? (isProExpired ? '#ef444420' : '#10b98120') : '#64748b20', 
                          color: s.plan === 'PRO' ? (isProExpired ? '#ef4444' : '#10b981') : '#94a3b8',
                          border: s.plan === 'PRO' ? `1px solid ${isProExpired ? '#ef444430' : '#10b98130'}` : '1px solid #64748b30'
                        }}>
                          {s.plan === 'PRO' ? (isProExpired ? 'EXPIRED' : 'PRO') : 'FREE'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 10px', color: isProExpired ? '#ef4444' : '#94a3b8' }}>
                        {s.subscriptionEnd ? new Date(s.subscriptionEnd).toLocaleDateString('fr-FR') : '—'}
                      </td>
                    </tr>
                  );
                })}

                {filteredStores.length === 0 && (
                  <tr>
                    <td colSpan="7" style={{ padding: '40px 10px', textAlign: 'center', color: '#64748b' }}>
                      Aucune boutique ne correspond aux filtres.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
