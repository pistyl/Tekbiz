'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/i18n';
import { getSession, logout } from '@/lib/auth';
import { IconCamera, IconStore, IconGlobe, IconEye, IconLogOut } from '@/lib/icons';

export default function StorePage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    name: '', slug: '', description: '', phone: '', address: '', category: ''
  });

  useEffect(() => {
    const s = getSession();
    if (s?.store) {
      setSession(s);
      setForm({
        name: s.store.name || '',
        slug: s.store.slug || '',
        description: s.store.description || '',
        phone: s.store.phone || s.phone || '',
        address: s.store.address || '',
        category: s.store.category || '',
      });
    }
  }, []);

  const update = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = (e) => {
    e.preventDefault();
    setSaving(true);
    // Update session in localStorage
    if (session) {
      const updatedSession = {
        ...session,
        store: { ...session.store, ...form }
      };
      localStorage.setItem('tekbiz_session', JSON.stringify(updatedSession));

      // Also update in users list
      try {
        const users = JSON.parse(localStorage.getItem('tekbiz_users') || '[]');
        const idx = users.findIndex(u => u.id === session.userId);
        if (idx >= 0) {
          users[idx].store = { ...users[idx].store, ...form };
          localStorage.setItem('tekbiz_users', JSON.stringify(users));
        }
      } catch {}
    }
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }, 500);
  };

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  return (
    <div style={{ padding: 16 }}>
      <h3 style={{ marginBottom: 20 }}>{t('settings')}</h3>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Banner & Logo */}
        <div style={{ width: '100%', height: 120, background: 'var(--gradient-primary)', borderRadius: 'var(--radius-lg)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ color: 'white', fontSize: '0.8125rem', fontWeight: 500, opacity: 0.8, display: 'flex', alignItems: 'center', gap: 6 }}>
            <IconCamera size={16} color="white" /> Bannière
          </span>
          <div style={{ position: 'absolute', bottom: -24, left: 16, width: 56, height: 56, borderRadius: 'var(--radius-lg)', background: 'var(--surface)', border: '3px solid var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-md)', color: 'var(--primary)' }}>
            <IconStore size={24} />
          </div>
        </div>

        <div style={{ marginTop: 16 }} />

        <div className="input-group">
          <label>{t('storeName')}</label>
          <input className="input" value={form.name} onChange={e => update('name', e.target.value)} />
        </div>

        <div className="input-group">
          <label>URL</label>
          <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--border)', overflow: 'hidden' }}>
            <span style={{ padding: '10px 12px', fontSize: '0.875rem', color: 'var(--text-tertiary)', borderRight: '1px solid var(--border)', whiteSpace: 'nowrap', background: 'var(--bg-tertiary)' }}>tekbiz.sn/</span>
            <input style={{ flex: 1, border: 'none', outline: 'none', padding: '10px 12px', fontSize: '0.875rem', background: 'transparent' }} value={form.slug} onChange={e => update('slug', e.target.value)} />
          </div>
        </div>

        <div className="input-group">
          <label>{t('productDescription')}</label>
          <textarea className="input" rows={3} value={form.description} onChange={e => update('description', e.target.value)} style={{ resize: 'vertical' }} />
        </div>

        <div className="input-group">
          <label>{t('phone')}</label>
          <input className="input" value={form.phone} onChange={e => update('phone', e.target.value)} />
        </div>

        <div className="input-group">
          <label>{t('deliveryAddress')}</label>
          <input className="input" value={form.address} onChange={e => update('address', e.target.value)} />
        </div>

        {/* Language Toggle */}
        <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 600 }}>{t('language')}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Français / Wolof</div>
          </div>
          <button type="button" className="btn btn-ghost btn-sm" style={{ fontWeight: 600, color: 'var(--primary)', gap: 6 }}>
            <IconGlobe size={14} /> {t('french')}
          </button>
        </div>

        {/* Save Button */}
        <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={saving}>
          {saving ? t('loading') : saved ? '✓ Enregistré !' : t('save')}
        </button>

        {/* Store Link */}
        {form.slug && (
          <a href={`/shop/${form.slug}`} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-full" style={{ textAlign: 'center', gap: 6 }}>
            <IconEye size={16} /> Voir ma boutique — {form.slug}.tekbiz.sn
          </a>
        )}

        {/* Logout */}
        <button type="button" className="btn btn-ghost btn-full" style={{ color: 'var(--danger)', marginTop: 8, gap: 6 }} onClick={handleLogout}>
          <IconLogOut size={16} /> Déconnexion
        </button>
      </form>
    </div>
  );
}
