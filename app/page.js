'use client';
import Link from 'next/link';
import { LanguageProvider, useLanguage } from '@/lib/i18n';
import { IconRocket, IconZap, IconWallet, IconChart, IconEdit, IconCamera, IconParty, IconHome, IconPackage, IconClipboard, IconDollar, IconUser, IconCheck } from '@/lib/icons';

function LangToggle() {
  const { lang, toggleLang } = useLanguage();
  return (
    <button 
      onClick={toggleLang} 
      style={{
        background: 'rgba(255, 255, 255, 0.08)',
        border: 'none',
        borderRadius: '20px',
        padding: '6px 14px',
        color: '#94A3B8',
        fontSize: '0.75rem',
        fontWeight: 700,
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        cursor: 'pointer',
        fontFamily: 'var(--font-sans)',
        transition: 'all 0.2s ease'
      }}
    >
      <span style={{ color: lang === 'fr' ? '#fff' : 'rgba(255,255,255,0.4)', transition: 'color 0.2s' }}>FR</span>
      <span style={{ color: 'rgba(255, 255, 255, 0.15)' }}>|</span>
      <span style={{ color: lang === 'wo' ? '#fff' : 'rgba(255,255,255,0.4)', transition: 'color 0.2s' }}>WO</span>
    </button>
  );
}

function Navbar() {
  const { t } = useLanguage();
  return (
    <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, background: 'rgba(9, 15, 28, 0.8)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: 'env(safe-area-inset-top, 0px)' }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64, padding: '0 16px' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{
            width: 38,
            height: 38,
            borderRadius: '10px',
            background: '#090F1C',
            border: '1.5px solid rgba(16, 185, 129, 0.25)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            gap: 1
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="url(#bag-grad-nav)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <defs>
                <linearGradient id="bag-grad-nav" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#F97316" />
                  <stop offset="100%" stopColor="#F59E0B" />
                </linearGradient>
              </defs>
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            <span style={{ fontSize: '6px', fontWeight: 900, color: '#22D3EE', letterSpacing: '0.5px', lineHeight: 1 }}>TEKBIZ</span>
          </div>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <LangToggle />
          <Link href="/login" style={{
            background: 'var(--gradient-primary)',
            border: 'none',
            borderRadius: '20px',
            padding: '8px 18px',
            color: '#fff',
            fontSize: '0.8125rem',
            fontWeight: 600,
            textDecoration: 'none',
            boxShadow: '0 2px 8px rgba(249, 115, 22, 0.25)',
            display: 'inline-flex',
            alignItems: 'center',
            fontFamily: 'var(--font-sans)'
          }}>
            {t('commencer')}
          </Link>
        </div>
      </div>
    </nav>
  );
}

function HeroSection() {
  const { t } = useLanguage();
  const titleParts = t('heroTitle').split(',');
  const firstPart = titleParts[0] ? titleParts[0] + ',' : '';
  const secondPart = titleParts[1] ? titleParts[1].trim() : '';

  return (
    <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', background: '#030712', color: 'white', paddingTop: 110, paddingBottom: 60, position: 'relative', overflow: 'hidden' }}>
      <style dangerouslySetInnerHTML={{ __html: `
        .hero-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 40px;
          align-items: center;
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
        }
        .hero-text-col {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }
        .hero-buttons {
          display: flex;
          flex-direction: column;
          gap: 14px;
          align-items: center;
          width: 100%;
          max-width: 340px;
          margin: 0 auto 24px;
        }
        .hero-social-proof {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-bottom: 40px;
        }
        .hero-image-col {
          display: flex;
          justify-content: center;
          position: relative;
          width: 100%;
          max-width: 340px;
          margin: 0 auto;
          z-index: 1;
        }
        @media (min-width: 992px) {
          .hero-grid {
            grid-template-columns: 1.2fr 1fr;
            gap: 60px;
            text-align: left;
          }
          .hero-text-col {
            align-items: flex-start;
            text-align: left;
          }
          .hero-buttons {
            flex-direction: row;
            max-width: none;
            margin: 0 0 32px 0;
            justify-content: flex-start;
          }
          .hero-buttons a {
            width: auto;
            min-width: 220px;
          }
          .hero-social-proof {
            justify-content: flex-start;
            margin-bottom: 0;
          }
          .hero-image-col {
            max-width: 440px;
          }
        }
      `}} />
      
      {/* Background gradients */}
      <div style={{ position: 'absolute', top: '10%', right: '-10%', width: 450, height: 450, background: 'radial-gradient(circle, rgba(249,115,22,0.08) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '10%', left: '-10%', width: 450, height: 450, background: 'radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
      
      <div className="container" style={{ position: 'relative', zIndex: 1, padding: '0 16px' }}>
        <div className="hero-grid">
          
          <div className="hero-text-col">
            <h1 style={{ fontSize: 'clamp(2.25rem, 6vw, 3.75rem)', fontWeight: 800, fontFamily: 'var(--font-display)', marginBottom: 20, lineHeight: 1.15, letterSpacing: '-0.02em', maxWidth: 700 }}>
              {firstPart}
              {secondPart && <><br /><span style={{ background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{secondPart}</span></>}
            </h1>
            
            <p style={{ fontSize: 'clamp(0.95rem, 2.5vw, 1.0625rem)', maxWidth: 460, marginBottom: 32, color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, fontWeight: 400 }}>
              {t('heroSubtitle')}
            </p>
            
            <div className="hero-buttons">
              <Link href="/register" style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: 52,
                borderRadius: '14px',
                background: 'var(--gradient-primary)',
                color: '#fff',
                fontWeight: 600,
                fontSize: '0.975rem',
                textDecoration: 'none',
                width: '100%',
                boxShadow: '0 4px 14px rgba(249, 115, 22, 0.3)',
                transition: 'transform 0.2s ease, opacity 0.2s ease',
                cursor: 'pointer'
              }}>
                {t('startFree')}
              </Link>
              <Link href="#demo" style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: 52,
                borderRadius: '14px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                color: '#fff',
                fontWeight: 600,
                fontSize: '0.975rem',
                textDecoration: 'none',
                width: '100%',
                transition: 'background 0.2s ease'
              }}>
                {t('seeDemo')}
              </Link>
            </div>

            <div className="hero-social-proof">
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', border: '2px solid #030712', background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)', zIndex: 3 }} />
                <div style={{ width: 30, height: 30, borderRadius: '50%', border: '2px solid #030712', background: 'linear-gradient(135deg, #10B981, #047857)', marginLeft: -10, zIndex: 2 }} />
                <div style={{ width: 30, height: 30, borderRadius: '50%', border: '2px solid #030712', background: 'linear-gradient(135deg, #EC4899, #BE185D)', marginLeft: -10, zIndex: 1 }} />
              </div>
              <span style={{ fontSize: '0.8125rem', color: '#94A3B8', fontWeight: 500 }}>
                {t('socialProof')}
              </span>
            </div>
          </div>

          <div className="hero-image-col">
            {/* Glow shadow */}
            <div style={{
              position: 'absolute',
              width: '320px',
              height: '320px',
              background: 'radial-gradient(circle, rgba(16, 185, 129, 0.22) 0%, transparent 70%)',
              zIndex: 0,
              top: '20%',
              left: '50%',
              transform: 'translate(-50%, -20%)',
              filter: 'blur(35px)'
            }} />
            <img 
              src="/hero_mockup.png" 
              alt="Tekbiz Mobile Dashboard" 
              style={{
                width: '100%',
                height: 'auto',
                position: 'relative',
                zIndex: 1,
                borderRadius: '24px',
                display: 'block'
              }} 
            />
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
    <section style={{ padding: '80px 0', background: '#090F1C', color: 'white' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
          {features.map((f, i) => (
            <div key={i} className="card-interactive" style={{ textAlign: 'center', padding: 32, background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', borderTop: `3px solid ${f.color}`, borderRadius: '16px', color: '#fff', transition: 'all 0.3s ease' }}>
              <div style={{ width: 64, height: 64, borderRadius: '16px', background: `${f.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: f.color, margin: '0 auto 16px' }}>{f.icon}</div>
              <h3 style={{ marginBottom: 8, color: '#fff', fontWeight: 700 }}>{f.title}</h3>
              <p style={{ color: 'rgba(255, 255, 255, 0.65)', fontSize: '0.9375rem', lineHeight: 1.6 }}>{f.desc}</p>
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
    <section style={{ padding: '80px 0', background: '#030712', color: 'white' }}>
      <div className="container">
        <h2 style={{ textAlign: 'center', marginBottom: 48, fontWeight: 800, color: '#fff' }}>{t('howItWorks')}</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32, maxWidth: 500, margin: '0 auto' }}>
          {steps.map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
              <div style={{ width: 56, height: 56, borderRadius: '16px', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: 'var(--shadow-float)' }}>
                {s.icon}
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Étape {s.num}</div>
                <h4 style={{ marginBottom: 4, color: '#fff', fontWeight: 700 }}>{s.title}</h4>
                <p style={{ color: 'rgba(255, 255, 255, 0.65)', fontSize: '0.875rem', lineHeight: 1.5 }}>{s.desc}</p>
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
    <section style={{ padding: '80px 0', background: '#090F1C', color: 'white' }}>
      <div className="container">
        <h2 style={{ textAlign: 'center', marginBottom: 8, fontWeight: 800, color: '#fff' }}>{t('pricingTitle')}</h2>
        <p style={{ textAlign: 'center', color: 'rgba(255, 255, 255, 0.6)', marginBottom: 48 }}>{t('pricingSubtitle')}</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, maxWidth: 680, margin: '0 auto' }}>
          {/* Free */}
          <div style={{ padding: 32, background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '380px' }}>
            <div>
              <h4 style={{ marginBottom: 4, color: '#fff', fontWeight: 700 }}>{t('freePlan')}</h4>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.25rem', fontWeight: 900, marginBottom: 20, color: '#fff' }}>0 <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'rgba(255,255,255,0.4)' }}>FCFA</span></div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                {[t('upTo20Products'), t('mobilePayments'), t('orderManagement')].map((f, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.85)' }}>
                    <IconCheck size={16} color="var(--success)" /> {f}
                  </div>
                ))}
              </div>
            </div>
            <Link href="/register" style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: 46,
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.08)',
              color: '#fff',
              fontWeight: 600,
              fontSize: '0.875rem',
              textDecoration: 'none',
              width: '100%',
              transition: 'background 0.2s'
            }}>{t('startFree')}</Link>
          </div>
          
          {/* Pro */}
          <div style={{ padding: 32, background: 'rgba(255, 255, 255, 0.03)', border: '2px solid var(--primary)', borderRadius: '16px', position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '380px', boxShadow: '0 8px 32px rgba(249, 115, 22, 0.1)' }}>
            <div style={{ position: 'absolute', top: -12, right: 20, background: 'var(--gradient-primary)', color: 'white', padding: '4px 14px', borderRadius: '20px', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase' }}>{t('popular')}</div>
            <div>
              <h4 style={{ marginBottom: 4, color: '#fff', fontWeight: 700 }}>{t('proPlan')}</h4>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.25rem', fontWeight: 900, marginBottom: 20, color: '#fff' }}>5 000 <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'rgba(255,255,255,0.4)' }}>FCFA{t('perMonth')}</span></div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                {[t('unlimitedProducts'), t('mobilePayments'), t('orderManagement'), t('customDomain'), t('analytics'), t('prioritySupport'), t('noCommission')].map((f, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.85)' }}>
                    <IconCheck size={16} color="var(--success)" /> {f}
                  </div>
                ))}
              </div>
            </div>
            <Link href="/register" style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: 46,
              borderRadius: '12px',
              background: 'var(--gradient-primary)',
              color: '#fff',
              fontWeight: 600,
              fontSize: '0.875rem',
              textDecoration: 'none',
              width: '100%',
              transition: 'opacity 0.2s',
              boxShadow: '0 4px 12px rgba(249, 115, 22, 0.25)'
            }}>{t('goPro')}</Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const { t } = useLanguage();
  return (
    <footer style={{ padding: '40px 0', background: '#030712', color: 'rgba(255,255,255,0.4)', textAlign: 'center', fontSize: '0.875rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
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
