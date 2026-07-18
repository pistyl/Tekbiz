'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n';
import { 
  IconStore, IconMapPin, IconTag, IconShoppingBag, IconShoppingCart, 
  IconClipboard, IconCheckCircle, IconWaveLogo, IconOrangeMoneyLogo, 
  IconSearch, IconChevronDown 
} from '@/lib/icons';
import { getSession } from '@/lib/auth';
import PhoneInput from 'react-phone-number-input';

function formatCFA(n) { 
  return new Intl.NumberFormat('fr-FR').format(n); 
}

const bgColors = ['#FEF3C7', '#DBEAFE', '#D1FAE5', '#FCE7F3', '#E0E7FF', '#FEE2E2'];

export default function DashboardMarketplacePage() {
  const { t } = useLanguage();
  
  // Data states
  const [products, setProducts] = useState([]);
  const [stores, setStores] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter/Sort states
  const [search, setSearch] = useState('');
  const [selectedStore, setSelectedStore] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // newest, price_asc, price_desc
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Cart & checkout states
  const [cart, setCart] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderDone, setOrderDone] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderNumbers, setOrderNumbers] = useState([]);
  const [checkoutForm, setCheckoutForm] = useState({ name: '', phone: '', address: '', payment: 'delivery' });

  // Load marketplace data
  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/marketplace');
        const data = await res.json();
        if (data.success) {
          setProducts(data.products || []);
          setStores(data.stores || []);
          setCategories(data.categories || []);
        }
      } catch (error) {
        console.error('Failed to load marketplace data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Pre-fill user data from session
  useEffect(() => {
    const s = getSession();
    if (s) {
      setCheckoutForm(prev => ({
        ...prev,
        name: s.name || '',
        phone: s.phone || '',
        address: s.store?.address || ''
      }));
    }
  }, []);

  // Cart actions
  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) {
        return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { 
        id: product.id,
        name: product.name,
        price: product.price,
        images: product.images,
        storeId: product.store.id,
        storeName: product.store.name,
        qty: 1
      }];
    });
    setSelectedProduct(null);
  };

  const handleBuyNow = (product) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) {
        return prev;
      }
      return [...prev, { 
        id: product.id,
        name: product.name,
        price: product.price,
        images: product.images,
        storeId: product.store.id,
        storeName: product.store.name,
        qty: 1
      }];
    });
    setSelectedProduct(null);
    setShowCheckout(true);
  };

  const removeFromCart = (id) => setCart(prev => prev.filter(i => i.id !== id));
  const updateQty = (id, delta) => setCart(prev => prev.map(i => i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i));
  
  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  // Group items by store for cart grouping rendering
  const getCartByStore = () => {
    const grouped = {};
    cart.forEach(item => {
      if (!grouped[item.storeId]) {
        grouped[item.storeId] = {
          storeName: item.storeName,
          items: []
        };
      }
      grouped[item.storeId].items.push(item);
    });
    return grouped;
  };

  const cartGrouped = getCartByStore();
  const hasMultipleStoresInCart = Object.keys(cartGrouped).length > 1;

  // Checkout submission
  const handleOrder = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return;
    setOrderLoading(true);

    const itemsByStore = {};
    cart.forEach(item => {
      if (!itemsByStore[item.storeId]) {
        itemsByStore[item.storeId] = [];
      }
      itemsByStore[item.storeId].push(item);
    });

    const storeIds = Object.keys(itemsByStore);
    const isDelivery = checkoutForm.payment === 'delivery';

    try {
      if (isDelivery) {
        // Parallel orders for COD
        const orderPromises = storeIds.map(async (sid) => {
          const storeItems = itemsByStore[sid];
          const res = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              storeId: sid,
              customerName: checkoutForm.name,
              customerPhone: checkoutForm.phone,
              customerAddress: checkoutForm.address,
              paymentMethod: 'delivery',
              items: storeItems.map(item => ({
                productId: item.id,
                price: item.price,
                quantity: item.qty
              }))
            })
          });
          return res.json();
        });

        const results = await Promise.all(orderPromises);
        const successfulOrders = results.filter(r => r.success && r.order);
        
        if (successfulOrders.length === storeIds.length) {
          const nums = successfulOrders.map(o => o.order.orderNumber);
          setOrderNumbers(nums);
          setCart([]);
          setShowCheckout(false);
          setOrderDone(true);
        } else {
          const errors = results.map(r => r.error).filter(Boolean).join(', ');
          alert(errors || 'Erreur lors de la validation des commandes');
        }
      } else {
        // Online Payment via UnitechPay redirect
        const firstStoreId = storeIds[0];
        const firstStoreItems = itemsByStore[firstStoreId];
        const otherStoreIds = storeIds.slice(1);

        // COD orders for secondary stores if multi-store cart
        if (otherStoreIds.length > 0) {
          const otherPromises = otherStoreIds.map(async (sid) => {
            const storeItems = itemsByStore[sid];
            return fetch('/api/orders', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                storeId: sid,
                customerName: checkoutForm.name,
                customerPhone: checkoutForm.phone,
                customerAddress: checkoutForm.address,
                paymentMethod: 'delivery',
                items: storeItems.map(item => ({
                  productId: item.id,
                  price: item.price,
                  quantity: item.qty
                }))
              })
            }).then(r => r.json());
          });
          await Promise.all(otherPromises);
        }

        // Online checkout redirect for primary store
        const res = await fetch('/api/payments/initiate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            storeId: firstStoreId,
            customerName: checkoutForm.name,
            customerPhone: checkoutForm.phone,
            customerAddress: checkoutForm.address,
            paymentMethod: checkoutForm.payment,
            items: firstStoreItems.map(item => ({
              productId: item.id,
              price: item.price,
              quantity: item.qty
            }))
          })
        });
        const result = await res.json();
        if (result.success && result.redirectUrl) {
          setCart([]);
          window.location.href = result.redirectUrl;
        } else {
          alert(result.error || 'Erreur lors de la commande en ligne');
        }
      }
    } catch (err) {
      console.error(err);
      alert('Une erreur est survenue lors de la communication avec le serveur');
    } finally {
      setOrderLoading(false);
    }
  };

  // Client-side filtering logic
  const filteredProducts = products.filter(p => {
    const matchesSearch = !search || 
      p.name.toLowerCase().includes(search.toLowerCase()) || 
      (p.description && p.description.toLowerCase().includes(search.toLowerCase())) ||
      p.store.name.toLowerCase().includes(search.toLowerCase());
    
    const matchesStore = !selectedStore || p.storeId === selectedStore;
    const matchesCategory = !selectedCategory || p.category === selectedCategory;
    const matchesMinPrice = minPrice === '' || minPrice === null || p.price >= parseInt(minPrice);
    const matchesMaxPrice = maxPrice === '' || maxPrice === null || p.price <= parseInt(maxPrice);
    
    return matchesSearch && matchesStore && matchesCategory && matchesMinPrice && matchesMaxPrice;
  });

  // Client-side sorting logic
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price_asc') return a.price - b.price;
    if (sortBy === 'price_desc') return b.price - a.price;
    return new Date(b.createdAt) - new Date(a.createdAt); // newest
  });

  return (
    <div style={{ padding: 16, background: 'var(--bg-secondary)', minHeight: 'calc(100vh - var(--nav-height) - var(--bottom-nav-height))' }}>
      {/* Styles local inject */}
      <style dangerouslySetInnerHTML={{ __html: `
        .search-container {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 8px 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
          box-shadow: var(--shadow-sm);
        }
        .search-input {
          border: none;
          background: transparent;
          flex: 1;
          outline: none;
          font-size: 0.9375rem;
          color: var(--text);
        }
        .category-scroll {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding: 4px 0 12px;
          margin-bottom: 12px;
          scrollbar-width: none;
        }
        .category-scroll::-webkit-scrollbar {
          display: none;
        }
        .category-pill {
          padding: 8px 16px;
          border-radius: var(--radius-full);
          font-size: 0.8125rem;
          font-weight: 600;
          background: var(--surface);
          border: 1px solid var(--border);
          color: var(--text-secondary);
          white-space: nowrap;
          cursor: pointer;
          transition: all 0.2s;
        }
        .category-pill.active {
          background: var(--primary);
          border-color: var(--primary);
          color: white;
        }
        .marketplace-hero {
          background: var(--gradient-hero);
          color: white;
          padding: 32px 16px;
          text-align: center;
          position: relative;
          overflow: hidden;
          margin-bottom: 20px;
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-md);
        }
        .marketplace-hero h2 {
          font-size: 1.75rem;
          font-weight: 900;
          font-family: var(--font-display);
          margin-bottom: 6px;
          color: white;
        }
        .marketplace-hero p {
          font-size: 0.875rem;
          opacity: 0.9;
          max-width: 500px;
          margin: 0 auto;
        }
        .filter-select {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 10px 14px;
          font-size: 0.8125rem;
          font-weight: 600;
          color: var(--text-secondary);
          outline: none;
          cursor: pointer;
        }
        .product-store-link {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 6px;
          margin-bottom: 6px;
          font-size: 0.75rem;
          color: var(--text-secondary);
          font-weight: 550;
        }
        .product-store-logo {
          width: 16px;
          height: 16px;
          border-radius: 4px;
          background: var(--primary-glow);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.5rem;
          color: var(--primary);
          font-weight: 700;
          overflow: hidden;
        }
        .cart-store-group {
          margin-bottom: 16px;
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          overflow: hidden;
          background: var(--surface);
        }
        .cart-store-header {
          background: var(--bg-secondary);
          padding: 10px 12px;
          font-size: 0.8125rem;
          font-weight: 700;
          border-bottom: 1px solid var(--border);
          color: var(--primary);
          display: flex;
          align-items: center;
          gap: 6px;
        }
        
        /* Overrides to increase image size in marketplace */
        .product-grid {
          grid-template-columns: repeat(2, 1fr) !important;
        }
        @media (min-width: 768px) {
          .product-grid {
            grid-template-columns: repeat(3, 1fr) !important;
          }
        }
        @media (min-width: 1024px) {
          .product-grid {
            grid-template-columns: repeat(3, 1fr) !important;
          }
        }
        .product-card-img {
          aspect-ratio: 4 / 5 !important;
        }
      `}} />

      {/* Hero Header */}
      <div className="marketplace-hero">
        <div className="gradient-glow-1" style={{ top: '0%', right: '10%' }} />
        <h2>{t('marketplace')}</h2>
        <p>{t('exploreProducts')}</p>
      </div>

      {/* Search Field */}
      <div className="search-container">
        <IconSearch size={18} color="var(--text-tertiary)" />
        <input 
          type="text" 
          className="search-input" 
          placeholder={t('searchPlaceholder')}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {search && (
          <button onClick={() => setSearch('')} style={{ color: 'var(--text-tertiary)', fontWeight: 'bold' }}>✕</button>
        )}
      </div>

      {/* Dynamic Category Scroll */}
      <div className="category-scroll">
        <button 
          onClick={() => setSelectedCategory('')} 
          className={`category-pill ${selectedCategory === '' ? 'active' : ''}`}
        >
          {t('filterCategory')}
        </button>
        {categories.map(cat => (
          <button 
            key={cat} 
            onClick={() => setSelectedCategory(cat)} 
            className={`category-pill ${selectedCategory === cat ? 'active' : ''}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Filters Toolbar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {/* Store select filter */}
          <select 
            value={selectedStore} 
            onChange={e => setSelectedStore(e.target.value)}
            className="filter-select"
          >
            <option value="">{t('allStores')}</option>
            {stores.map(st => (
              <option key={st.id} value={st.id}>{st.name}</option>
            ))}
          </select>

          {/* Sort Select */}
          <select 
            value={sortBy} 
            onChange={e => setSortBy(e.target.value)}
            className="filter-select"
          >
            <option value="newest">Plus récent</option>
            <option value="price_asc">Prix : Bas à Élevé</option>
            <option value="price_desc">Prix : Élevé à Bas</option>
          </select>
        </div>

        <button 
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className="btn btn-ghost"
          style={{ fontSize: '0.8125rem', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 4, background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          Filtres de prix <IconChevronDown size={14} style={{ transform: showAdvancedFilters ? 'rotate(180deg)' : 'none', transition: 'all 0.2s' }} />
        </button>
      </div>

      {/* Collapsing Advanced Filters panel */}
      {showAdvancedFilters && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 16, marginBottom: 20, display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Prix minimum (FCFA)</label>
            <input 
              type="number" 
              className="input" 
              style={{ padding: 8, height: 38 }}
              value={minPrice}
              onChange={e => setMinPrice(e.target.value)} 
              placeholder="Ex: 1000"
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Prix maximum (FCFA)</label>
            <input 
              type="number" 
              className="input" 
              style={{ padding: 8, height: 38 }}
              value={maxPrice}
              onChange={e => setMaxPrice(e.target.value)} 
              placeholder="Ex: 50000"
            />
          </div>
          <button 
            onClick={() => { setMinPrice(''); setMaxPrice(''); }}
            className="btn btn-ghost btn-sm"
            style={{ alignSelf: 'flex-end', height: 38 }}
          >
            Réinitialiser
          </button>
        </div>
      )}

      {/* Products Grid */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0', color: 'var(--text-secondary)' }}>
          Chargement de la marketplace...
        </div>
      ) : (
        <>
          <div className="product-grid">
            {sortedProducts.map((p, i) => (
              <div key={p.id} className="product-card" onClick={() => setSelectedProduct(p)} style={{ cursor: 'pointer' }}>
                <div className="product-card-img" style={{ background: bgColors[i % bgColors.length], display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', overflow: 'hidden', position: 'relative' }}>
                  {p.images && p.images.length > 0 ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.images[0]} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <IconShoppingBag size={36} />
                  )}
                  {p.category && (
                    <span style={{ position: 'absolute', top: 8, left: 8, background: 'rgba(0,0,0,0.6)', color: 'white', fontSize: '0.625rem', fontWeight: 700, padding: '2px 8px', borderRadius: '100px' }}>
                      {p.category}
                    </span>
                  )}
                </div>
                <div className="product-card-body">
                  <div className="product-card-name">{p.name}</div>
                  
                  {/* Link to Store */}
                  <div className="product-store-link">
                    <div className="product-store-logo">
                      {p.store.logo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.store.logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        p.store.name.substring(0, 1).toUpperCase()
                      )}
                    </div>
                    <span onClick={(e) => {
                      e.stopPropagation();
                      window.location.href = `/shop/${p.store.slug}`;
                    }} style={{ textDecoration: 'underline', cursor: 'pointer' }}>
                      {p.store.name}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                    <div className="product-card-price">{formatCFA(p.price)} F</div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(p);
                      }} 
                      className="btn btn-primary"
                      style={{ width: 28, height: 28, padding: 0, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <IconShoppingCart size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {sortedProducts.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 16px', color: 'var(--text-tertiary)' }}>
              Aucun produit ne correspond à vos filtres de recherche.
            </div>
          )}
        </>
      )}

      {/* Floating Bottom Cart trigger - positioned ABOVE the bottom navigation bar */}
      {cart.length > 0 && !showCart && !selectedProduct && !showCheckout && !orderDone && (
        <div style={{ position: 'fixed', bottom: 'calc(var(--bottom-nav-height) + 16px)', left: 16, right: 16, zIndex: 50 }}>
          <button onClick={() => setShowCart(true)} className="btn btn-primary btn-full btn-lg" style={{ justifyContent: 'space-between', fontSize: '0.9375rem', gap: 8, boxShadow: 'var(--shadow-lg)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><IconShoppingCart size={18} /> Panier ({cartCount})</span>
            <span>{formatCFA(cartTotal)} F</span>
          </button>
        </div>
      )}

      {/* Product Detail Bottom Sheet */}
      {selectedProduct && (
        <>
          <div className="modal-overlay" onClick={() => setSelectedProduct(null)} />
          <div className="bottom-sheet" style={{ zIndex: 210 }}>
            <div className="bottom-sheet-handle" />
            <div style={{ width: '100%', height: 280, background: bgColors[products.indexOf(selectedProduct) % bgColors.length], borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, color: '#94a3b8', overflow: 'hidden', position: 'relative' }}>
              {selectedProduct.images && selectedProduct.images.length > 0 ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={selectedProduct.images[0]} alt={selectedProduct.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <IconShoppingBag size={64} />
              )}
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
              <h3>{selectedProduct.name}</h3>
              <span onClick={() => window.location.href = `/shop/${selectedProduct.store.slug}`} style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4, background: 'var(--bg-secondary)', padding: '4px 10px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 600 }}>
                <IconStore size={12} /> {selectedProduct.store.name}
              </span>
            </div>

            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)', marginBottom: 12 }}>
              {formatCFA(selectedProduct.price)} F
            </div>
            
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: 20 }}>
              {selectedProduct.description || 'Aucune description disponible.'}
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button onClick={() => handleBuyNow(selectedProduct)} className="btn btn-primary btn-full btn-lg" style={{ gap: 8 }}>
                <IconClipboard size={18} /> Commander directement
              </button>
              <button onClick={() => addToCart(selectedProduct)} className="btn btn-secondary btn-full btn-lg" style={{ gap: 8 }}>
                <IconShoppingCart size={18} /> Ajouter au panier
              </button>
            </div>
          </div>
        </>
      )}

      {/* Cart Bottom Sheet */}
      {showCart && (
        <>
          <div className="modal-overlay" onClick={() => setShowCart(false)} />
          <div className="bottom-sheet" style={{ maxHeight: '80vh', overflowY: 'auto', zIndex: 210 }}>
            <div className="bottom-sheet-handle" />
            <h4 style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <IconShoppingCart size={18} /> Panier ({cartCount} articles)
            </h4>

            {/* Display Items Grouped by Store */}
            {Object.keys(cartGrouped).map(storeId => {
              const group = cartGrouped[storeId];
              return (
                <div key={storeId} className="cart-store-group">
                  <div className="cart-store-header">
                    <IconStore size={14} /> {group.storeName}
                  </div>
                  <div style={{ padding: '0 12px' }}>
                    {group.items.map(item => (
                      <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--border-light)' }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{item.name}</div>
                          <div style={{ fontSize: '0.8125rem', color: 'var(--primary)', fontWeight: 700 }}>{formatCFA(item.price)} F</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <button onClick={() => updateQty(item.id, -1)} className="btn btn-ghost btn-sm" style={{ width: 28, height: 28, padding: 0, borderRadius: '50%', border: '1px solid var(--border)' }}>−</button>
                          <span style={{ fontWeight: 700, minWidth: 20, textAlign: 'center' }}>{item.qty}</span>
                          <button onClick={() => updateQty(item.id, 1)} className="btn btn-ghost btn-sm" style={{ width: 28, height: 28, padding: 0, borderRadius: '50%', border: '1px solid var(--border)' }}>+</button>
                        </div>
                        <button onClick={() => removeFromCart(item.id)} style={{ color: 'var(--danger)', fontSize: '1.125rem', paddingLeft: 8 }}>✕</button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {hasMultipleStoresInCart && (
              <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', color: '#1E40AF', borderRadius: 'var(--radius-md)', padding: 12, fontSize: '0.75rem', lineHeight: 1.5, marginBottom: 16 }}>
                💡 <strong>Panier Multi-Boutiques :</strong> {t('cartSplitNotice')}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0 20px', fontWeight: 700, fontSize: '1.125rem' }}>
              <span>Total global</span>
              <span style={{ color: 'var(--primary)' }}>{formatCFA(cartTotal)} F</span>
            </div>

            <button onClick={() => { setShowCart(false); setShowCheckout(true); }} className="btn btn-primary btn-full btn-lg">
              Commander →
            </button>
          </div>
        </>
      )}

      {/* Checkout Bottom Sheet */}
      {showCheckout && (
        <>
          <div className="modal-overlay" onClick={() => setShowCheckout(false)} />
          <div className="bottom-sheet" style={{ maxHeight: '80vh', overflowY: 'auto', zIndex: 210 }}>
            <div className="bottom-sheet-handle" />
            <h4 style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <IconClipboard size={18} /> Finaliser la commande
            </h4>

            <form onSubmit={handleOrder} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="input-group">
                <label>Nom complet</label>
                <input className="input" placeholder="Votre nom" value={checkoutForm.name} onChange={e => setCheckoutForm(p => ({ ...p, name: e.target.value }))} required />
              </div>
              <div className="input-group">
                <label>Téléphone</label>
                <PhoneInput
                  international
                  defaultCountry="SN"
                  placeholder="+221 7X XXX XX XX"
                  value={checkoutForm.phone}
                  onChange={val => setCheckoutForm(p => ({ ...p, phone: val || '' }))}
                  required
                />
              </div>
              <div className="input-group">
                <label>Adresse de livraison</label>
                <input className="input" placeholder="Quartier, Ville" value={checkoutForm.address} onChange={e => setCheckoutForm(p => ({ ...p, address: e.target.value }))} required />
              </div>
              
              <div className="input-group">
                <label>Moyen de paiement</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <button type="button" onClick={() => setCheckoutForm(p => ({ ...p, payment: 'delivery' }))}
                    style={{ 
                      width: '100%', 
                      padding: '14px 12px', 
                      borderRadius: 'var(--radius-md)', 
                      border: `2px solid ${checkoutForm.payment === 'delivery' ? 'var(--primary)' : 'var(--border)'}`, 
                      background: checkoutForm.payment === 'delivery' ? '#EFF6FF' : 'var(--surface)', 
                      fontSize: '0.875rem', 
                      fontWeight: 650, 
                      transition: 'all 0.2s', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 10,
                      color: checkoutForm.payment === 'delivery' ? 'var(--primary)' : 'var(--text)'
                    }}>
                    <IconClipboard size={18} /> À la livraison
                  </button>
                  <button type="button" onClick={() => setCheckoutForm(p => ({ ...p, payment: 'wave' }))}
                    style={{ 
                      width: '100%', 
                      padding: '14px 12px', 
                      borderRadius: 'var(--radius-md)', 
                      border: `2px solid ${checkoutForm.payment === 'wave' ? '#00A3E0' : 'var(--border)'}`, 
                      background: checkoutForm.payment === 'wave' ? '#EFF6FF' : 'var(--surface)', 
                      fontSize: '0.875rem', 
                      fontWeight: 650, 
                      transition: 'all 0.2s', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 10,
                      color: checkoutForm.payment === 'wave' ? '#00A3E0' : 'var(--text)'
                    }}>
                    <IconWaveLogo size={18} /> Wave
                  </button>
                  <button type="button" onClick={() => setCheckoutForm(p => ({ ...p, payment: 'orange_money' }))}
                    style={{ 
                      width: '100%', 
                      padding: '14px 12px', 
                      borderRadius: 'var(--radius-md)', 
                      border: `2px solid ${checkoutForm.payment === 'orange_money' ? '#FF6600' : 'var(--border)'}`, 
                      background: checkoutForm.payment === 'orange_money' ? '#FFF7ED' : 'var(--surface)', 
                      fontSize: '0.875rem', 
                      fontWeight: 650, 
                      transition: 'all 0.2s', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 10,
                      color: checkoutForm.payment === 'orange_money' ? '#FF6600' : 'var(--text)'
                    }}>
                    <IconOrangeMoneyLogo size={18} /> Orange Money
                  </button>
                </div>
              </div>

              {checkoutForm.payment !== 'delivery' && hasMultipleStoresInCart && (
                <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', color: '#B45309', borderRadius: 'var(--radius-md)', padding: 12, fontSize: '0.75rem', lineHeight: 1.4 }}>
                  ⚠️ Le paiement en ligne par Wave / OM sera initié pour la première boutique ({Object.values(cartGrouped)[0]?.storeName}). Les articles des autres boutiques seront validés avec paiement à la livraison.
                </div>
              )}

              <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', padding: 14, display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                <span>Total de la commande</span>
                <span style={{ color: 'var(--primary)', fontSize: '1.125rem' }}>{formatCFA(cartTotal)} F</span>
              </div>
              
              <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={orderLoading}>
                {orderLoading ? 'Traitement en cours...' : `Valider ma commande ( ${formatCFA(cartTotal)} F ) →`}
              </button>
            </form>
          </div>
        </>
      )}

      {/* Order Confirmation Bottom Sheet */}
      {orderDone && (
        <>
          <div className="modal-overlay" onClick={() => setOrderDone(false)} />
          <div className="bottom-sheet" style={{ textAlign: 'center', zIndex: 210 }}>
            <div className="bottom-sheet-handle" />
            <div style={{ marginBottom: 12, color: 'var(--success)', display: 'flex', justifyContent: 'center' }}>
              <IconCheckCircle size={64} />
            </div>
            <h3 style={{ marginBottom: 8 }}>Commande validée !</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 16 }}>
              Vos commandes ont été enregistrées avec succès. Les vendeurs ont été notifiés et vous contacteront pour la livraison.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20 }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)' }}>Référence(s) de commande :</span>
              {orderNumbers.map(num => (
                <div key={num} style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', padding: 10, fontWeight: 700, fontSize: '1rem', color: 'var(--primary)' }}>
                  {num}
                </div>
              ))}
            </div>
            <button onClick={() => setOrderDone(false)} className="btn btn-primary btn-full">
              Continuer mes achats
            </button>
          </div>
        </>
      )}

      {/* Footer */}
      <div style={{ textAlign: 'center', padding: '40px 16px 0', fontSize: '0.75rem', color: 'var(--text-tertiary)', paddingBottom: 24 }}>
        Propulsé par <span style={{ fontWeight: 700, background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>TEKBIZ</span>
      </div>
    </div>
  );
}
