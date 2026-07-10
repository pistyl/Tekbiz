'use client';
import { useState } from 'react';
import Link from 'next/link';
import { LanguageProvider, useLanguage } from '@/lib/i18n';
import { IconRocket, IconZap, IconWallet, IconChart, IconEdit, IconCamera, IconParty, IconHome, IconPackage, IconClipboard, IconDollar, IconUser, IconCheck } from '@/lib/icons';

function LangToggle() {
  const { lang, toggleLang, t } = useLanguage();
  return (
    <button onClick={toggleLang} className="btn btn-ghost btn-sm" style={{ gap: 6 }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
      {lang === 'fr' ? 'Wolof' : 'Français'}
    </button>
  );
}

function Navbar() {
  const { t } = useLanguage();
  return (
    <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(16px)', borderBottom: '1px solid var(--border-light)', paddingTop: 'env(safe-area-inset-top, 0px)' }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
        <Link href="/" style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>TEKBIZ</span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <LangToggle />
          <Link href="/login" className="btn btn-ghost btn-sm">{t('login')}</Link>
          <Link href="/register" className="btn btn-primary btn-sm">{t('register')}</Link>
        </div>
      </div>
    </nav>
  );
}

function HeroSection() {
  const { t } = useLanguage();
  return (
    <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', background: 'var(--gradient-hero)', color: 'white', paddingTop: 80, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '20%', right: '-10%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(249,115,22,0.15) 0%, transparent 70%)', borderRadius: '50%' }} />
      <div style={{ position: 'absolute', bottom: '10%', left: '-5%', width: 300, height: 300, background: 'radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 70%)', borderRadius: '50%' }} />
      <div className="container" style={{ textAlign: 'center', position: 'relative', zIndex: 1, padding: '40px 16px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.3)', borderRadius: 'var(--radius-full)', padding: '6px 16px', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--primary-light)', marginBottom: 24 }}>
          <IconRocket size={14} color="var(--primary-light)" /> La plateforme #1 au Sénégal
        </div>
        <h1 style={{ fontSize: 'clamp(2rem, 6vw, 4rem)', maxWidth: 700, margin: '0 auto 20px', lineHeight: 1.1, fontWeight: 900 }}>
          {t('heroTitle')}
        </h1>
        <p style={{ fontSize: 'clamp(1rem, 2.5vw, 1.25rem)', maxWidth: 560, margin: '0 auto 36px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>
          {t('heroSubtitle')}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
          <Link href="/register" className="btn btn-primary btn-lg" style={{ fontSize: '1.0625rem', minWidth: 280 }}>
            {t('getStarted')}
          </Link>
          <Link href="#demo" className="btn btn-ghost" style={{ color: 'rgba(255,255,255,0.6)' }}>
            {t('seeDemo')} →
          </Link>
        </div>

        {/* Phone Mockup */}
        <div style={{ marginTop: 48, display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: 260, height: 420, background: 'linear-gradient(180deg, #1E293B 0%, #0F172A 100%)', borderRadius: 32, border: '3px solid rgba(255,255,255,0.1)', padding: 12, boxShadow: '0 24px 80px rgba(0,0,0,0.4)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ width: '100%', height: '100%', borderRadius: 22, background: 'linear-gradient(180deg, #fff 0%, #f8fafc 100%)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              {/* Status bar */}
              <div style={{ height: 28, background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: 'white', letterSpacing: 1 }}>TEKBIZ</div>
              {/* Mock stats */}
              <div style={{ padding: '12px 10px', display: 'flex', gap: 6 }}>
                {[{ v: '125K', l: 'Ventes', c: '#10B981' }, { v: '24', l: 'Commandes', c: '#F97316' }, { v: '89', l: 'Produits', c: '#3B82F6' }].map((s, i) => (
                  <div key={i} style={{ flex: 1, background: '#f8fafc', borderRadius: 10, padding: '8px 6px', textAlign: 'center', borderTop: `2px solid ${s.c}` }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>{s.v}</div>
                    <div style={{ fontSize: 7, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>{s.l}</div>
                  </div>
                ))}
              </div>
              {/* Mock products */}
              <div style={{ padding: '4px 10px', fontSize: 9, fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: 0.5 }}>Produits</div>
              <div style={{ padding: '0 10px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, flex: 1 }}>
                {[{ bg: '#FEF3C7' }, { bg: '#DBEAFE' }, { bg: '#D1FAE5' }, { bg: '#FCE7F3' }].map((p, i) => (
                  <div key={i} style={{ borderRadius: 8, overflow: 'hidden', background: '#fff', border: '1px solid #e2e8f0' }}>
                    <div style={{ height: 54, background: p.bg }} />
                    <div style={{ padding: '4px 6px' }}>
                      <div style={{ height: 6, background: '#e2e8f0', borderRadius: 3, marginBottom: 3, width: '80%' }} />
                      <div style={{ height: 8, background: '#F97316', borderRadius: 3, width: '50%', opacity: 0.2 }} />
                    </div>
                  </div>
                ))}
              </div>
              {/* Mock bottom nav with icons */}
              <div style={{ height: 36, borderTop: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '0 8px' }}>
                <IconHome size={12} color="#F97316" />
                <IconPackage size={12} color="#94a3b8" />
                <IconClipboard size={12} color="#94a3b8" />
                <IconDollar size={12} color="#94a3b8" />
                <IconUser size={12} color="#94a3b8" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const { t } = useLanguage();
  const features = [
    { icon: <IconZap size={28} />, title: t('feature1Title'), desc: t('feature1Desc'), color: '#F97316' },
    { icon: <IconWallet size={28} />, title: t('feature2Title'), desc: t('feature2Desc'), color: '#10B981' },
    { icon: <IconChart size={28} />, title: t('feature3Title'), desc: t('feature3Desc'), color: '#3B82F6' },
  ];
  return (
    <section style={{ padding: '80px 0', background: 'var(--bg)' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
          {features.map((f, i) => (
            <div key={i} className="card card-interactive" style={{ textAlign: 'center', padding: 32, borderTop: `3px solid ${f.color}` }}>
              <div style={{ width: 64, height: 64, borderRadius: 'var(--radius-lg)', background: `${f.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: f.color, margin: '0 auto 16px' }}>{f.icon}</div>
              <h3 style={{ marginBottom: 8 }}>{f.title}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function StepsSection() {
  const { t } = useLanguage();
  const steps = [
    { num: '01', title: t('step1'), desc: t('step1Desc'), icon: <IconEdit size={24} color="white" /> },
    { num: '02', title: t('step2'), desc: t('step2Desc'), icon: <IconCamera size={24} color="white" /> },
    { num: '03', title: t('step3'), desc: t('step3Desc'), icon: <IconParty size={24} color="white" /> },
  ];
  return (
    <section style={{ padding: '80px 0', background: 'var(--bg-secondary)' }}>
      <div className="container">
        <h2 style={{ textAlign: 'center', marginBottom: 48 }}>{t('howItWorks')}</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32, maxWidth: 500, margin: '0 auto' }}>
          {steps.map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
              <div style={{ width: 56, height: 56, borderRadius: 'var(--radius-lg)', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: 'var(--shadow-float)' }}>
                {s.icon}
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Étape {s.num}</div>
                <h4 style={{ marginBottom: 4 }}>{s.title}</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingSection() {
  const { t } = useLanguage();
  return (
    <section style={{ padding: '80px 0', background: 'var(--bg)' }}>
      <div className="container">
        <h2 style={{ textAlign: 'center', marginBottom: 8 }}>{t('pricingTitle')}</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: 48 }}>{t('pricingSubtitle')}</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, maxWidth: 680, margin: '0 auto' }}>
          {/* Free */}
          <div className="card" style={{ padding: 32 }}>
            <h4 style={{ marginBottom: 4 }}>{t('freePlan')}</h4>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 900, marginBottom: 20 }}>0 <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-tertiary)' }}>FCFA</span></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
              {[t('upTo20Products'), t('mobilePayments'), t('orderManagement')].map((f, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: '0.875rem' }}>
                  <IconCheck size={16} color="var(--success)" /> {f}
                </div>
              ))}
            </div>
            <Link href="/register" className="btn btn-secondary btn-full">{t('startFree')}</Link>
          </div>
          {/* Pro */}
          <div className="card" style={{ padding: 32, border: '2px solid var(--primary)', position: 'relative' }}>
            <div style={{ position: 'absolute', top: -12, right: 20, background: 'var(--gradient-primary)', color: 'white', padding: '4px 14px', borderRadius: 'var(--radius-full)', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase' }}>{t('popular')}</div>
            <h4 style={{ marginBottom: 4 }}>{t('proPlan')}</h4>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 900, marginBottom: 20 }}>5 000 <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-tertiary)' }}>FCFA{t('perMonth')}</span></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
              {[t('unlimitedProducts'), t('mobilePayments'), t('orderManagement'), t('customDomain'), t('analytics'), t('prioritySupport'), t('noCommission')].map((f, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: '0.875rem' }}>
                  <IconCheck size={16} color="var(--success)" /> {f}
                </div>
              ))}
            </div>
            <Link href="/register" className="btn btn-primary btn-full">{t('goPro')}</Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const { t } = useLanguage();
  return (
    <footer style={{ padding: '40px 0', background: 'var(--secondary)', color: 'rgba(255,255,255,0.5)', textAlign: 'center', fontSize: '0.875rem' }}>
      <div className="container">
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.25rem', marginBottom: 16 }}>
          <span style={{ background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>TEKBIZ</span>
        </div>
        <p>{t('footer')}</p>
      </div>
    </footer>
  );
}

function LandingContent() {
  return (
    <>
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <StepsSection />
      <PricingSection />
      <Footer />
    </>
  );
}

export default function Home() {
  return (
    <LanguageProvider>
      <LandingContent />
    </LanguageProvider>
  );
}
