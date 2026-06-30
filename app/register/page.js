'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LanguageProvider, useLanguage } from '@/lib/i18n';
import { register, isLoggedIn } from '@/lib/auth';
import { IconWarning, IconLink } from '@/lib/icons';

const categories = [
  'Mode & Vêtements', 'Électronique', 'Alimentation', 'Beauté & Cosmétiques',
  'Maison & Déco', 'Sport', 'Bijoux & Accessoires', 'Services', 'Autre'
];

function RegisterForm() {
  const { t } = useLanguage();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '', storeName: '', storeCategory: '' });

  useEffect(() => {
    if (isLoggedIn()) router.replace('/dashboard');
  }, [router]);
  const update = (key, val) => { setError(''); setForm(prev => ({ ...prev, [key]: val })); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (step === 1) {
      if (form.password.length < 6) {
        setError('Le mot de passe doit contenir au moins 6 caractères');
        return;
      }
      setStep(2);
      return;
    }

    setLoading(true);
    const result = register({
      name: form.name,
      email: form.email,
      phone: form.phone,
      password: form.password,
      storeName: form.storeName,
      storeCategory: form.storeCategory,
    });

    if (result.success) {
      router.push('/dashboard');
    } else {
      setError(result.error);
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-secondary)', padding: 16 }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link href="/" style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '2rem' }}>
            <span style={{ background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>TEKBIZ</span>
          </Link>
          <h2 style={{ marginTop: 16, fontSize: '1.5rem' }}>{t('registerTitle')}</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: 4 }}>{t('registerSubtitle')}</p>
        </div>

        {/* Steps indicator */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          {[1, 2].map(s => (
            <div key={s} style={{ flex: 1, height: 4, borderRadius: 'var(--radius-full)', background: s <= step ? 'var(--primary)' : 'var(--border)', transition: 'background 0.3s' }} />
          ))}
        </div>

        {/* Error message */}
        {error && (
          <div style={{ background: 'var(--danger-bg)', color: 'var(--danger)', padding: '10px 14px', borderRadius: 'var(--radius-md)', fontSize: '0.8125rem', fontWeight: 500, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <IconWarning size={16} /> {error}
          </div>
        )}

        <div className="card" style={{ padding: 24 }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {step === 1 ? (
              <>
                <div className="input-group">
                  <label htmlFor="reg-name">{t('fullName')}</label>
                  <input id="reg-name" className="input" placeholder="Moussa Diop" value={form.name} onChange={e => update('name', e.target.value)} required />
                </div>
                <div className="input-group">
                  <label htmlFor="reg-email">{t('email')}</label>
                  <input id="reg-email" type="email" className="input" placeholder="nom@exemple.com" value={form.email} onChange={e => update('email', e.target.value)} required />
                </div>
                <div className="input-group">
                  <label htmlFor="reg-phone">{t('phone')}</label>
                  <input id="reg-phone" type="tel" className="input" placeholder="+221 77 123 45 67" value={form.phone} onChange={e => update('phone', e.target.value)} required />
                </div>
                <div className="input-group">
                  <label htmlFor="reg-pw">{t('password')}</label>
                  <input id="reg-pw" type="password" className="input" placeholder="••••••••" value={form.password} onChange={e => update('password', e.target.value)} required minLength={6} />
                </div>
                <button type="submit" className="btn btn-primary btn-full btn-lg">{t('next')} →</button>
              </>
            ) : (
              <>
                <div className="input-group">
                  <label htmlFor="reg-store">{t('storeName')}</label>
                  <input id="reg-store" className="input" placeholder="Ma Super Boutique" value={form.storeName} onChange={e => update('storeName', e.target.value)} required />
                </div>
                <div className="input-group">
                  <label htmlFor="reg-cat">{t('storeCategory')}</label>
                  <select id="reg-cat" className="input" value={form.storeCategory} onChange={e => update('storeCategory', e.target.value)} required>
                    <option value="">— Choisir —</option>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', padding: 16, fontSize: '0.875rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  <IconLink size={16} style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    Votre boutique sera accessible à :<br />
                    <strong style={{ color: 'var(--primary)' }}>{form.storeName ? form.storeName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') : 'ma-boutique'}.tekbiz.sn</strong>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setStep(1)} style={{ flex: 1 }}>← {t('back')}</button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={loading}>
                    {loading ? t('loading') : t('createAccount')}
                  </button>
                </div>
              </>
            )}
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          {t('hasAccount')} <Link href="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>{t('login')}</Link>
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return <LanguageProvider><RegisterForm /></LanguageProvider>;
}
