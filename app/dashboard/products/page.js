'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n';
import { IconPackage } from '@/lib/icons';

function formatCFA(n) { return new Intl.NumberFormat('fr-FR').format(n); }

const mockProducts = [
  { id: '1', name: 'Robe Wax Élégante', price: 25000, stock: 12, inStock: true, image: null, category: 'Mode' },
  { id: '2', name: 'Sac en cuir tressé', price: 18000, stock: 5, inStock: true, image: null, category: 'Accessoires' },
  { id: '3', name: 'Boucles d\'oreilles dorées', price: 8500, stock: 0, inStock: false, image: null, category: 'Bijoux' },
  { id: '4', name: 'Thiouraye Parfumé', price: 3500, stock: 30, inStock: true, image: null, category: 'Beauté' },
  { id: '5', name: 'Boubou Homme Premium', price: 35000, stock: 8, inStock: true, image: null, category: 'Mode' },
  { id: '6', name: 'Huile de Touloucouna', price: 5000, stock: 15, inStock: true, image: null, category: 'Beauté' },
];

const bgColors = ['#FEF3C7', '#DBEAFE', '#D1FAE5', '#FCE7F3', '#E0E7FF', '#FEE2E2'];

export default function ProductsPage() {
  const { t } = useLanguage();
  const [search, setSearch] = useState('');

  const filtered = mockProducts.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3>{t('myProducts')} <span style={{ color: 'var(--text-tertiary)', fontWeight: 400, fontSize: '0.875rem' }}>({mockProducts.length})</span></h3>
        <Link href="/dashboard/products/new" className="btn btn-primary btn-sm">+ {t('newProduct')}</Link>
      </div>

      {/* Search */}
      <div style={{ marginBottom: 16 }}>
        <input className="input" placeholder={t('search')} value={search} onChange={e => setSearch(e.target.value)} style={{ fontSize: '0.875rem' }} />
      </div>

      {/* Products Grid */}
      {filtered.length > 0 ? (
        <div className="product-grid">
          {filtered.map((product, i) => (
            <Link key={product.id} href={`/dashboard/products/${product.id}`} className="product-card">
              <div className="product-card-img" style={{ background: bgColors[i % bgColors.length], display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                <IconPackage size={36} />
              </div>
              <div className="product-card-body">
                <div className="product-card-name">{product.name}</div>
                <div className="product-card-price">{formatCFA(product.price)} F</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
                  <span className={`badge ${product.inStock ? 'badge-success' : 'badge-danger'}`}>
                    {product.inStock ? t('inStock') : t('outOfStock')}
                  </span>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)' }}>x{product.stock}</span>
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
          <Link href="/dashboard/products/new" className="btn btn-primary">{t('addProduct')}</Link>
        </div>
      )}
    </div>
  );
}
