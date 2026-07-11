'use client';
import { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n';
import { getSession } from '@/lib/auth';
import { IconClipboard, IconWave, IconCreditCard, IconMessageCircle } from '@/lib/icons';

function formatCFA(n) { return new Intl.NumberFormat('fr-FR').format(n); }

function formatWhatsApp(phone) {
  let cleaned = phone.replace(/[^0-9]/g, '');
  if (!cleaned.startsWith('221')) {
    cleaned = '221' + cleaned;
  }
  return cleaned;
}

const statusColors = { 
  PENDING: 'warning', 
  CONFIRMED: 'info', 
  PREPARING: 'info', 
  READY: 'primary', 
  DELIVERED: 'success', 
  CANCELLED: 'danger' 
};

const tabs = ['allOrders', 'pending', 'confirmed', 'delivered', 'cancelled'];

export default function OrdersPage() {
  const { t } = useLanguage();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState('allOrders');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const loadOrders = async () => {
    const session = getSession();
    if (session?.store?.id) {
      try {
        const res = await fetch(`/api/orders?storeId=${session.store.id}`);
        const result = await res.json();
        if (result.success) {
          setOrders(result.orders || []);
        }
      } catch (error) {
        console.error('Failed to load orders:', error);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleUpdateStatus = async (orderId, newStatus, newPaymentStatus) => {
    setUpdating(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          status: newStatus,
          paymentStatus: newPaymentStatus
        })
      });
      const result = await res.json();
      if (result.success) {
        // Mettre à jour l'état local
        setOrders(prev => prev.map(o => o.id === orderId ? { 
          ...o, 
          status: newStatus, 
          ...(newPaymentStatus && { paymentStatus: newPaymentStatus }) 
        } : o));
        
        setSelectedOrder(prev => prev && prev.id === orderId ? { 
          ...prev, 
          status: newStatus, 
          ...(newPaymentStatus && { paymentStatus: newPaymentStatus }) 
        } : prev);
      } else {
        alert(result.error || 'Erreur lors de la mise à jour');
      }
    } catch (err) {
      console.error(err);
      alert('Une erreur réseau est survenue');
    } finally {
      setUpdating(false);
    }
  };

  const filtered = activeTab === 'allOrders' 
    ? orders 
    : orders.filter(o => o.status === activeTab.toUpperCase());

  return (
    <div style={{ padding: 16 }}>
      <h3 style={{ marginBottom: 16 }}>{t('orders')}</h3>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', marginBottom: 16, paddingBottom: 4 }}>
        {tabs.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`btn btn-sm ${activeTab === tab ? 'btn-primary' : 'btn-ghost'}`} style={{ whiteSpace: 'nowrap', fontSize: '0.75rem' }}>
            {t(tab)}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-tertiary)' }}>Chargement...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(order => (
            <div key={order.id} className="order-card" style={{ cursor: 'pointer', flexDirection: 'column', alignItems: 'stretch', gap: 10 }} onClick={() => setSelectedOrder(order)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.75rem', color: 'var(--text-secondary)', flexShrink: 0 }}>
                  {order.customerName.split(' ').map(n => n[0]).join('')}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{order.customerName}</div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)' }}>{order.orderNumber} · {order.items.length} {t('items')} · {new Date(order.createdAt).toLocaleDateString()}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{formatCFA(order.totalAmount)} F</div>
                  <span className={`badge badge-${statusColors[order.status]}`}>{t(order.status.toLowerCase())}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon"><IconClipboard size={36} /></div>
          <h4>{t('noOrders')}</h4>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{t('noOrdersDesc')}</p>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <>
          <div className="modal-overlay" onClick={() => setSelectedOrder(null)} />
          <div className="bottom-sheet">
            <div className="bottom-sheet-handle" />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h4>{t('orderDetails')}</h4>
              <span className={`badge badge-${statusColors[selectedOrder.status]}`}>{t(selectedOrder.status.toLowerCase())}</span>
            </div>

            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: 16 }}>{selectedOrder.orderNumber} · {new Date(selectedOrder.createdAt).toLocaleString()}</div>

            <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', padding: 14, marginBottom: 16 }}>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>{selectedOrder.customerName}</div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{selectedOrder.customerPhone}</div>
              {selectedOrder.customerAddress && <div style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', marginTop: 2 }}>{selectedOrder.customerAddress}</div>}
              <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                {selectedOrder.paymentMethod === 'wave' ? (
                  <><IconWave size={14} /> Wave</>
                ) : selectedOrder.paymentMethod === 'orange_money' ? (
                  <><IconCreditCard size={14} /> Orange Money</>
                ) : (
                  <><IconClipboard size={14} /> Paiement à la livraison</>
                )}
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 8 }}>{t('items')}</div>
              {selectedOrder.items.map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < selectedOrder.items.length - 1 ? '1px solid var(--border-light)' : 'none', fontSize: '0.875rem' }}>
                  <span>{item.product?.name || 'Produit inconnu'} × {item.quantity}</span>
                  <span style={{ fontWeight: 600 }}>{formatCFA(item.price * item.quantity)} F</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0 0', fontWeight: 700, fontSize: '1rem' }}>
                <span>{t('total')}</span>
                <span style={{ color: 'var(--primary)' }}>{formatCFA(selectedOrder.totalAmount)} F</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <a href={`https://wa.me/${formatWhatsApp(selectedOrder.customerPhone)}`} className="btn btn-secondary btn-full" style={{ gap: 6 }} target="_blank" rel="noopener noreferrer">
                <IconMessageCircle size={16} /> Contacter sur WhatsApp
              </a>

              {/* Status Actions */}
              {selectedOrder.status === 'PENDING' && (
                <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                  <button className="btn btn-primary" style={{ flex: 2 }} disabled={updating} onClick={() => handleUpdateStatus(selectedOrder.id, 'CONFIRMED', 'COMPLETED')}>
                    {updating ? 'Mise à jour...' : '✓ Confirmer la commande'}
                  </button>
                  <button className="btn btn-secondary" style={{ flex: 1, color: 'var(--danger)', borderColor: 'var(--danger)' }} disabled={updating} onClick={() => handleUpdateStatus(selectedOrder.id, 'CANCELLED', 'FAILED')}>
                    Annuler
                  </button>
                </div>
              )}

              {selectedOrder.status === 'CONFIRMED' && (
                <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                  <button className="btn btn-primary" style={{ flex: 2 }} disabled={updating} onClick={() => handleUpdateStatus(selectedOrder.id, 'DELIVERED')}>
                    {updating ? 'Mise à jour...' : '📦 Marquer comme Livré'}
                  </button>
                  <button className="btn btn-secondary" style={{ flex: 1, color: 'var(--danger)', borderColor: 'var(--danger)' }} disabled={updating} onClick={() => handleUpdateStatus(selectedOrder.id, 'CANCELLED', 'FAILED')}>
                    Annuler
                  </button>
                </div>
              )}

              {(selectedOrder.status === 'DELIVERED' || selectedOrder.status === 'CANCELLED') && (
                <div style={{ textAlign: 'center', fontSize: '0.8125rem', color: 'var(--text-tertiary)', padding: '6px 0', borderTop: '1px solid var(--border-light)', marginTop: 8 }}>
                  Commande {selectedOrder.status === 'DELIVERED' ? 'livrée' : 'annulée'}. Aucun changement possible.
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
