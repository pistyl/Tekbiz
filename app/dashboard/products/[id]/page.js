'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n';
import { getSession } from '@/lib/auth';
import { IconArrowLeft, IconCheck } from '@/lib/icons';

const categories = [
  'Mode & Vêtements', 'Électronique', 'Alimentation', 'Beauté & Cosmétiques',
  'Maison & Déco', 'Sport', 'Bijoux & Accessoires', 'Services', 'Autre'
];

export default function EditProductPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const params = useParams();
  const productId = params?.id;

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [form, setForm] = useState({ name: '', price: '', description: '', category: '', stock: '0' });

  useEffect(() => {
    async function loadProduct() {
      if (!productId) return;
      try {
        const res = await fetch(`/api/products?id=${productId}`);
        const data = await res.json();
        if (data.success && data.product) {
          const p = data.product;
          setForm({
            name: p.name || '',
            price: p.price?.toString() || '',
            description: p.description || '',
            category: p.category || '',
            stock: p.quantity?.toString() || '0'
          });
          if (p.images && p.images.length > 0) {
            setImageUrl(p.images[0]);
          }
        } else {
          alert('Produit introuvable');
          router.replace('/dashboard/products');
        }
      } catch (err) {
        console.error(err);
        alert('Erreur lors du chargement du produit');
      } finally {
        setFetching(false);
      }
    }
    loadProduct();
  }, [productId, router]);

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

    try {
      const res = await fetch('/api/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: productId,
          ...form,
          images: imageUrl ? [imageUrl] : []
        })
      });
      const result = await res.json();
      if (result.success) {
        router.push('/dashboard/products');
      } else {
        alert(result.error || 'Erreur lors de la modification');
      }
    } catch (err) {
      console.error(err);
      alert('Erreur réseau lors de la modification');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Voulez-vous vraiment supprimer ce produit ?')) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/products?id=${productId}`, {
        method: 'DELETE'
      });
      const result = await res.json();
      if (result.success) {
        router.push('/dashboard/products');
      } else {
        alert(result.error || 'Erreur lors de la suppression');
      }
    } catch (err) {
      console.error(err);
      alert('Erreur réseau lors de la suppression');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-tertiary)' }}>Chargement...</div>;
  }

  return (
    <div style={{ padding: 16 }}>
      {/* Back Link */}
      <div style={{ marginBottom: 16 }}>
        <Link href="/dashboard/products" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          <IconArrowLeft size={16} /> {t('backToProducts')}
        </Link>
      </div>

      <h3>Modifier le produit</h3>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 16 }}>
        {/* Photo Upload Container */}
        <input 
          type="file" 
          id="product-photo" 
          accept="image/*" 
          onChange={handleImageUpload} 
          style={{ display: 'none' }} 
        />
        <label 
          htmlFor="product-photo" 
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

        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
          <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={loading || uploading}>
            {loading ? t('loading') : t('save')}
          </button>
          <button type="button" onClick={handleDelete} className="btn btn-danger" style={{ flex: 1 }} disabled={loading || uploading}>
            Supprimer
          </button>
        </div>
      </form>
    </div>
  );
}
