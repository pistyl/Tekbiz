'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LanguageProvider, useLanguage } from '@/lib/i18n';
import { getSession, logout } from '@/lib/auth';

function DashboardShell({ children }) {
  const { t, lang, toggleLang } = useLanguage();
  const pathname = usePathname();
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const s = getSession();
    let interval;
    if (!s) {
      router.replace('/login');
    } else {
      setSession(s);
      setLoading(false);

      if (s.store?.id) {
        let lastOrderIds = new Set();
        let isInitial = true;

        const playSound = () => {
          try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const playTone = (freq, type, duration, delay) => {
              const osc = audioCtx.createOscillator();
              const gain = audioCtx.createGain();
              osc.type = type;
              osc.frequency.setValueAtTime(freq, audioCtx.currentTime + delay);
              gain.gain.setValueAtTime(0.08, audioCtx.currentTime + delay);
              gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + delay + duration);
              osc.connect(gain);
              gain.connect(audioCtx.destination);
              osc.start(audioCtx.currentTime + delay);
              osc.stop(audioCtx.currentTime + delay + duration);
            };

            // Electronic cash-register chaching sound
            playTone(987.77, 'sine', 0.08, 0); // B5 note
            playTone(1318.51, 'sine', 0.22, 0.06); // E6 note
          } catch (e) {
            console.error('Audio play error:', e);
          }
        };

        const checkNewOrders = async () => {
          try {
            const res = await fetch(`/api/orders?storeId=${s.store.id}`);
            const result = await res.json();
            if (result.success && result.orders) {
              const currentOrders = result.orders;
              const currentIds = new Set(currentOrders.map(o => o.id));

              if (!isInitial) {
                const newOrders = currentOrders.filter(o => !lastOrderIds.has(o.id));
                if (newOrders.length > 0) {
                  newOrders.forEach(order => {
                    playSound();
                    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
                      new Notification('Nouvelle commande ! 🎉', {
                        body: `${order.customerName} a commandé pour ${new Intl.NumberFormat('fr-FR').format(order.totalAmount)} FCFA.`,
                        icon: '/favicon.png'
                      });
                    }
                  });
                }
              }

              lastOrderIds = currentIds;
              isInitial = false;
            }
          } catch (err) {
            console.error('Failed to check new orders:', err);
          }
        };

        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
          Notification.requestPermission();
        }

        checkNewOrders();
        interval = setInterval(checkNewOrders, 10000);
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [router]);

  useEffect(() => {
    const handleUpdate = () => {
      const s = getSession();
      if (s) setSession(s);
    };
    window.addEventListener('tekbiz-session-update', handleUpdate);
    return () => {
      window.removeEventListener('tekbiz-session-update', handleUpdate);
    };
  }, []);

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  const navItems = [
    { href: '/dashboard', label: t('home'), icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
    )},
    { href: '/dashboard/products', label: t('products'), icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
    )},
    { href: '/dashboard/orders', label: t('orders'), icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
    )},
    { href: '/dashboard/payments', label: t('payments'), icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
    )},
    { href: '/dashboard/marketplace', label: t('marketplace'), icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
    )},
    { href: '/dashboard/store', label: t('profile'), icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
    )},
  ];

  const isActive = (href) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-secondary)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.5rem', marginBottom: 12 }}>
            <span style={{ background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>TEKBIZ</span>
          </div>
          <div style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>{t('loading')}</div>
        </div>
      </div>
    );
  }

  const storeName = session?.store?.name || 'Ma Boutique';
  const storeSlug = session?.store?.slug || 'ma-boutique';
  const userInitial = session?.name?.charAt(0)?.toUpperCase() || 'T';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-secondary)', paddingBottom: 'calc(var(--bottom-nav-height) + 16px)' }}>
      {/* Top Header */}
      <header style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: 'env(safe-area-inset-top, 0px) 16px 0', height: 'calc(56px + env(safe-area-inset-top, 0px))', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {session?.store?.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img 
              src={session.store.logo} 
              alt="Logo boutique" 
              style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', objectFit: 'cover', border: '1px solid var(--border)' }} 
            />
          ) : (
            <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '0.875rem' }}>
              {userInitial}
            </div>
          )}
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.9375rem', lineHeight: 1.2 }}>{storeName}</div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)' }}>{storeSlug}.tekbiz.sn</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          <button onClick={toggleLang} className="btn btn-ghost btn-icon" title={t('language')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
          </button>
          <button className="btn btn-ghost btn-icon" style={{ position: 'relative' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            <span style={{ position: 'absolute', top: 6, right: 6, width: 8, height: 8, background: 'var(--danger)', borderRadius: '50%', border: '2px solid var(--surface)' }} />
          </button>
          <button onClick={handleLogout} className="btn btn-ghost btn-icon" title="Déconnexion">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          </button>
        </div>
      </header>

      {/* Page Content — pass session via data attribute for child pages */}
      <main className="page-enter" data-session={JSON.stringify(session)}>{children}</main>

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        {navItems.map(item => (
          <Link key={item.href} href={item.href} className={`bottom-nav-item ${isActive(item.href) ? 'active' : ''}`}>
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}

export default function DashboardLayout({ children }) {
  return (
    <LanguageProvider>
      <DashboardShell>{children}</DashboardShell>
    </LanguageProvider>
  );
}
