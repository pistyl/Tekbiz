'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { IconStore, IconMapPin, IconTag, IconShoppingBag, IconShoppingCart, IconClipboard, IconCheckCircle, IconWave, IconCreditCard } from '@/lib/icons';

function formatCFA(n) { return new Intl.NumberFormat('fr-FR').format(n); }

const bgColors = ['#FEF3C7', '#DBEAFE', '#D1FAE5', '#FCE7F3', '#E0E7FF', '#FEE2E2'];

export default function ShopPage() {
  const params = useParams();
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderDone, setOrderDone] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [checkoutForm, setCheckoutForm] = useState({ name: '', phone: '', address: '', payment: 'wave' });

  useEffect(() => {
    async function loadShop() {
      if (params?.slug) {
        try {
          const res = await fetch(`/api/shop/${params.slug}`);
          const result = await res.json();
          if (result.success) {
            setStore(result.store);
            setProducts(result.products || []);
          }
        } catch (error) {
          console.error('Failed to load shop:', error);
        }
      }
      setLoading(false);
    }
    loadShop();
  }, [params]);

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...product, qty: 1 }];
    });
    setSelectedProduct(null);
  };

  const removeFromCart = (id) => setCart(prev => prev.filter(i => i.id !== id));
  const updateQty = (id, delta) => setCart(prev => prev.map(i => i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i));
  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  const handleOrder = async (e) => {
    e.preventDefault();
    if (!store?.id) return;
    setOrderLoading(true);

    try {
      const res = await fetch('/api/payments/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeId: store.id,
          customerName: checkoutForm.name,
          customerPhone: checkoutForm.phone,
          customerAddress: checkoutForm.address,
          paymentMethod: checkoutForm.payment,
          items: cart.map(item => ({
            productId: item.id,
            price: item.price,
            quantity: item.qty
          }))
        })
      });
      const result = await res.json();
      if (result.success && result.redirectUrl) {
        window.location.href = result.redirectUrl;
      } else {
        alert(result.error || 'Erreur lors de la commande');
      }
    } catch (err) {
      console.error(err);
      alert('Une erreur de connexion est survenue');
    } finally {
      setOrderLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
        Chargement de la boutique...
      </div>
    );
  }

  if (!store) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-secondary)', flexDirection: 'column', gap: 12 }}>
        <IconStore size={48} color="var(--text-tertiary)" />
        <h3>Boutique introuvable</h3>
        <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>Cette boutique n'existe pas ou a été désactivée.</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-secondary)' }}>
      {/* Store Header */}
      <div 
        style={{ 
          background: store.banner ? `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${store.banner}) center/cover no-repeat` : 'var(--gradient-primary)', 
          padding: 'calc(env(safe-area-inset-top, 0px) + 24px) 16px 32px', 
          textAlign: 'center', 
          color: 'white' 
        }}
      >
        <div 
          style={{ 
            width: 64, 
            height: 64, 
            borderRadius: 'var(--radius-xl)', 
            background: 'rgba(255,255,255,0.2)', 
            backdropFilter: 'blur(8px)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            margin: '0 auto 12px', 
            border: '2px solid rgba(255,255,255,0.3)',
            overflow: 'hidden'
          }}
        >
          {store.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={store.logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <IconStore size={28} color="white" />
          )}
        </div>
        <h2 style={{ fontSize: '1.5rem', marginBottom: 4 }}>{store.name}</h2>
        <p style={{ fontSize: '0.8125rem', opacity: 0.8 }}>{store.description || 'Bienvenue dans notre boutique'}</p>
        <div style={{ marginTop: 8, display: 'inline-flex', gap: 8, alignItems: 'center', background: 'rgba(255,255,255,0.15)', borderRadius: 'var(--radius-full)', padding: '4px 12px', fontSize: '0.6875rem', fontWeight: 600 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}><IconMapPin size={10} /> {store.address || 'Sénégal'}</span>
          <span>·</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}><IconTag size={10} /> {store.category || 'Général'}</span>
        </div>
      </div>

      {/* Products */}
      <div style={{ padding: 16 }}>
        <h4 style={{ marginBottom: 12 }}>Nos produits ({products.length})</h4>
        <div className="product-grid">
          {products.map((p, i) => (
            <div key={p.id} className="product-card" onClick={() => setSelectedProduct(p)} style={{ cursor: 'pointer' }}>
              <div className="product-card-img" style={{ background: bgColors[i % bgColors.length], display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', overflow: 'hidden', position: 'relative' }}>
                {p.images && p.images.length > 0 ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.images[0]} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <IconShoppingBag size={36} />
                )}
              </div>
              <div className="product-card-body">
                <div className="product-card-name">{p.name}</div>
                <div className="product-card-price">{formatCFA(p.price)} F</div>
              </div>
            </div>
          ))}
        </div>

        {products.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--text-tertiary)' }}>
            Aucun produit disponible pour le moment.
          </div>
        )}
      </div>

      {/* Floating Cart Button */}
      {cart.length > 0 && !showCart && !selectedProduct && !showCheckout && !orderDone && (
        <div style={{ position: 'fixed', bottom: 20, left: 16, right: 16, zIndex: 50 }}>
          <button onClick={() => setShowCart(true)} className="btn btn-primary btn-full btn-lg" style={{ justifyContent: 'space-between', fontSize: '0.9375rem', gap: 8 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><IconShoppingCart size={18} /> Panier ({cartCount})</span>
            <span>{formatCFA(cartTotal)} F</span>
          </button>
        </div>
      )}

      {/* Product Detail */}
      {selectedProduct && (
        <>
          <div className="modal-overlay" onClick={() => setSelectedProduct(null)} />
          <div className="bottom-sheet">
            <div className="bottom-sheet-handle" />
            <div style={{ width: '100%', height: 200, background: bgColors[products.indexOf(selectedProduct) % bgColors.length], borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, color: '#94a3b8', overflow: 'hidden', position: 'relative' }}>
              {selectedProduct.images && selectedProduct.images.length > 0 ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={selectedProduct.images[0]} alt={selectedProduct.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <IconShoppingBag size={64} />
              )}
            </div>
            <h3 style={{ marginBottom: 4 }}>{selectedProduct.name}</h3>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)', marginBottom: 12 }}>{formatCFA(selectedProduct.price)} F</div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: 20 }}>{selectedProduct.description || 'Aucune description disponible'}</p>
            <button onClick={() => addToCart(selectedProduct)} className="btn btn-primary btn-full btn-lg" style={{ gap: 8 }}>
              <IconShoppingCart size={18} /> Ajouter au panier
            </button>
          </div>
        </>
      )}

      {/* Cart Sheet */}
      {showCart && (
        <>
          <div className="modal-overlay" onClick={() => setShowCart(false)} />
          <div className="bottom-sheet">
            <div className="bottom-sheet-handle" />
            <h4 style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><IconShoppingCart size={18} /> Panier ({cartCount} articles)</h4>
            {cart.map(item => (
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border-light)' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{item.name}</div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--primary)', fontWeight: 700 }}>{formatCFA(item.price)} F</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button onClick={() => updateQty(item.id, -1)} className="btn btn-ghost btn-sm" style={{ width: 28, height: 28, padding: 0, borderRadius: 'var(--radius-full)', border: '1px solid var(--border)' }}>−</button>
                  <span style={{ fontWeight: 700, minWidth: 20, textAlign: 'center' }}>{item.qty}</span>
                  <button onClick={() => updateQty(item.id, 1)} className="btn btn-ghost btn-sm" style={{ width: 28, height: 28, padding: 0, borderRadius: 'var(--radius-full)', border: '1px solid var(--border)' }}>+</button>
                </div>
                <button onClick={() => removeFromCart(item.id)} style={{ color: 'var(--danger)', fontSize: '1.125rem' }}>✕</button>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0 20px', fontWeight: 700, fontSize: '1.125rem' }}>
              <span>Total</span>
              <span style={{ color: 'var(--primary)' }}>{formatCFA(cartTotal)} F</span>
            </div>
            <button onClick={() => { setShowCart(false); setShowCheckout(true); }} className="btn btn-primary btn-full btn-lg">
              Commander →
            </button>
          </div>
        </>
      )}

      {/* Checkout Sheet */}
      {showCheckout && (
        <>
          <div className="modal-overlay" onClick={() => setShowCheckout(false)} />
          <div className="bottom-sheet">
            <div className="bottom-sheet-handle" />
            <h4 style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><IconClipboard size={18} /> Finaliser la commande</h4>
            <form onSubmit={handleOrder} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="input-group">
                <label>Nom complet</label>
                <input className="input" placeholder="Votre nom" value={checkoutForm.name} onChange={e => setCheckoutForm(p => ({ ...p, name: e.target.value }))} required />
              </div>
              <div className="input-group">
                <label>Téléphone</label>
                <input className="input" type="tel" placeholder="+221 7X XXX XX XX" value={checkoutForm.phone} onChange={e => setCheckoutForm(p => ({ ...p, phone: e.target.value }))} required />
              </div>
              <div className="input-group">
                <label>Adresse de livraison</label>
                <input className="input" placeholder="Quartier, Ville" value={checkoutForm.address} onChange={e => setCheckoutForm(p => ({ ...p, address: e.target.value }))} required />
              </div>
              <div className="input-group">
                <label>Payer avec</label>
                <div style={{ display: 'flex', gap: 10 }}>
                  {[{ key: 'wave', label: 'Wave', icon: <IconWave size={16} />, bg: '#EFF6FF' }, { key: 'orange_money', label: 'Orange Money', icon: <IconCreditCard size={16} />, bg: '#FFF7ED' }].map(m => (
                    <button key={m.key} type="button" onClick={() => setCheckoutForm(p => ({ ...p, payment: m.key }))}
                      style={{ flex: 1, padding: '14px 8px', borderRadius: 'var(--radius-md)', border: `2px solid ${checkoutForm.payment === m.key ? 'var(--primary)' : 'var(--border)'}`, background: checkoutForm.payment === m.key ? m.bg : 'var(--bg)', fontSize: '0.8125rem', fontWeight: 600, transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                      {m.icon} {m.label}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', padding: 14, display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                <span>Total à payer</span>
                <span style={{ color: 'var(--primary)', fontSize: '1.125rem' }}>{formatCFA(cartTotal)} F</span>
              </div>
              <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={orderLoading}>
                {orderLoading ? 'Traitement en cours...' : `Payer ${formatCFA(cartTotal)} F →`}
              </button>
            </form>
          </div>
        </>
      )}

      {/* Order Confirmation */}
      {orderDone && (
        <>
          <div className="modal-overlay" onClick={() => setOrderDone(false)} />
          <div className="bottom-sheet" style={{ textAlign: 'center' }}>
            <div className="bottom-sheet-handle" />
            <div style={{ marginBottom: 12, color: 'var(--success)', display: 'flex', justifyContent: 'center' }}>
              <IconCheckCircle size={64} />
            </div>
            <h3 style={{ marginBottom: 8 }}>Commande confirmée !</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 16 }}>
              Votre commande a été envoyée au vendeur. Vous serez contacté pour la livraison.
            </p>
            <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', padding: 14, marginBottom: 20, fontWeight: 700, fontSize: '1.125rem', color: 'var(--primary)' }}>
              {orderNumber}
            </div>
            <button onClick={() => setOrderDone(false)} className="btn btn-primary btn-full">
              Continuer mes achats
            </button>
          </div>
        </>
      )}

      {/* Footer */}
      <div style={{ textAlign: 'center', padding: '24px 16px 32px', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
        Propulsé par <span style={{ fontWeight: 700, background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>TEKBIZ</span>
      </div>
    </div>
  );
}
