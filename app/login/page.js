'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LanguageProvider, useLanguage } from '@/lib/i18n';
import { login, isLoggedIn } from '@/lib/auth';
import { IconWarning, IconEye, IconEyeOff } from '@/lib/icons';

function LoginForm() {
  const { t } = useLanguage();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isLoggedIn()) router.replace('/dashboard');
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);

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
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link href="/" style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '2rem' }}>
            <span style={{ background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>TEKBIZ</span>
          </Link>
          <h2 style={{ marginTop: 16, fontSize: '1.5rem' }}>{t('loginTitle')}</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: 4 }}>{t('loginSubtitle')}</p>
        </div>

        {/* Error message */}
        {error && (
          <div style={{ background: 'var(--danger-bg)', color: 'var(--danger)', padding: '10px 14px', borderRadius: 'var(--radius-md)', fontSize: '0.8125rem', fontWeight: 500, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <IconWarning size={16} /> {error}
          </div>
        )}

        {/* Form */}
        <div className="card" style={{ padding: 24 }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="input-group">
              <label htmlFor="login-email">{t('email')}</label>
              <input id="login-email" type="email" className="input" placeholder="nom@exemple.com" value={email} onChange={e => { setError(''); setEmail(e.target.value); }} required />
            </div>
            <div className="input-group">
              <label htmlFor="login-password">{t('password')}</label>
              <div style={{ position: 'relative' }}>
                <input id="login-password" type={showPw ? 'text' : 'password'} className="input" placeholder="••••••••" value={password} onChange={e => { setError(''); setPassword(e.target.value); }} required style={{ paddingRight: 48 }} />
                <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center' }}>
                  {showPw ? <IconEyeOff size={18} /> : <IconEye size={18} />}
                </button>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <Link href="#" style={{ fontSize: '0.8125rem', color: 'var(--primary)', fontWeight: 500 }}>{t('forgotPassword')}</Link>
            </div>
            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
              {loading ? t('loading') : t('login')}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          {t('noAccount')} <Link href="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>{t('register')}</Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return <LanguageProvider><LoginForm /></LanguageProvider>;
}
