'use client';
import { useState } from 'react';
import { useLanguage } from '@/lib/i18n';
import { IconClipboard, IconWave, IconCreditCard, IconMessageCircle } from '@/lib/icons';

function formatCFA(n) { return new Intl.NumberFormat('fr-FR').format(n); }

const statusColors = { pending: 'warning', confirmed: 'info', preparing: 'info', ready: 'primary', delivered: 'success', cancelled: 'danger' };

const mockOrders = [
  { id: 'TK-2401', customer: 'Aminata Sow', phone: '+221 77 123 4567', items: [{ name: 'Robe Wax', qty: 2, price: 25000 }, { name: 'Sac cuir', qty: 1, price: 18000 }], total: 68000, status: 'pending', payment: 'wave', date: '28 Jun 2026, 14:32' },
  { id: 'TK-2400', customer: 'Ibrahima Fall', phone: '+221 78 654 3210', items: [{ name: 'Boubou Premium', qty: 1, price: 35000 }], total: 35000, status: 'confirmed', payment: 'orange_money', date: '28 Jun 2026, 13:15' },
  { id: 'TK-2399', customer: 'Fatou Diallo', phone: '+221 76 987 6543', items: [{ name: 'Boucles dorées', qty: 1, price: 8500 }, { name: 'Thiouraye', qty: 2, price: 3500 }], total: 15500, status: 'delivered', payment: 'wave', date: '28 Jun 2026, 10:45' },
  { id: 'TK-2398', customer: 'Ousmane Ndiaye', phone: '+221 77 555 1234', items: [{ name: 'Huile Touloucouna', qty: 3, price: 5000 }], total: 15000, status: 'cancelled', payment: 'orange_money', date: '27 Jun 2026, 18:20' },
];

const tabs = ['allOrders', 'pending', 'confirmed', 'delivered', 'cancelled'];

export default function OrdersPage() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('allOrders');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const filtered = activeTab === 'allOrders' ? mockOrders : mockOrders.filter(o => o.status === activeTab);

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
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.map(order => (
          <div key={order.id} className="order-card" style={{ cursor: 'pointer', flexDirection: 'column', alignItems: 'stretch', gap: 10 }} onClick={() => setSelectedOrder(order)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.75rem', color: 'var(--text-secondary)', flexShrink: 0 }}>
                {order.customer.split(' ').map(n => n[0]).join('')}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{order.customer}</div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)' }}>{order.id} · {order.items.length} {t('items')} · {order.date}</div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{formatCFA(order.total)} F</div>
                <span className={`badge badge-${statusColors[order.status]}`}>{t(order.status)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
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
              <span className={`badge badge-${statusColors[selectedOrder.status]}`}>{t(selectedOrder.status)}</span>
            </div>

            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: 16 }}>{selectedOrder.id} · {selectedOrder.date}</div>

            <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', padding: 14, marginBottom: 16 }}>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>{selectedOrder.customer}</div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{selectedOrder.phone}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                {selectedOrder.payment === 'wave' ? <><IconWave size={14} /> Wave</> : <><IconCreditCard size={14} /> Orange Money</>}
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 8 }}>{t('items')}</div>
              {selectedOrder.items.map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < selectedOrder.items.length - 1 ? '1px solid var(--border-light)' : 'none', fontSize: '0.875rem' }}>
                  <span>{item.name} × {item.qty}</span>
                  <span style={{ fontWeight: 600 }}>{formatCFA(item.price * item.qty)} F</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0 0', fontWeight: 700, fontSize: '1rem' }}>
                <span>{t('total')}</span>
                <span style={{ color: 'var(--primary)' }}>{formatCFA(selectedOrder.total)} F</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <a href={`https://wa.me/${selectedOrder.phone.replace(/\s+/g, '')}`} className="btn btn-secondary" style={{ flex: 1, gap: 6 }} target="_blank" rel="noopener">
                <IconMessageCircle size={16} /> WhatsApp
              </a>
              <button className="btn btn-primary" style={{ flex: 1 }}>{t('updateStatus')}</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
