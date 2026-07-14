'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n';
import { getSession } from '@/lib/auth';
import { IconPackage } from '@/lib/icons';

function formatCFA(n) { return new Intl.NumberFormat('fr-FR').format(n); }

const bgColors = ['#FEF3C7', '#DBEAFE', '#D1FAE5', '#FCE7F3', '#E0E7FF', '#FEE2E2'];

export default function ProductsPage() {
  const { t } = useLanguage();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [storeDetail, setStoreDetail] = useState(null);

  useEffect(() => {
    async function loadData() {
      const session = getSession();
      if (session?.store?.id) {
        try {
          const [prodRes, storeRes] = await Promise.all([
            fetch(`/api/products?storeId=${session.store.id}`).then(res => res.json()),
            fetch(`/api/store?storeId=${session.store.id}`).then(res => res.json())
          ]);
          if (prodRes.success) {
            setProducts(prodRes.products || []);
          }
          if (storeRes.success) {
            setStoreDetail(storeRes.store);
          }
        } catch (error) {
          console.error('Failed to load products page data:', error);
        }
      }
      setLoading(false);
    }
    loadData();
  }, []);

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const isExpired = storeDetail?.plan === 'PRO' && 
                    storeDetail?.subscriptionEnd && 
                    new Date() > new Date(storeDetail.subscriptionEnd);
  
  const isFreeLimit = storeDetail?.plan === 'FREE' && products.length >= 5;

  return (
    <div style={{ padding: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3>{t('myProducts')} <span style={{ color: 'var(--text-tertiary)', fontWeight: 400, fontSize: '0.875rem' }}>({products.length})</span></h3>
        {isExpired || isFreeLimit ? (
          <button 
            className="btn btn-primary btn-sm" 
            style={{ opacity: 0.5, cursor: 'not-allowed' }}
            disabled
            title={isExpired ? "Abonnement expiré" : "Limite de 5 produits atteinte"}
          >
            + {t('newProduct')}
          </button>
        ) : (
          <Link href="/dashboard/products/new" className="btn btn-primary btn-sm">+ {t('newProduct')}</Link>
        )}
      </div>

      {/* Search */}
      <div style={{ marginBottom: 16 }}>
        <input className="input" placeholder={t('search')} value={search} onChange={e => setSearch(e.target.value)} style={{ fontSize: '0.875rem' }} />
      </div>

      {/* Products Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-tertiary)' }}>Chargement...</div>
      ) : filtered.length > 0 ? (
        <div className="product-grid">
          {filtered.map((product, i) => (
            <Link key={product.id} href={`/dashboard/products/${product.id}`} className="product-card">
              <div className="product-card-img" style={{ background: bgColors[i % bgColors.length], display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', overflow: 'hidden', position: 'relative' }}>
                {product.images && product.images.length > 0 ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={product.images[0]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <IconPackage size={36} />
                )}
              </div>
              <div className="product-card-body">
                <div className="product-card-name">{product.name}</div>
                {product.description && (
                  <div style={{ 
                    fontSize: '0.75rem', 
                    color: 'var(--text-secondary)', 
                    marginTop: 4, 
                    marginBottom: 8,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {product.description}
                  </div>
                )}
                <div className="product-card-price">{formatCFA(product.price)} F</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
                  <span className={`badge ${product.inStock ? 'badge-success' : 'badge-danger'}`}>
                    {product.inStock ? t('inStock') : t('outOfStock')}
                  </span>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)' }}>x{product.quantity}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon"><IconPackage size={36} /></div>
          <h4>{t('noProducts')}</h4>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{t('noProductsDesc')}</p>
          {isExpired || isFreeLimit ? (
            <button 
              className="btn btn-primary" 
              style={{ opacity: 0.5, cursor: 'not-allowed' }}
              disabled
            >
              {t('addProduct')}
            </button>
          ) : (
            <Link href="/dashboard/products/new" className="btn btn-primary">{t('addProduct')}</Link>
          )}
        </div>
      )}
    </div>
  );
}
