'use client';
import { useState, useEffect } from 'react';

function formatCFA(n) { return new Intl.NumberFormat('fr-FR').format(n); }

export default function AdminDashboard() {
  const [passcode, setPasscode] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [stores, setStores] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPlan, setFilterPlan] = useState('ALL'); // 'ALL', 'FREE', 'PRO'

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
    setStores([]);
    setPasscode('');
  };

  // Filtrage des boutiques
  const filteredStores = stores.filter(s => {
    const matchesSearch = 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.owner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.owner.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterPlan === 'ALL') return matchesSearch;
    return matchesSearch && s.plan === filterPlan;
  });

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
        {/* Page Title & Revenues */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>Données Analytiques</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: 0 }}>Synthèse de l'activité commerciale globale du SaaS.</p>
          </div>
          <div style={{ background: '#1e293b', border: '1px solid #334155', padding: '12px 20px', borderRadius: 12, minWidth: 200 }}>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 650, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Revenus Abonnements (MRR)</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#10b981', marginTop: 4 }}>
              {stats ? `${formatCFA(stats.subscriptionMRR)} F` : '0 F'}
            </div>
            <div style={{ fontSize: '#94a3b8', fontSize: '0.6875rem', marginTop: 2 }}>Revenu Mensuel Récurrent</div>
          </div>
        </div>

        {/* Global Statistics Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 32 }}>
          <div style={{ background: '#1e293b', border: '1px solid #334155', padding: 20, borderRadius: 12 }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>BOUTIQUES PRO</span>
            <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: 6, color: '#3b82f6' }}>{stats?.proStoresCount || 0}</div>
            <span style={{ fontSize: '0.6875rem', color: '#64748b' }}>Abonnements payants actifs</span>
          </div>
          <div style={{ background: '#1e293b', border: '1px solid #334155', padding: 20, borderRadius: 12 }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>BOUTIQUES GRATUITES</span>
            <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: 6, color: '#94a3b8' }}>{stats?.freeStoresCount || 0}</div>
            <span style={{ fontSize: '0.6875rem', color: '#64748b' }}>Plan gratuit (limité à 5 prod)</span>
          </div>
          <div style={{ background: '#1e293b', border: '1px solid #334155', padding: 20, borderRadius: 12 }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>PRODUITS SAAS</span>
            <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: 6, color: '#06b6d4' }}>{stats?.productsCount || 0}</div>
            <span style={{ fontSize: '0.6875rem', color: '#64748b' }}>Produits créés au total</span>
          </div>
          <div style={{ background: '#1e293b', border: '1px solid #334155', padding: 20, borderRadius: 12 }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>VENTES TOTALES BOUTIQUES</span>
            <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: 6, color: '#10b981' }}>{stats ? `${formatCFA(stats.totalOrdersRevenue)} F` : '0 F'}</div>
            <span style={{ fontSize: '0.6875rem', color: '#64748b' }}>Revenus générés par les marchands</span>
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
