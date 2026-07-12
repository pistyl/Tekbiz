'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { LanguageProvider, useLanguage } from '@/lib/i18n';
import { 
  IconRocket, IconZap, IconWallet, IconChart, IconEdit, 
  IconCamera, IconParty, IconHome, IconPackage, IconClipboard, 
  IconDollar, IconUser, IconCheck, IconEye, IconGlobe, IconChevronDown,
  IconCheckCircle
} from '@/lib/icons';

function LangToggle() {
  const { lang, toggleLang } = useLanguage();
  return (
    <button 
      onClick={toggleLang} 
      className="lang-toggle-btn"
      aria-label="Toggle language"
    >
      <span className={lang === 'fr' ? 'lang-toggle-active' : 'lang-toggle-inactive'}>FR</span>
      <span style={{ opacity: 0.15 }}>|</span>
      <span className={lang === 'wo' ? 'lang-toggle-active' : 'lang-toggle-inactive'}>WO</span>
    </button>
  );
}

function Navbar() {
  const { t } = useLanguage();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`navbar-custom ${scrolled ? 'navbar-scrolled' : ''}`}>
      <div className="container navbar-container">
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div className="logo-box">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="url(#bag-grad-nav)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
            <span style={{ fontSize: '7px', fontWeight: 950, color: 'var(--primary)', letterSpacing: '0.8px', lineHeight: 1 }}>TEKBIZ</span>
          </div>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <LangToggle />
          <Link href="/login" className="btn btn-primary" style={{ padding: '8px 16px', borderRadius: '100px', fontSize: '0.8125rem' }}>
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
    <section className="hero-section">
      <div className="gradient-glow-1" />
      <div className="gradient-glow-2" />
      
      <div className="container" style={{ position: 'relative', zIndex: 1, padding: '0 16px' }}>
        <div className="hero-grid">
          
          <div className="hero-text-col">
          
            
            <h1 className="hero-title">
              {firstPart}
              {secondPart && <><br /><span className="text-gradient">{secondPart}</span></>}
            </h1>
            
            <p className="hero-subtitle">
              {t('heroSubtitle')}
            </p>
            
            <div className="hero-buttons">
              <Link href="/register" className="btn btn-primary btn-hero">
                {t('startFree')}
              </Link>
              <Link href="#demo" className="btn btn-secondary btn-hero">
                {t('seeDemo')}
              </Link>
            </div>

            <div className="hero-social-proof">
              <div className="avatar-stack">
                <div style={{ background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)' }} />
                <div style={{ background: 'linear-gradient(135deg, #10B981, #047857)', marginLeft: -10 }} />
                <div style={{ background: 'linear-gradient(135deg, #EC4899, #BE185D)', marginLeft: -10 }} />
              </div>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                {t('socialProof')}
              </span>
            </div>
          </div>

          <div className="hero-image-col">
            <div className="mockup-container">
              {/* Phone Mockup Frame */}
              <div className="phone-frame">
                <div className="phone-notch" />
                <div className="phone-screen">
                  {/* App Header */}
                  <div className="app-header">
                    <div className="app-logo">TB</div>
                    <div className="app-badge">Pro</div>
                  </div>
                  
                  {/* App Stats */}
                  <div className="app-stats">
                    <span className="stats-label">Solde disponible</span>
                    <span className="stats-val">78 500 FCFA</span>
                  </div>

                  {/* Payment Chart Simulator */}
                  <div className="app-chart">
                    <div className="chart-bar" style={{ height: '40%' }} />
                    <div className="chart-bar" style={{ height: '70%' }} />
                    <div className="chart-bar highlighted" style={{ height: '90%' }} />
                    <div className="chart-bar" style={{ height: '55%' }} />
                    <div className="chart-bar" style={{ height: '80%' }} />
                  </div>

                  {/* App Transactions */}
                  <div className="app-transactions">
                    <div className="tx-item">
                      <div className="tx-icon wave-color">W</div>
                      <div className="tx-info">
                        <span className="tx-name">Fatou Diop</span>
                        <span className="tx-date">Aujourd'hui, 14:32</span>
                      </div>
                      <span className="tx-amount font-bold">+5 000 F</span>
                    </div>
                    <div className="tx-item">
                      <div className="tx-icon om-color">OM</div>
                      <div className="tx-info">
                        <span className="tx-name">Amadou Sow</span>
                        <span className="tx-date">Hier, 18:15</span>
                      </div>
                      <span className="tx-amount font-bold">+12 500 F</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Badges (Hidden on mobile to prevent overflow) */}
              <div className="floating-badge badge-1">
                <div className="badge-icon"><IconWallet size={16} color="var(--primary)" /></div>
                <div>
                  <div className="badge-title">Wave payé</div>
                  <div className="badge-desc">+25 000 FCFA</div>
                </div>
              </div>

              <div className="floating-badge badge-2">
                <div className="badge-icon"><IconCheckCircle size={16} color="var(--success)" /></div>
                <div>
                  <div className="badge-title">Boutique active</div>
                  <div className="badge-desc">tekbiz.sn/shop</div>
                </div>
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
    { 
      icon: <IconZap size={30} />, 
      title: t('feature1Title'), 
      desc: t('feature1Desc'), 
      color: '#F97316',
      badge: 'Rapide'
    },
    { 
      icon: <IconWallet size={30} />, 
      title: t('feature2Title'), 
      desc: t('feature2Desc'), 
      color: '#10B981',
      badge: 'Automatique'
    },
    { 
      icon: <IconChart size={30} />, 
      title: t('feature3Title'), 
      desc: t('feature3Desc'), 
      color: '#3B82F6',
      badge: 'Analyses'
    },
  ];
  return (
    <section className="features-section">
      <div className="container">
        <h2 className="section-title text-center" style={{ marginBottom: 48 }}>Des outils puissants, pensés pour la croissance</h2>
        <div className="bento-grid">
          {features.map((f, i) => (
            <div key={i} className="bento-card card-interactive" style={{ '--border-accent': f.color }}>
              <div className="bento-badge" style={{ backgroundColor: `${f.color}15`, color: f.color }}>{f.badge}</div>
              <div className="bento-icon-container" style={{ background: `${f.color}10`, color: f.color }}>{f.icon}</div>
              <h3 className="bento-card-title">{f.title}</h3>
              <p className="bento-card-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function DemoSection() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('store');
  const [chartTrigger, setChartTrigger] = useState(false);

  useEffect(() => {
    if (activeTab === 'dashboard') {
      setChartTrigger(true);
    } else {
      setChartTrigger(false);
    }
  }, [activeTab]);

  return (
    <section id="demo" className="demo-section">
      <div className="container">
        <div className="text-center" style={{ marginBottom: 40 }}>
          <h2 className="section-title">{t('demoTitle')}</h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 600, margin: '0 auto', fontSize: '0.9375rem' }}>{t('demoSubtitle')}</p>
        </div>

        <div className="simulator-container">
          {/* Tabs Selector */}
          <div className="simulator-tabs">
            <button 
              onClick={() => setActiveTab('store')} 
              className={`tab-btn ${activeTab === 'store' ? 'active' : ''}`}
            >
              <IconHome size={16} />
              <span>{t('demoTabStore')}</span>
            </button>
            <button 
              onClick={() => setActiveTab('dashboard')} 
              className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            >
              <IconChart size={16} />
              <span>{t('demoTabDashboard')}</span>
            </button>
            <button 
              onClick={() => setActiveTab('orders')} 
              className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
            >
              <IconClipboard size={16} />
              <span>{t('demoTabOrders')}</span>
            </button>
          </div>

          {/* Simulator Screen */}
          <div className="simulator-screen">
            {activeTab === 'store' && (
              <div className="mock-store-view page-enter">
                <div className="store-banner">
                  <div className="store-logo">B</div>
                  <div className="store-title">Ma Super Boutique</div>
                </div>
                <div className="store-products-grid">
                  <div className="mock-product-card">
                    <div className="mock-prod-img"><IconPackage size={32} color="var(--text-tertiary)" /></div>
                    <div className="mock-prod-info">
                      <span className="mock-prod-name">Café Touba Aromatisé</span>
                      <span className="mock-prod-price">1 500 FCFA</span>
                    </div>
                    <button className="btn btn-primary btn-sm btn-full" style={{ marginTop: 8 }}>Ajouter</button>
                  </div>
                  <div className="mock-product-card">
                    <div className="mock-prod-img"><IconPackage size={32} color="var(--text-tertiary)" /></div>
                    <div className="mock-prod-info">
                      <span className="mock-prod-name">Thé Menthe Fraîche</span>
                      <span className="mock-prod-price">1 000 FCFA</span>
                    </div>
                    <button className="btn btn-primary btn-sm btn-full" style={{ marginTop: 8 }}>Ajouter</button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'dashboard' && (
              <div className="mock-dashboard-view page-enter">
                <div className="stats-row">
                  <div className="stats-widget">
                    <span className="widget-label">Ventes du jour</span>
                    <span className="widget-val">42 500 FCFA</span>
                  </div>
                  <div className="stats-widget">
                    <span className="widget-label">Commandes</span>
                    <span className="widget-val">12</span>
                  </div>
                </div>
                <div className="live-chart-container">
                  <span className="chart-title">Évolution des ventes (cette semaine)</span>
                  <div className="live-chart-bars">
                    <div className="chart-bar-col">
                      <div className="bar-fill" style={{ height: chartTrigger ? '30%' : '0%' }} />
                      <span>Lun</span>
                    </div>
                    <div className="chart-bar-col">
                      <div className="bar-fill" style={{ height: chartTrigger ? '60%' : '0%' }} />
                      <span>Mar</span>
                    </div>
                    <div className="chart-bar-col">
                      <div className="bar-fill" style={{ height: chartTrigger ? '45%' : '0%' }} />
                      <span>Mer</span>
                    </div>
                    <div className="chart-bar-col">
                      <div className="bar-fill highlighted" style={{ height: chartTrigger ? '85%' : '0%' }} />
                      <span>Jeu</span>
                    </div>
                    <div className="chart-bar-col">
                      <div className="bar-fill" style={{ height: chartTrigger ? '70%' : '0%' }} />
                      <span>Ven</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="mock-orders-view page-enter">
                <div className="order-list">
                  <div className="mock-order-item active">
                    <div className="order-status-badge success">Nouveau</div>
                    <div className="order-meta">
                      <span className="order-number font-bold">Commande #TK-549</span>
                      <span className="order-customer">Samba Fall — 77 450 12 34</span>
                    </div>
                    <div className="order-price font-bold">3 000 FCFA</div>
                  </div>
                  <div className="mock-order-item">
                    <div className="order-status-badge info">Livré</div>
                    <div className="order-meta">
                      <span className="order-number font-bold">Commande #TK-548</span>
                      <span className="order-customer">Awa Ndiaye — 76 500 89 21</span>
                    </div>
                    <div className="order-price font-bold">12 500 FCFA</div>
                  </div>
                </div>
              </div>
            )}
          </div>
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
    <section className="steps-section">
      <div className="container">
        <h2 className="section-title text-center" style={{ marginBottom: 48 }}>{t('howItWorks')}</h2>
        <div className="steps-horizontal-grid">
          {steps.map((s, i) => (
            <div key={i} className="step-card">
              <div className="step-number">{s.num}</div>
              <div className="step-icon-box">
                {s.icon}
              </div>
              <h4 className="step-card-title">{s.title}</h4>
              <p className="step-card-desc">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingSection() {
  const { t } = useLanguage();
  const [billingAnnually, setBillingAnnually] = useState(false);

  return (
    <section className="pricing-section">
      <div className="container">
        <div className="text-center" style={{ marginBottom: 32 }}>
          <h2 className="section-title">{t('pricingTitle')}</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: '0.9375rem' }}>{t('pricingSubtitle')}</p>
          
          {/* Billing Switch */}
          <div className="billing-switch-container">
            <span className={!billingAnnually ? 'active-billing' : 'inactive-billing'}>
              {t('billingMonthly')}
            </span>
            <button 
              onClick={() => setBillingAnnually(!billingAnnually)} 
              className={`billing-toggle ${billingAnnually ? 'active' : ''}`}
              aria-label="Toggle annual billing"
            >
              <span className="toggle-thumb" />
            </button>
            <span className={billingAnnually ? 'active-billing' : 'inactive-billing'} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              {t('billingAnnually')}
              <span className="discount-badge">{t('save20')}</span>
            </span>
          </div>
        </div>

        <div className="pricing-grid">
          {/* Free */}
          <div className="pricing-card">
            <div>
              <h3 className="plan-name">{t('freePlan')}</h3>
              <div className="plan-price">0 <span className="price-unit">FCFA</span></div>
              <div className="plan-features">
                {[t('upTo20Products'), t('mobilePayments'), t('orderManagement')].map((f, i) => (
                  <div key={i} className="feature-line">
                    <IconCheck size={16} color="var(--success)" /> <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>
            <Link href="/register" className="btn btn-secondary btn-full" style={{ marginTop: 24 }}>
              {t('startFree')}
            </Link>
          </div>
          
          {/* Pro */}
          <div className="pricing-card pro-highlighted">
            <div className="popular-ribbon">{t('popular')}</div>
            <div>
              <h3 className="plan-name">{t('proPlan')}</h3>
              <div className="plan-price">
                {billingAnnually ? '4 000' : '5 000'}{' '}
                <span className="price-unit">FCFA / {t('perMonth')}</span>
              </div>
              {billingAnnually && <div className="yearly-billed-text">48 000 FCFA {t('billedYearly')}</div>}
              <div className="plan-features">
                {[
                  t('unlimitedProducts'), 
                  t('mobilePayments'), 
                  t('orderManagement'), 
                  t('customDomain'), 
                  t('analytics'), 
                  t('prioritySupport'), 
                  t('noCommission')
                ].map((f, i) => (
                  <div key={i} className="feature-line">
                    <IconCheck size={16} color="var(--success)" /> <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>
            <Link href="/register" className="btn btn-primary btn-full" style={{ marginTop: 24 }}>
              {t('goPro')}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function FaqSection() {
  const { t } = useLanguage();
  const [openFaq, setOpenFaq] = useState(null);

  const faqItems = [
    { q: t('faqQ1'), a: t('faqA1') },
    { q: t('faqQ2'), a: t('faqA2') },
    { q: t('faqQ3'), a: t('faqA3') },
    { q: t('faqQ4'), a: t('faqA4') }
  ];

  return (
    <section className="faq-section">
      <div className="container" style={{ maxWidth: 760 }}>
        <div className="text-center" style={{ marginBottom: 40 }}>
          <h2 className="section-title">{t('faqTitle')}</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>{t('faqSubtitle')}</p>
        </div>

        <div className="faq-list">
          {faqItems.map((item, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div key={idx} className="faq-item">
                <button 
                  onClick={() => setOpenFaq(isOpen ? null : idx)} 
                  className="faq-question-btn"
                  aria-expanded={isOpen}
                >
                  <span className="font-bold" style={{ paddingRight: 16 }}>{item.q}</span>
                  <span className={`chevron-icon ${isOpen ? 'rotate-180' : ''}`}><IconChevronDown size={18} /></span>
                </button>
                <div className={`faq-answer-container ${isOpen ? 'open' : ''}`}>
                  <div className="faq-answer-content">
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', lineHeight: 1.6 }}>{item.a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="footer-custom">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-col-main">
            <span className="footer-logo">TEKBIZ</span>
            <p className="footer-desc">Permettre à chaque commerçant de réussir son commerce en ligne sans limite.</p>
          </div>
          <div className="footer-col">
            <span className="footer-title">Produit</span>
            <Link href="#demo">Démo</Link>
            <Link href="/register">Inscription</Link>
            <Link href="/login">Connexion</Link>
          </div>
          <div className="footer-col">
            <span className="footer-title">Légal</span>
            <Link href="#">CGU</Link>
            <Link href="#">Confidentialité</Link>
            <Link href="#">Support</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <p>{t('footer')}</p>
        </div>
      </div>
    </footer>
  );
}

function LandingContent() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        /* --- Fully Responsive Redesigned Landing Styles --- */
        .navbar-custom {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border);
          padding-top: env(safe-area-inset-top, 0px);
          transition: all 0.3s ease;
        }
        .navbar-scrolled {
          background: rgba(255, 255, 255, 0.85);
          box-shadow: 0 4px 20px rgba(0,0,0,0.03);
        }
        .navbar-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 56px;
          padding: 0 16px;
          transition: all 0.3s ease;
        }
        .navbar-scrolled .navbar-container {
          height: 50px;
        }
        @media (min-width: 768px) {
          .navbar-container {
            height: 72px;
          }
          .navbar-scrolled .navbar-container {
            height: 60px;
          }
        }
        .logo-box {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 6px 14px;
          border-radius: 12px;
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          transition: all 0.3s;
        }
        .logo-box:hover {
          border-color: var(--primary);
        }

        .lang-toggle-btn {
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          border-radius: 100px;
          padding: 6px 14px;
          color: var(--text-secondary);
          font-size: 0.75rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .lang-toggle-btn:hover {
          border-color: var(--primary);
          color: var(--primary);
        }
        .lang-toggle-active {
          color: var(--primary);
        }
        .lang-toggle-inactive {
          color: var(--text-tertiary);
        }

        .hero-section {
          min-height: 100vh;
          display: flex;
          align-items: center;
          background: var(--bg);
          color: var(--text);
          padding-top: calc(88px + env(safe-area-inset-top, 0px));
          padding-bottom: 60px;
          position: relative;
          overflow: hidden;
        }
        @media (min-width: 768px) {
          .hero-section {
            padding-top: calc(120px + env(safe-area-inset-top, 0px));
            padding-bottom: 80px;
          }
        }
        .gradient-glow-1 {
          position: absolute;
          top: -10%;
          right: -10%;
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(249,115,22,0.08) 0%, transparent 70%);
          pointer-events: none;
        }
        .gradient-glow-2 {
          position: absolute;
          bottom: -10%;
          left: -10%;
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(6,182,212,0.05) 0%, transparent 70%);
          pointer-events: none;
        }

        .promo-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(249, 115, 22, 0.08);
          border: 1.5px solid rgba(249, 115, 22, 0.15);
          color: var(--primary-dark);
          padding: 6px 16px;
          border-radius: 100px;
          font-size: 0.75rem;
          font-weight: 700;
          margin-bottom: 24px;
        }
        .promo-pulse {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--primary);
          animation: pulse 1.5s infinite;
        }
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.5); opacity: 0.4; }
          100% { transform: scale(1); opacity: 1; }
        }

        .hero-title {
          font-size: clamp(2rem, 6vw, 3.75rem);
          font-weight: 900;
          font-family: var(--font-display);
          line-height: 1.15;
          letter-spacing: -0.03em;
          margin-bottom: 24px;
        }
        .text-gradient {
          background: var(--gradient-primary);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .hero-subtitle {
          font-size: clamp(0.9rem, 2vw, 1.0625rem);
          color: var(--text-secondary);
          line-height: 1.6;
          margin-bottom: 32px;
          max-width: 500px;
          margin-left: auto;
          margin-right: auto;
        }
        .hero-buttons {
          display: flex;
          flex-direction: column;
          gap: 12px;
          width: 100%;
          max-width: 320px;
          margin-bottom: 32px;
        }
        .btn-hero {
          height: 52px;
          font-size: 0.9375rem;
          border-radius: 14px;
        }

        .hero-social-proof {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .avatar-stack {
          display: flex;
          align-items: center;
        }
        .avatar-stack div {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          border: 2px solid var(--bg);
          box-shadow: var(--shadow-sm);
        }

        .hero-text-col {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }
        .hero-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 48px;
          align-items: center;
        }
        .hero-image-col {
          display: flex;
          justify-content: center;
          position: relative;
          width: 100%;
          overflow: visible;
        }

        /* --- Mockup Phone Component --- */
        .mockup-container {
          position: relative;
          width: 100%;
          max-width: 300px;
          margin: 0 auto;
        }
        .phone-frame {
          background: var(--secondary);
          border: 8px solid var(--secondary);
          border-radius: 36px;
          box-shadow: var(--shadow-xl);
          aspect-ratio: 9 / 18.5;
          width: 100%;
          overflow: hidden;
          position: relative;
        }
        .phone-notch {
          width: 100px;
          height: 18px;
          background: var(--secondary);
          border-radius: 0 0 14px 14px;
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          z-index: 10;
        }
        .phone-screen {
          background: var(--bg-secondary);
          height: 100%;
          width: 100%;
          padding: 26px 12px 12px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .app-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .app-logo {
          width: 28px;
          height: 28px;
          border-radius: 6px;
          background: var(--gradient-primary);
          color: white;
          font-weight: 800;
          font-size: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .app-badge {
          background: rgba(249, 115, 22, 0.1);
          color: var(--primary);
          font-size: 0.625rem;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 100px;
        }
        .app-stats {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 12px;
          display: flex;
          flex-direction: column;
        }
        .stats-label {
          font-size: 0.625rem;
          color: var(--text-tertiary);
          font-weight: 600;
          text-transform: uppercase;
        }
        .stats-val {
          font-size: 1.25rem;
          font-weight: 800;
          font-family: var(--font-display);
        }
        .app-chart {
          height: 70px;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 10px;
          gap: 6px;
        }
        .chart-bar {
          background: var(--border);
          flex: 1;
          border-radius: 3px;
          transition: height 0.3s;
        }
        .chart-bar.highlighted {
          background: var(--gradient-primary);
        }
        .app-transactions {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .tx-item {
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 8px;
        }
        .tx-icon {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 0.625rem;
          color: white;
        }
        .wave-color { background: #3B82F6; }
        .om-color { background: #F97316; }
        .tx-info {
          display: flex;
          flex-direction: column;
          flex: 1;
        }
        .tx-name {
          font-size: 0.75rem;
          font-weight: 600;
          line-height: 1.2;
        }
        .tx-date {
          font-size: 0.5625rem;
          color: var(--text-tertiary);
        }
        .tx-amount {
          font-size: 0.75rem;
          color: var(--success);
        }

        /* --- Floating Badges --- */
        .floating-badge {
          position: absolute;
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.6);
          border-radius: 16px;
          padding: 10px 14px;
          display: flex;
          align-items: center;
          gap: 10px;
          box-shadow: var(--shadow-lg);
          z-index: 5;
          animation: float 4s ease-in-out infinite;
        }
        .badge-1 {
          top: 15%;
          left: -20px;
          animation-delay: 0s;
        }
        .badge-2 {
          bottom: 20%;
          right: -15px;
          animation-delay: 2s;
        }
        .badge-icon {
          width: 28px;
          height: 28px;
          border-radius: 8px;
          background: white;
          box-shadow: var(--shadow-sm);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .badge-title {
          font-size: 0.625rem;
          color: var(--text-tertiary);
          font-weight: 600;
        }
        .badge-desc {
          font-size: 0.75rem;
          font-weight: 700;
        }

        /* Responsive Badges logic */
        @media (max-width: 576px) {
          .floating-badge {
            display: none !important;
          }
          .phone-frame {
            max-width: 270px;
            margin: 0 auto;
          }
        }

        /* --- Bento Grid Features --- */
        .features-section {
          padding: 80px 0;
          background: var(--bg-secondary);
        }
        .bento-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
        }
        .bento-card {
          background: var(--surface);
          border: 1.5px solid var(--border);
          border-radius: 24px;
          padding: 28px;
          position: relative;
          overflow: hidden;
          transition: all 0.3s var(--ease-out);
        }
        .bento-card:hover {
          border-color: var(--border-accent);
          transform: translateY(-4px);
          box-shadow: var(--shadow-lg);
        }
        .bento-badge {
          display: inline-block;
          font-size: 0.6875rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 4px 12px;
          border-radius: 100px;
          margin-bottom: 16px;
        }
        .bento-icon-container {
          width: 50px;
          height: 50px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
        }
        .bento-card-title {
          font-size: 1.1875rem;
          font-weight: 800;
          margin-bottom: 10px;
        }
        .bento-card-desc {
          color: var(--text-secondary);
          font-size: 0.875rem;
          line-height: 1.6;
        }

        /* --- Interactive Demo Section --- */
        .demo-section {
          padding: 80px 0;
          background: var(--bg);
        }
        .simulator-container {
          width: 100%;
          max-width: 760px;
          margin: 0 auto;
          background: var(--surface);
          border: 1.5px solid var(--border);
          border-radius: 24px;
          overflow: hidden;
          box-shadow: var(--shadow-lg);
        }
        .simulator-tabs {
          display: flex;
          border-bottom: 1px solid var(--border);
          background: var(--bg-secondary);
        }
        .tab-btn {
          flex: 1;
          padding: 12px 8px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-secondary);
          border: none;
          background: transparent;
          cursor: pointer;
          transition: all 0.2s;
        }
        @media (min-width: 480px) {
          .tab-btn {
            flex-direction: row;
            padding: 16px;
            font-size: 0.875rem;
            gap: 8px;
          }
        }
        .tab-btn.active {
          color: var(--primary);
          background: var(--surface);
          font-weight: 700;
          box-shadow: inset 0 -2px 0 var(--primary);
        }
        .simulator-screen {
          padding: 16px;
          min-height: 280px;
          background: var(--surface);
        }
        @media (min-width: 768px) {
          .simulator-screen {
            padding: 32px;
          }
        }
        .mock-store-view {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .store-banner {
          background: var(--gradient-primary);
          padding: 16px;
          border-radius: 12px;
          color: white;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        @media (min-width: 480px) {
          .store-banner {
            padding: 24px;
            border-radius: 16px;
            gap: 16px;
          }
        }
        .store-logo {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          background: white;
          color: var(--primary);
          font-weight: 900;
          font-size: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        @media (min-width: 480px) {
          .store-logo {
            width: 48px;
            height: 48px;
            border-radius: 12px;
            font-size: 1.25rem;
          }
        }
        .store-title {
          font-size: 0.9375rem;
          font-weight: 800;
        }
        @media (min-width: 480px) {
          .store-title {
            font-size: 1.125rem;
          }
        }
        .store-products-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }
        @media (min-width: 480px) {
          .store-products-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        .mock-product-card {
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 12px;
          background: var(--bg-secondary);
        }
        @media (min-width: 480px) {
          .mock-product-card {
            border-radius: 16px;
            padding: 16px;
          }
        }
        .mock-prod-img {
          height: 80px;
          background: var(--surface);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 8px;
        }
        @media (min-width: 480px) {
          .mock-prod-img {
            height: 95px;
            margin-bottom: 12px;
          }
        }
        .mock-prod-info {
          display: flex;
          flex-direction: column;
        }
        .mock-prod-name {
          font-size: 0.75rem;
          font-weight: 600;
        }
        @media (min-width: 480px) {
          .mock-prod-name {
            font-size: 0.8125rem;
          }
        }
        .mock-prod-price {
          font-size: 0.8125rem;
          font-weight: 800;
          color: var(--primary);
        }
        @media (min-width: 480px) {
          .mock-prod-price {
            font-size: 0.875rem;
          }
        }

        .mock-dashboard-view {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .stats-row {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        @media (min-width: 480px) {
          .stats-row {
            flex-direction: row;
            gap: 16px;
          }
        }
        .stats-widget {
          flex: 1;
          background: var(--bg-secondary);
          border: 1.5px solid var(--border);
          border-radius: 12px;
          padding: 12px;
          display: flex;
          flex-direction: column;
        }
        @media (min-width: 480px) {
          .stats-widget {
            border-radius: 16px;
            padding: 16px;
          }
        }
        .widget-label {
          font-size: 0.6875rem;
          color: var(--text-tertiary);
          font-weight: 600;
          text-transform: uppercase;
        }
        .widget-val {
          font-size: 1.125rem;
          font-weight: 800;
          color: var(--text);
        }
        @media (min-width: 480px) {
          .widget-val {
            font-size: 1.25rem;
          }
        }
        .live-chart-container {
          background: var(--bg-secondary);
          border: 1.5px solid var(--border);
          border-radius: 12px;
          padding: 16px;
        }
        @media (min-width: 480px) {
          .live-chart-container {
            border-radius: 16px;
            padding: 20px;
          }
        }
        .chart-title {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-secondary);
          display: block;
          margin-bottom: 12px;
        }
        @media (min-width: 480px) {
          .chart-title {
            font-size: 0.8125rem;
            margin-bottom: 16px;
          }
        }
        .live-chart-bars {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          height: 90px;
          gap: 8px;
        }
        @media (min-width: 480px) {
          .live-chart-bars {
            height: 100px;
            gap: 12px;
          }
        }
        .chart-bar-col {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
        }
        .chart-bar-col span {
          font-size: 0.625rem;
          color: var(--text-tertiary);
          font-weight: 600;
        }
        .bar-fill {
          width: 100%;
          background: var(--border);
          border-radius: 4px;
          transition: height 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .bar-fill.highlighted {
          background: var(--gradient-primary);
        }

        .mock-orders-view {
          display: flex;
          flex-direction: column;
        }
        .order-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .mock-order-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: var(--bg-secondary);
          border: 1.5px solid var(--border);
          border-radius: 12px;
        }
        @media (min-width: 480px) {
          .mock-order-item {
            gap: 16px;
            padding: 16px;
            border-radius: 16px;
          }
        }
        .mock-order-item.active {
          border-color: var(--primary);
          background: rgba(249, 115, 22, 0.03);
        }
        .order-status-badge {
          font-size: 0.625rem;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 100px;
        }
        .order-status-badge.success {
          background: rgba(16, 185, 129, 0.1);
          color: var(--success);
        }
        .order-status-badge.info {
          background: rgba(59, 130, 246, 0.1);
          color: var(--info);
        }
        .order-meta {
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        .order-number {
          font-size: 0.8125rem;
        }
        @media (min-width: 480px) {
          .order-number {
            font-size: 0.875rem;
          }
        }
        .order-customer {
          font-size: 0.6875rem;
          color: var(--text-secondary);
        }
        .order-price {
          font-size: 0.8125rem;
        }
        @media (min-width: 480px) {
          .order-price {
            font-size: 0.875rem;
          }
        }

        /* --- Steps Section --- */
        .steps-section {
          padding: 80px 0;
          background: var(--bg-secondary);
        }
        .steps-horizontal-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
          position: relative;
        }
        .step-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 24px;
          text-align: center;
          position: relative;
        }
        @media (min-width: 480px) {
          .step-card {
            border-radius: 20px;
            padding: 32px;
          }
        }
        .step-number {
          position: absolute;
          top: 12px;
          right: 16px;
          font-size: 1.5rem;
          font-weight: 900;
          color: var(--border);
          font-family: var(--font-display);
        }
        @media (min-width: 480px) {
          .step-number {
            top: 16px;
            right: 20px;
            font-size: 1.75rem;
          }
        }
        .step-icon-box {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: var(--gradient-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
          box-shadow: var(--shadow-float);
        }
        .step-card-title {
          font-size: 1rem;
          font-weight: 700;
          margin-bottom: 6px;
        }
        .step-card-desc {
          color: var(--text-secondary);
          font-size: 0.8125rem;
          line-height: 1.5;
        }

        /* --- Pricing Section --- */
        .pricing-section {
          padding: 80px 0;
          background: var(--bg);
        }
        .billing-switch-container {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          padding: 6px 12px;
          border-radius: 100px;
        }
        .active-billing {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text);
        }
        .inactive-billing {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-tertiary);
        }
        .billing-toggle {
          width: 40px;
          height: 22px;
          background: var(--border);
          border-radius: 100px;
          position: relative;
          cursor: pointer;
          padding: 2px;
          transition: background 0.2s;
        }
        .billing-toggle.active {
          background: var(--primary);
        }
        .toggle-thumb {
          width: 18px;
          height: 18px;
          background: white;
          border-radius: 50%;
          display: block;
          transition: transform 0.2s;
        }
        .billing-toggle.active .toggle-thumb {
          transform: translateX(18px);
        }
        .discount-badge {
          background: var(--success);
          color: white;
          font-size: 0.5625rem;
          font-weight: 800;
          padding: 2px 6px;
          border-radius: 6px;
          text-transform: uppercase;
        }

        .pricing-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
          max-width: 640px;
          margin: 0 auto;
        }
        .pricing-card {
          background: var(--surface);
          border: 1.5px solid var(--border);
          border-radius: 20px;
          padding: 28px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
          overflow: hidden;
        }
        @media (min-width: 480px) {
          .pricing-card {
            border-radius: 24px;
            padding: 36px;
          }
        }
        .pro-highlighted {
          border-color: var(--primary);
          box-shadow: var(--shadow-lg);
        }
        .popular-ribbon {
          position: absolute;
          top: 14px;
          right: 20px;
          background: var(--gradient-primary);
          color: white;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.625rem;
          font-weight: 700;
          text-transform: uppercase;
        }
        .plan-name {
          font-size: 1.1875rem;
          font-weight: 800;
          margin-bottom: 8px;
        }
        .plan-price {
          font-size: 2rem;
          font-weight: 900;
          font-family: var(--font-display);
          margin-bottom: 20px;
        }
        @media (min-width: 480px) {
          .plan-price {
            font-size: 2.25rem;
            margin-bottom: 24px;
          }
        }
        .price-unit {
          font-size: 0.8125rem;
          color: var(--text-tertiary);
          font-weight: 600;
        }
        .yearly-billed-text {
          font-size: 0.75rem;
          color: var(--text-secondary);
          margin-top: -16px;
          margin-bottom: 16px;
          font-weight: 600;
        }
        .plan-features {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .feature-line {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.8125rem;
        }
        @media (min-width: 480px) {
          .feature-line {
            gap: 10px;
            font-size: 0.875rem;
          }
        }

        /* --- FAQ Accordion Section --- */
        .faq-section {
          padding: 80px 0;
          background: var(--bg-secondary);
        }
        .faq-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .faq-item {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.2s;
        }
        @media (min-width: 480px) {
          .faq-item {
            border-radius: 16px;
          }
        }
        .faq-item:hover {
          border-color: var(--primary-light);
        }
        .faq-question-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          background: transparent;
          border: none;
          cursor: pointer;
          text-align: left;
        }
        @media (min-width: 480px) {
          .faq-question-btn {
            padding: 20px 24px;
          }
        }
        .faq-question-btn span {
          font-size: 0.875rem;
          color: var(--text);
        }
        @media (min-width: 480px) {
          .faq-question-btn span {
            font-size: 0.9375rem;
          }
        }
        .chevron-icon {
          color: var(--text-tertiary);
          transition: transform 0.2s;
          display: flex;
          align-items: center;
        }
        .rotate-180 {
          transform: rotate(180deg);
          color: var(--primary);
        }
        .faq-answer-container {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.3s ease-out;
        }
        .faq-answer-container.open {
          max-height: 250px;
        }
        .faq-answer-content {
          padding: 0 20px 16px;
        }
        @media (min-width: 480px) {
          .faq-answer-content {
            padding: 0 24px 20px;
          }
        }

        /* --- Footer Redesign --- */
        .footer-custom {
          background: var(--bg);
          border-top: 1px solid var(--border);
          padding: 48px 0 24px;
          color: var(--text-secondary);
        }
        .footer-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 32px;
          margin-bottom: 36px;
        }
        .footer-logo {
          font-family: var(--font-display);
          font-weight: 900;
          font-size: 1.375rem;
          background: var(--gradient-primary);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          display: block;
          margin-bottom: 12px;
        }
        .footer-desc {
          font-size: 0.8125rem;
          line-height: 1.6;
          max-width: 320px;
        }
        .footer-col {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .footer-title {
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text);
          margin-bottom: 6px;
        }
        .footer-col a {
          font-size: 0.8125rem;
          transition: color 0.2s;
        }
        .footer-col a:hover {
          color: var(--primary);
        }
        .footer-bottom {
          border-top: 1px solid var(--border);
          padding-top: 24px;
          text-align: center;
          font-size: 0.75rem;
          color: var(--text-tertiary);
        }

        /* --- Responsive Grid Controllers --- */
        @media (min-width: 768px) {
          .hero-buttons {
            flex-direction: row;
            max-width: none;
            justify-content: center;
          }
          .btn-hero {
            flex: 1;
            min-width: 180px;
          }
          .bento-grid {
            grid-template-columns: repeat(3, 1fr);
          }
          .steps-horizontal-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 32px;
          }
          .pricing-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .footer-grid {
            grid-template-columns: 2fr 1fr 1fr;
          }
        }

        @media (min-width: 992px) {
          .hero-grid {
            grid-template-columns: 1.2fr 1fr;
            gap: 60px;
          }
          .hero-text-col {
            align-items: flex-start;
            text-align: left;
          }
          .hero-subtitle {
            margin-left: 0;
            margin-right: auto;
          }
          .hero-buttons {
            justify-content: flex-start;
          }
        }
      `}} />

      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <DemoSection />
      <StepsSection />
      <PricingSection />
      <FaqSection />
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
