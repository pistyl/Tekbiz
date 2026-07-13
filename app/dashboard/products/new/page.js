'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n';
import { getSession } from '@/lib/auth';

const categories = ['Mode & Vêtements', 'Électronique', 'Alimentation', 'Beauté & Cosmétiques', 'Maison & Déco', 'Bijoux & Accessoires', 'Autre'];

export default function NewProductPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [form, setForm] = useState({ name: '', price: '', description: '', category: '', stock: '1' });
  const [storeDetail, setStoreDetail] = useState(null);
  const [productsCount, setProductsCount] = useState(0);

  useEffect(() => {
    async function checkLimits() {
      const session = getSession();
      if (session?.store?.id) {
        try {
          const [storeRes, prodRes] = await Promise.all([
            fetch(`/api/store?storeId=${session.store.id}`).then(res => res.json()),
            fetch(`/api/products?storeId=${session.store.id}`).then(res => res.json())
          ]);
          if (storeRes.success) setStoreDetail(storeRes.store);
          if (prodRes.success) setProductsCount(prodRes.products.length);
        } catch (e) {
          console.error(e);
        }
      }
    }
    checkLimits();
  }, []);

  const isExpired = storeDetail?.plan === 'PRO' && 
                    storeDetail?.subscriptionEnd && 
                    new Date() > new Date(storeDetail.subscriptionEnd);
  
  const isFreeLimit = storeDetail?.plan === 'FREE' && productsCount >= 5;

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

  const handleImageUpload = async (e) => {
    let file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      file = await compressImage(file, 600, 600, 0.8);
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const result = await res.json();
      if (result.success) {
        setImageUrl(result.url);
      } else {
        alert(result.error || 'Erreur lors de l\'upload de l\'image');
      }
    } catch (err) {
      console.error(err);
      alert('Erreur réseau lors de l\'upload');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const session = getSession();
    if (!session?.store?.id) {
      alert('Boutique introuvable');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          images: imageUrl ? [imageUrl] : [],
          storeId: session.store.id
        })
      });
      const result = await res.json();
      if (result.success) {
        router.push('/dashboard/products');
      } else {
        alert(result.error || 'Erreur lors de la création du produit');
      }
    } catch (err) {
      console.error(err);
      alert('Une erreur réseau est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <button onClick={() => router.back()} className="btn btn-ghost btn-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        <h3>{t('newProduct')}</h3>
      </div>

      {(isExpired || isFreeLimit) && (
        <div style={{ 
          background: isExpired ? '#FEE2E2' : '#EFF6FF', 
          border: `1.5px solid ${isExpired ? '#FCA5A5' : '#BFDBFE'}`, 
          borderRadius: 'var(--radius-lg)', 
          padding: '16px', 
          marginBottom: 20, 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 10 
        }}>
          <h4 style={{ color: isExpired ? '#991B1B' : '#1E40AF', margin: 0, fontWeight: 700 }}>
            {isExpired ? 'Action requise : Abonnement expiré' : 'Plan Gratuit : Limite atteinte'}
          </h4>
          <p style={{ color: isExpired ? '#7F1D1D' : '#1E3A8A', fontSize: '0.8125rem', margin: 0 }}>
            {isExpired 
              ? 'Votre abonnement Pro a expiré. Vous devez le renouveler pour pouvoir ajouter de nouveaux produits.' 
              : 'Vous avez atteint la limite de 5 produits autorisés pour le plan gratuit. Veuillez passer au plan Pro pour ajouter plus de produits.'}
          </p>
          <Link href="/dashboard/store" className="btn" style={{ background: isExpired ? '#DC2626' : '#3B82F6', color: 'white', alignSelf: 'flex-start', padding: '8px 16px', fontSize: '0.8125rem', fontWeight: 700 }}>
            {isExpired ? 'Renouveler mon abonnement' : 'Passer au plan Pro'}
          </Link>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16, opacity: (isExpired || isFreeLimit) ? 0.5 : 1, pointerEvents: (isExpired || isFreeLimit) ? 'none' : 'auto' }}>
        {/* Photo Upload */}
        <input 
          type="file" 
          accept="image/*" 
          id="product-photo-upload" 
          onChange={handleImageUpload} 
          style={{ opacity: 0, position: 'absolute', zIndex: -1, width: 0, height: 0 }} 
        />
        <label 
          htmlFor="product-photo-upload" 
          style={{ 
            width: '100%', 
            aspectRatio: '16/9', 
            background: 'var(--bg-tertiary)', 
            border: '2px dashed var(--border)', 
            borderRadius: 'var(--radius-lg)', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: 8, 
            cursor: 'pointer',
            overflow: 'hidden',
            position: 'relative'
          }}
        >
          {uploading ? (
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>Upload en cours...</span>
          ) : imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img 
              src={imageUrl} 
              alt="Aperçu du produit" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
          ) : (
            <>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>{t('addPhoto')}</span>
            </>
          )}
        </label>

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

        <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading || uploading}>
          {loading ? t('loading') : t('save')}
        </button>
      </form>
    </div>
  );
}
