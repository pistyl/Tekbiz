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
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [form, setForm] = useState({
    name: '', slug: '', description: '', phone: '', address: '', category: '', logo: '', banner: ''
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
        logo: s.store.logo || '',
        banner: s.store.banner || '',
      });
    }
  }, []);

  const update = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleStoreFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (type === 'logo') setUploadingLogo(true);
    if (type === 'banner') setUploadingBanner(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const result = await res.json();
      if (result.success) {
        update(type, result.url);
      } else {
        alert(result.error || 'Erreur lors de l\'upload');
      }
    } catch (err) {
      console.error(err);
      alert('Erreur réseau lors de l\'upload');
    } finally {
      if (type === 'logo') setUploadingLogo(false);
      if (type === 'banner') setUploadingBanner(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    if (session?.store?.id) {
      try {
        const res = await fetch('/api/store', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            storeId: session.store.id,
            ...form
          })
        });
        const result = await res.json();
        if (result.success) {
          const updatedSession = {
            ...session,
            store: result.store
          };
          localStorage.setItem('tekbiz_session', JSON.stringify(updatedSession));
          setSession(updatedSession);
          setSaved(true);
        } else {
          alert(result.error || 'Erreur lors de la sauvegarde');
        }
      } catch (err) {
        console.error(err);
        alert('Une erreur réseau est survenue');
      }
    }
    setSaving(false);
    setTimeout(() => setSaved(false), 2000);
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
        <input 
          type="file" 
          accept="image/*" 
          id="banner-file-upload" 
          onChange={(e) => handleStoreFileUpload(e, 'banner')} 
          style={{ opacity: 0, position: 'absolute', zIndex: -1, width: 0, height: 0 }} 
        />
        <input 
          type="file" 
          accept="image/*" 
          id="logo-file-upload" 
          onChange={(e) => handleStoreFileUpload(e, 'logo')} 
          style={{ opacity: 0, position: 'absolute', zIndex: -1, width: 0, height: 0 }} 
        />

        <div 
          style={{ 
            width: '100%', 
            height: 120, 
            background: form.banner ? `url(${form.banner}) center/cover no-repeat` : 'var(--gradient-primary)', 
            borderRadius: 'var(--radius-lg)', 
            position: 'relative', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            overflow: 'visible'
          }}
        >
          <label 
            htmlFor="banner-file-upload" 
            style={{ 
              color: 'white', 
              fontSize: '0.8125rem', 
              fontWeight: 500, 
              opacity: 0.9, 
              display: 'flex', 
              alignItems: 'center', 
              gap: 6,
              background: 'rgba(0, 0, 0, 0.4)',
              padding: '6px 12px',
              borderRadius: 'var(--radius-full)',
              cursor: 'pointer'
            }}
          >
            <IconCamera size={16} color="white" /> {uploadingBanner ? 'Upload en cours...' : 'Modifier la bannière'}
          </label>

          <label 
            htmlFor="logo-file-upload"
            style={{ 
              position: 'absolute', 
              bottom: -24, 
              left: 16, 
              width: 56, 
              height: 56, 
              borderRadius: 'var(--radius-lg)', 
              background: 'var(--surface)', 
              border: '3px solid var(--surface)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              boxShadow: 'var(--shadow-md)', 
              color: 'var(--primary)',
              overflow: 'hidden',
              cursor: 'pointer'
            }}
          >
            {uploadingLogo ? (
              <span style={{ fontSize: '9px', color: 'var(--text-tertiary)' }}>...</span>
            ) : form.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={form.logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <IconStore size={24} />
            )}
          </label>
        </div>

        <div style={{ marginTop: 16 }} />

        <div className="input-group">
          <label>{t('storeName')}</label>
          <input className="input" value={form.name} onChange={e => update('name', e.target.value)} required />
        </div>

        <div className="input-group">
          <label>URL</label>
          <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--border)', overflow: 'hidden' }}>
            <span style={{ padding: '10px 12px', fontSize: '0.875rem', color: 'var(--text-tertiary)', borderRight: '1px solid var(--border)', whiteSpace: 'nowrap', background: 'var(--bg-tertiary)' }}>tekbiz.sn/</span>
            <input style={{ flex: 1, border: 'none', outline: 'none', padding: '10px 12px', fontSize: '0.875rem', background: 'transparent' }} value={form.slug} onChange={e => update('slug', e.target.value)} required />
          </div>
        </div>

        <div className="input-group">
          <label>{t('productDescription')}</label>
          <textarea className="input" rows={3} value={form.description} onChange={e => update('description', e.target.value)} style={{ resize: 'vertical' }} />
        </div>

        <div className="input-group">
          <label>{t('phone')}</label>
          <input className="input" value={form.phone} onChange={e => update('phone', e.target.value)} required />
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
