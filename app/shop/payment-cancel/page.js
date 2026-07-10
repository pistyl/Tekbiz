'use client';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import { IconWarning, IconShoppingBag } from '@/lib/icons';

function CancelContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order');

  return (
    <div className="card" style={{ maxWidth: 480, width: '100%', textAlign: 'center', padding: 32 }}>
      <div style={{ color: 'var(--danger)', display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
        <IconWarning size={72} />
      </div>
      <h2 style={{ marginBottom: 8 }}>Paiement annulé</h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', marginBottom: 24 }}>
        La transaction a été annulée. Aucun montant n'a été débité de votre compte.
      </p>

      {orderId && (
        <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', padding: 14, marginBottom: 24, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          ID de commande concerné : <strong style={{ color: 'var(--primary)' }}>{orderId}</strong>
        </div>
      )}
      
      <Link href="/" className="btn btn-primary btn-full btn-lg" style={{ gap: 8 }}>
        <IconShoppingBag size={18} /> Retour à l'accueil
      </Link>
    </div>
  );
}

export default function PaymentCancelPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-secondary)', padding: 16 }}>
      <Suspense fallback={<div>Chargement...</div>}>
        <CancelContent />
      </Suspense>
    </div>
  );
}
