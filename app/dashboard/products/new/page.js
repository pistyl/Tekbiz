'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/i18n';

const categories = ['Mode & Vêtements', 'Électronique', 'Alimentation', 'Beauté & Cosmétiques', 'Maison & Déco', 'Bijoux & Accessoires', 'Autre'];

export default function NewProductPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', price: '', description: '', category: '', stock: '1' });

  const update = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setLoading(false); router.push('/dashboard/products'); }, 1000);
  };

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <button onClick={() => router.back()} className="btn btn-ghost btn-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        <h3>{t('newProduct')}</h3>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Photo Upload */}
        <div style={{ width: '100%', aspectRatio: '16/9', background: 'var(--bg-tertiary)', border: '2px dashed var(--border)', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer' }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>{t('addPhoto')}</span>
        </div>

        <div className="input-group">
          <label>{t('productName')}</label>
          <input className="input" placeholder="Ex: Robe Wax Élégante" value={form.name} onChange={e => update('name', e.target.value)} required />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="input-group">
            <label>{t('productPrice')}</label>
            <input className="input" type="number" placeholder="15000" value={form.price} onChange={e => update('price', e.target.value)} required min="0" />
          </div>
          <div className="input-group">
            <label>{t('productStock')}</label>
            <input className="input" type="number" placeholder="10" value={form.stock} onChange={e => update('stock', e.target.value)} min="0" />
          </div>
        </div>

        <div className="input-group">
          <label>{t('productCategory')}</label>
          <select className="input" value={form.category} onChange={e => update('category', e.target.value)}>
            <option value="">— Choisir —</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="input-group">
          <label>{t('productDescription')}</label>
          <textarea className="input" rows={3} placeholder="Décrivez votre produit..." value={form.description} onChange={e => update('description', e.target.value)} style={{ resize: 'vertical' }} />
        </div>

        <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
          {loading ? t('loading') : t('save')}
        </button>
      </form>
    </div>
  );
}
