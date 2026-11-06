import { Inter, Outfit } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

const outfit = Outfit({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-display',
});

export const metadata = {
  title: 'TEKBIZ — Créez votre boutique en ligne au Sénégal',
  description: 'Plateforme SaaS pour créer facilement une boutique en ligne, accepter les paiements mobiles Wave & Orange Money et gérer vos commandes depuis votre téléphone.',
  keywords: ['e-commerce', 'boutique en ligne', 'Sénégal', 'Wave', 'Orange Money', 'paiement mobile', 'TEKBIZ'],
  authors: [{ name: 'TEKBIZ' }],
  openGraph: {
    title: 'TEKBIZ — Vendez en ligne, simplement.',
    description: 'Créez votre boutique, acceptez Wave & Orange Money, gérez vos commandes — tout depuis votre téléphone.',
    type: 'website',
    locale: 'fr_SN',
  },
  manifest: '/manifest.json',
};

export const viewport = {
  themeColor: '#F97316',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr" className={`${inter.variable} ${outfit.variable}`}>
      <head>
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className={`${inter.variable} ${outfit.variable}`}>{children}</body>
    </html>
  );
}
