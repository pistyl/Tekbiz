'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import './landing.css';
import { LanguageProvider, useLanguage } from '@/lib/i18n';
import { 
  IconRocket, IconZap, IconWallet, IconChart, IconEdit, 
  IconCamera, IconParty, IconHome, IconPackage, IconClipboard, 
  IconDollar, IconUser, IconCheck, IconEye, IconGlobe, IconChevronDown,
  IconCheckCircle, IconWhatsApp
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
        <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
          <span style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--primary)', letterSpacing: '-0.02em' }}>TEKBIZ</span>
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

function WhatsAppButton() {
  const whatsappUrl = "https://wa.me/221762639829?text=Bonjour%20TEKBIZ%2C%20j%27aimerais%20avoir%20des%20informations";

  return (
    <a 
      href={whatsappUrl} 
      target="_blank" 
      rel="noopener noreferrer" 
      className="whatsapp-float-btn"
      title="Support WhatsApp (+221 76 263 98 29)"
      aria-label="Support WhatsApp"
    >
      <IconWhatsApp size={32} color="white" />
    </a>
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
                {[t('upTo5Products'), t('mobilePayments'), t('orderManagement')].map((f, i) => (
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
                {billingAnnually ? '1 920' : '2 400'}{' '}
                <span className="price-unit">FCFA / {t('perMonth')}</span>
              </div>
              {billingAnnually && <div className="yearly-billed-text">23 040 FCFA {t('billedYearly')}</div>}
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
      

      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <DemoSection />
      <StepsSection />
      <PricingSection />
      <FaqSection />
      <Footer />
      <WhatsAppButton />
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
