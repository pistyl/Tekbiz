'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLanguage } from '@/lib/i18n';
import { getSession, logout } from '@/lib/auth';
import { IconCamera, IconStore, IconGlobe, IconEye, IconLogOut, IconCheck, IconCheckCircle } from '@/lib/icons';

function StoreSettings() {
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const planStatus = searchParams?.get('plan');

  const [session, setSession] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [upgrading, setUpgrading] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);

  const [form, setForm] = useState({
    name: '', slug: '', description: '', phone: '', address: '', category: '', logo: '', banner: ''
  });

  useEffect(() => {
    if (planStatus === 'success') {
      setShowSuccessAlert(true);
      router.replace('/dashboard/store');
    }
  }, [planStatus, router]);

  useEffect(() => {
    const s = getSession();
    if (s?.store) {
      setSession(s);
      
      // Fetch fresh shop information to make sure the plan status is correct
      fetch(`/api/shop/${s.store.slug}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.store) {
            const updated = { ...s, store: data.store };
            localStorage.setItem('tekbiz_session', JSON.stringify(updated));
            setSession(updated);
            setForm(p => ({
              ...p,
              logo: data.store.logo || '',
              banner: data.store.banner || '',
              name: data.store.name || '',
              slug: data.store.slug || '',
              description: data.store.description || '',
              phone: data.store.phone || s.phone || '',
              address: data.store.address || '',
              category: data.store.category || '',
            }));
          }
        })
        .catch(err => console.error(err));

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

  const compressImage = (file, maxWidth, maxHeight, quality) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob((blob) => {
            if (blob) {
              resolve(new File([blob], file.name, { type: 'image/jpeg' }));
            } else {
              resolve(file);
            }
          }, 'image/jpeg', quality);
        };
        img.onerror = () => resolve(file);
      };
      reader.onerror = () => resolve(file);
    });
  };

  const handleStoreFileUpload = async (e, type) => {
    let file = e.target.files[0];
    if (!file) return;

    if (type === 'logo') setUploadingLogo(true);
    if (type === 'banner') setUploadingBanner(true);

    try {
      if (type === 'logo') {
        file = await compressImage(file, 200, 200, 0.85);
      } else if (type === 'banner') {
        file = await compressImage(file, 1200, 400, 0.75);
      }

      const formData = new FormData();
      formData.append('file', file);

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

  const handleUpgrade = async () => {
    if (!session?.store?.id) return;
    setUpgrading(true);
    try {
      const res = await fetch('/api/payments/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeId: session.store.id,
          customerName: session.name,
          customerPhone: form.phone
        })
      });
      const result = await res.json();
      if (result.success && result.redirectUrl) {
        window.location.href = result.redirectUrl;
      } else {
        alert(result.error || 'Erreur lors de l\'initiation de l\'abonnement');
      }
    } catch (err) {
      console.error(err);
      alert('Une erreur réseau est survenue');
    } finally {
      setUpgrading(false);
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

        {/* Plan & Facturation */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 20 }}>
          <h4 style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>Plan & Facturation</h4>
          
          {session?.store?.plan === 'PRO' ? (
            <div style={{ background: '#D1FAE5', border: '1px solid #10B981', borderRadius: 'var(--radius-md)', padding: 14, display: 'flex', alignItems: 'center', gap: 10, color: '#065F46' }}>
              <IconCheck size={20} />
              <div>
                <div style={{ fontWeight: 750, fontSize: '0.875rem' }}>Plan Actuel : PRO</div>
                <div style={{ fontSize: '0.75rem', opacity: 0.85 }}>Toutes les fonctionnalités SaaS sont débloquées.</div>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Plan Actuel :</span>
                <span className="badge badge-warning" style={{ fontSize: '0.75rem', fontWeight: 700 }}>GRATUIT</span>
              </div>

              {/* Upgrade Pricing Box matching user screenshot */}
              <div style={{ 
                border: '2px solid var(--primary)', 
                borderRadius: 'var(--radius-lg)', 
                padding: '24px 16px', 
                background: 'var(--surface)', 
                position: 'relative',
                boxShadow: 'var(--shadow-md)'
              }}>
                <div style={{ 
                  position: 'absolute', 
                  top: -12, 
                  right: 16, 
                  background: 'var(--gradient-primary)', 
                  color: 'white', 
                  padding: '4px 14px', 
                  borderRadius: '20px', 
                  fontSize: '0.6875rem', 
                  fontWeight: 700, 
                  textTransform: 'uppercase' 
                }}>
                  Populaire
                </div>

                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: 4 }}>Pro</h3>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 16 }}>
                  <span style={{ fontSize: '1.75rem', fontWeight: 900, fontFamily: 'var(--font-display)' }}>5 000</span>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>FCFA/mois</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                  {[
                    'Produits illimités',
                    'Paiements Wave & OM',
                    'Gestion des commandes',
                    'Domaine personnalisé',
                    'Statistiques avancées',
                    'Support prioritaire',
                    '0% de commission'
                  ].map((feat, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                      <IconCheck size={14} color="var(--success)" /> {feat}
                    </div>
                  ))}
                </div>

                <button 
                  type="button" 
                  onClick={handleUpgrade}
                  disabled={upgrading}
                  className="btn btn-primary btn-full btn-lg" 
                  style={{ fontWeight: 700 }}
                >
                  {upgrading ? 'Initiation du paiement...' : 'Passer au Pro'}
                </button>
              </div>
            </div>
          )}
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

      {/* Subscription Activation Success Alert */}
      {showSuccessAlert && (
        <>
          <div className="modal-overlay" onClick={() => setShowSuccessAlert(false)} />
          <div className="bottom-sheet" style={{ textAlign: 'center', zIndex: 60 }}>
            <div className="bottom-sheet-handle" />
            <div style={{ marginBottom: 12, color: 'var(--success)', display: 'flex', justifyContent: 'center' }}>
              <IconCheckCircle size={64} />
            </div>
            <h3 style={{ marginBottom: 8 }}>Abonnement Pro activé !</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 20 }}>
              Félicitations ! Vous profitez désormais de toutes les fonctionnalités illimitées du plan Pro.
            </p>
            <button onClick={() => setShowSuccessAlert(false)} className="btn btn-primary btn-full">
              C'est parti !
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default function StorePage() {
  return (
    <Suspense fallback={<div style={{ padding: 16, color: 'var(--text-tertiary)' }}>Chargement...</div>}>
      <StoreSettings />
    </Suspense>
  );
}
