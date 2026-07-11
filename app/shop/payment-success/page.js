'use client';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import { IconCheckCircle, IconShoppingBag } from '@/lib/icons';

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order');

  return (
    <div className="card" style={{ maxWidth: 480, width: '100%', textAlign: 'center', padding: 32 }}>
      <div style={{ color: 'var(--success)', display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
        <IconCheckCircle size={72} />
      </div>
      <h2 style={{ marginBottom: 8 }}>Paiement validé !</h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', marginBottom: 24 }}>
        Merci pour votre achat. Votre commande a été enregistrée avec succès et le vendeur a été notifié.
      </p>

      {orderId && (
        <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', padding: 14, marginBottom: 24, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          ID de commande : <strong style={{ color: 'var(--primary)' }}>{orderId}</strong>
        </div>
      )}
      
      <Link href="/" className="btn btn-primary btn-full btn-lg" style={{ gap: 8 }}>
        <IconShoppingBag size={18} /> Retour à l'accueil
      </Link>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-secondary)', padding: 16 }}>
      <Suspense fallback={<div>Chargement...</div>}>
        <SuccessContent />
      </Suspense>
    </div>
  );
}
