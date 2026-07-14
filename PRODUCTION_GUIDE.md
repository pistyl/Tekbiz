# TEKBIZ — Guide de mise en production

## Vue d'ensemble

Ce guide couvre toutes les étapes pour passer TEKBIZ du mode développement (localStorage) à un environnement de production complet avec base de données PostgreSQL et paiements PayTech réels.

---

## Phase 1 — Base de données PostgreSQL + Prisma

### 1.1 Installer les dépendances

```bash
npm install prisma @prisma/client
npx prisma init
```

### 1.2 Configurer la connexion

Dans `.env` (ou `.env.local`) :

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/tekbiz?schema=public"
```

**Options d'hébergement PostgreSQL :**

| Service | Gratuit | Prix Pro | Recommandation |
|:---|:---|:---|:---|
| **Supabase** | 500 Mo | 25$/mois | ✅ Recommandé (dashboard inclus) |
| **Neon** | 512 Mo | 19$/mois | Bon pour serverless |
| **Railway** | 1 Go trial | 5$/mois | Simple à configurer |
| **VPS (Hetzner)** | — | 4€/mois | Auto-hébergé, pas de limite |

### 1.3 Créer le schéma Prisma

Créer `prisma/schema.prisma` :

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  name      String
  email     String   @unique
  phone     String
  password  String   // Hashé avec bcrypt
  store     Store?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Store {
  id          String    @id @default(cuid())
  name        String
  slug        String    @unique
  description String?
  logo        String?
  banner      String?
  category    String?
  phone       String
  address     String?
  isActive    Boolean   @default(true)
  userId      String    @unique
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  products    Product[]
  orders      Order[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model Product {
  id          String      @id @default(cuid())
  name        String
  description String?
  price       Int         // Prix en FCFA
  images      String[]
  category    String?
  inStock     Boolean     @default(true)
  quantity    Int         @default(0)
  storeId     String
  store       Store       @relation(fields: [storeId], references: [id], onDelete: Cascade)
  orderItems  OrderItem[]
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
}

model Order {
  id              String        @id @default(cuid())
  orderNumber     String        @unique
  status          OrderStatus   @default(PENDING)
  totalAmount     Int
  customerName    String
  customerPhone   String
  customerAddress String?
  paymentMethod   String        // "wave" | "orange_money"
  paymentStatus   PaymentStatus @default(PENDING)
  paymentRef      String?       // Référence PayTech
  storeId         String
  store           Store         @relation(fields: [storeId], references: [id])
  items           OrderItem[]
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
}

model OrderItem {
  id        String  @id @default(cuid())
  quantity  Int
  price     Int
  productId String
  product   Product @relation(fields: [productId], references: [id])
  orderId   String
  order     Order   @relation(fields: [orderId], references: [id], onDelete: Cascade)
}

enum OrderStatus {
  PENDING
  CONFIRMED
  PREPARING
  READY
  DELIVERED
  CANCELLED
}

enum PaymentStatus {
  PENDING
  COMPLETED
  FAILED
  REFUNDED
}
```

### 1.4 Appliquer les migrations

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 1.5 Créer le client Prisma singleton

Créer `lib/prisma.js` :

```js
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis;

const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
```

### 1.6 Créer les API Routes

**`app/api/auth/register/route.js`** :

```js
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';

export async function POST(request) {
  const { name, email, phone, password, storeName, storeCategory } = await request.json();

  // Vérifier si l'email existe déjà
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: 'Email déjà utilisé' }, { status: 400 });
  }

  // Générer le slug
  const slug = storeName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  const slugExists = await prisma.store.findUnique({ where: { slug } });
  if (slugExists) {
    return NextResponse.json({ error: 'Nom de boutique déjà pris' }, { status: 400 });
  }

  // Hasher le mot de passe
  const hashedPassword = await bcrypt.hash(password, 12);

  // Créer l'utilisateur + boutique
  const user = await prisma.user.create({
    data: {
      name, email, phone,
      password: hashedPassword,
      store: {
        create: { name: storeName, slug, category: storeCategory, phone }
      }
    },
    include: { store: true }
  });

  return NextResponse.json({
    success: true,
    user: { id: user.id, name: user.name, email: user.email, store: user.store }
  });
}
```

**`app/api/auth/login/route.js`** :

```js
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';

export async function POST(request) {
  const { email, password } = await request.json();

  const user = await prisma.user.findUnique({
    where: { email },
    include: { store: true }
  });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return NextResponse.json({ error: 'Email ou mot de passe incorrect' }, { status: 401 });
  }

  return NextResponse.json({
    success: true,
    user: { id: user.id, name: user.name, email: user.email, store: user.store }
  });
}
```

### 1.7 Adapter `lib/auth.js` pour appeler les API

Remplacer les fonctions `register()` et `login()` pour utiliser `fetch('/api/auth/...')` au lieu de `localStorage` :

```js
export async function register(data) {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const result = await res.json();
  if (result.success) {
    localStorage.setItem('tekbiz_session', JSON.stringify(result.user));
  }
  return result;
}

export async function login(email, password) {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const result = await res.json();
  if (result.success) {
    localStorage.setItem('tekbiz_session', JSON.stringify(result.user));
  }
  return result;
}
```

> **Note :** Pour une auth plus robuste, u## Phase 2 — Intégration UnitechPay (Paiements)

### 2.1 Créer un compte UnitechPay

1. Aller sur [https://unitech.sn](https://unitech.sn) (ou portail marchand UnitechPay)
2. Créer un **compte marchand**
3. Obtenir vos clés d'API dans votre espace marchand.
4. Récupérer votre **clé API** :
   - `UNITECHPAY_API_KEY`

### 2.2 Variables d'environnement

```env
UNITECHPAY_API_KEY=4c53ad12e1e4bcaa5d65576fadfef7618dfa7fd495124f7d8093968d5d0e505c
NEXT_PUBLIC_APP_URL=https://tekbiz.sn
```

### 2.3 Créer le client UnitechPay

Créer `lib/unitechpay.js` :

```js
import crypto from 'crypto';

const UNITECHPAY_API_URL = 'https://api.unitech.sn/api.php';

export async function createPayment({ amount, description, orderId, customerName, customerPhone, paymentMethod, appUrl }) {
  try {
    const apiKey = process.env.UNITECHPAY_API_KEY;
    if (!apiKey) return { success: 0, error: 'API key missing' };

    const isOrange = paymentMethod === 'orange_money' || paymentMethod === 'orange';
    const action = isOrange ? 'create_orange_maxit' : 'create_wave_payment';
    
    let runtimeAppUrl = appUrl || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    if (!runtimeAppUrl.includes('localhost') && runtimeAppUrl.startsWith('http://')) {
      runtimeAppUrl = runtimeAppUrl.replace('http://', 'https://');
    }

    const cleanPhone = customerPhone.replace(/\D/g, '');
    const customerNumber = cleanPhone.length >= 9 
      ? cleanPhone.substring(cleanPhone.length - 9) 
      : cleanPhone;

    const payload = {
      amount: Math.ceil(amount),
      reference: orderId,
      description: description || `Commande ${orderId}`,
      customer_number: customerNumber,
      customer_phone: customerPhone,
      customer_name: customerName,
      phone: customerPhone,
      callback_url: `${runtimeAppUrl}/api/payments/webhook`,
      success_url: `${runtimeAppUrl}/api/payments/success?order=${orderId}`,
      cancel_url: `${runtimeAppUrl}/api/payments/cancel?order=${orderId}`,
    };

    const response = await fetch(`${UNITECHPAY_API_URL}?action=${action}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) return { success: 0, error: `HTTP ${response.status}` };

    const data = await response.json();
    if (!data.success) return { success: 0, error: data.message };

    const resData = data.data || data;
    const redirectUrl = resData.payment_url || resData.deep_link || resData.redirect_url;

    return {
      success: 1,
      redirect_url: redirectUrl,
      transaction_id: resData.transaction_id || resData.reference
    };
  } catch (error) {
    return { success: 0, error: error.message };
  }
}

export function verifyWebhookSignature(rawBody, signature) {
  const apiKey = process.env.UNITECHPAY_API_KEY;
  if (!apiKey) return false;
  
  const expectedSignature = crypto
    .createHmac('sha256', apiKey)
    .update(rawBody)
    .digest('hex');

  try {
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'hex'),
      Buffer.from(signature, 'hex')
    );
  } catch {
    return expectedSignature === signature;
  }
}
```

### 2.4 API Route — Initier un paiement

Créer `app/api/payments/initiate/route.js` :

```js
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createPayment } from '@/lib/unitechpay';

export async function POST(request) {
  const { items, customerName, customerPhone, customerAddress, storeId, paymentMethod } = await request.json();
  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const order = await prisma.order.create({
    data: {
      orderNumber: `TK-${Date.now().toString(36).toUpperCase()}`,
      totalAmount,
      customerName,
      customerPhone,
      customerAddress,
      paymentMethod,
      storeId,
      items: {
        create: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        }))
      }
    }
  });

  const host = request.headers.get('host');
  const protocol = host.includes('localhost') ? 'http' : 'https';

  const payment = await createPayment({
    amount: totalAmount,
    description: `Commande ${order.orderNumber}`,
    orderId: order.id,
    customerName,
    customerPhone,
    paymentMethod,
    appUrl: `${protocol}://${host}`
  });

  if (payment.success === 1) {
    return NextResponse.json({
      success: true,
      redirectUrl: payment.redirect_url,
      orderNumber: order.orderNumber,
    });
  }

  return NextResponse.json({ error: 'Erreur lors du paiement' }, { status: 500 });
}
```

### 2.5 API Route — Webhook (confirmation automatique)

Créer `app/api/payments/webhook/route.js` :

```js
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyWebhookSignature } from '@/lib/unitechpay';

export async function POST(request) {
  const rawBody = await request.text();
  const signature = request.headers.get('x-unitechpay-signature');

  if (!signature || !verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: 'Signature invalide' }, { status: 401 });
  }

  const { event, reference, status, transaction_id } = JSON.parse(rawBody);

  if (event === 'payment_completed' && status === 'completed') {
    if (reference.startsWith('SUB_')) {
      const storeId = reference.substring(4);
      await prisma.store.update({
        where: { id: storeId },
        data: {
          plan: 'PRO',
          subscriptionEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
      });
    } else {
      await prisma.order.update({
        where: { id: reference },
        data: {
          paymentStatus: 'COMPLETED',
          status: 'CONFIRMED',
          paymentRef: String(transaction_id || ''),
        }
      });
    }
  }

  return NextResponse.json({ received: true });
}
```

### 2.6 Flow de paiement complet

```
Client → Valide panier → POST /api/payments/initiate
                             ↓
                    Crée commande (PENDING)
                    Appelle UnitechPay API
                             ↓
                    Retourne redirect_url
                             ↓
Client → Redirigé vers UnitechPay (Wave/OM) → Effectue le paiement
                             ↓
              UnitechPay → POST /api/payments/webhook
                             ↓
                    Commande → CONFIRMED
                             ↓
Client → Redirigé vers success_url → Page de confirmation
```                          ↓
Client → Redirigé vers success_url → Page de confirmation
```

---

## Phase 3 — Déploiement

### 3.1 Option A : Vercel (Recommandé)

```bash
# Installer Vercel CLI
npm i -g vercel

# Déployer
vercel

# Variables d'environnement (dans le dashboard Vercel)
# → Settings → Environment Variables → Ajouter toutes les variables .env
```

### 3.2 Option B : VPS (Hetzner / Contabo)

```bash
# Sur le serveur
sudo apt update && sudo apt install -y nodejs npm nginx certbot postgresql

# Cloner le projet
git clone <repo-url> /var/www/tekbiz
cd /var/www/tekbiz

# Installer et build
npm install
npx prisma migrate deploy
npm run build

# Lancer avec PM2
npm install -g pm2
pm2 start npm --name tekbiz -- start
pm2 save && pm2 startup

# Configurer Nginx (reverse proxy)
# /etc/nginx/sites-available/tekbiz
server {
    server_name tekbiz.sn *.tekbiz.sn;
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

# SSL avec Let's Encrypt
sudo certbot --nginx -d tekbiz.sn -d "*.tekbiz.sn"
```

### 3.3 Configurer le domaine

1. Acheter `tekbiz.sn` chez un registrar sénégalais (OSIRIS/NIC Sénégal)
2. DNS :
   ```
   A     tekbiz.sn        → IP_DU_SERVEUR
   A     *.tekbiz.sn      → IP_DU_SERVEUR
   CNAME www.tekbiz.sn    → tekbiz.sn
   ```
3. Le wildcard `*.tekbiz.sn` permet les sous-domaines boutiques

---

## Phase 4 — Sécurité & Production

### Checklist avant le lancement

- [ ] **Hasher tous les mots de passe** avec bcrypt (fait dans l'API)
- [ ] **HTTPS** sur toutes les pages (certificat SSL)
- [ ] **Rate limiting** sur les API auth (`next-rate-limit` ou Vercel WAF)
- [ ] **Validation des inputs** côté serveur (email, téléphone, prix)
- [ ] **CORS** configuré pour n'accepter que votre domaine
- [ ] **Variables .env** jamais commitées (vérifier `.gitignore`)
- [ ] **Webhook UnitechPay** vérifié avec signature HMAC
- [ ] **Backups automatiques** de la base PostgreSQL
- [ ] **Tests en mode sandbox / test** de l'API de paiement
- [ ] **Monitoring** : Vercel Analytics ou Sentry pour les erreurs

### Variables d'environnement production

```env
# Base de données
DATABASE_URL="postgresql://tekbiz:MOT_DE_PASSE_FORT@db.supabase.co:5432/tekbiz"

# Auth
NEXTAUTH_SECRET="clé-secrète-de-64-caractères-minimum"
NEXTAUTH_URL="https://tekbiz.sn"

# UnitechPay (PRODUCTION)
UNITECHPAY_API_KEY="4c53ad12e1e4bcaa5d65576fadfef7618dfa7fd495124f7d8093968d5d0e505c"

# App
NEXT_PUBLIC_APP_URL="https://tekbiz.sn"
NEXT_PUBLIC_APP_NAME="TEKBIZ"
```

## Phase 3 — Stockage des images avec Cloudinary

Par défaut, l'application convertit les images en Base64 pour un fonctionnement autonome sans dépendance. Pour la production, il est fortement conseillé d'utiliser un stockage externe pour éviter de saturer la base de données.

L'application intègre un support natif pour **Cloudinary**.

### 3.1 Créer un compte Cloudinary
1. Créez un compte gratuit sur [Cloudinary](https://cloudinary.com/).
2. Copiez vos identifiants depuis le tableau de bord Cloudinary :
   * **Cloud Name**
   * **API Key**
   * **API Secret**

### 3.2 Configurer l'environnement
Ajoutez ces clés dans votre fichier `.env` ou `.env.local` en production :

```env
CLOUDINARY_CLOUD_NAME="votre-cloud-name"
CLOUDINARY_API_KEY="votre-api-key"
CLOUDINARY_API_SECRET="votre-api-secret"
```

Une fois ces variables configurées, la route d'upload téléversera automatiquement toutes les images de produits, logos et bannières vers Cloudinary et enregistrera des URLs sécurisées à la place des chaînes Base64.

---

## Résumé des étapes

| # | Étape | Temps estimé |
|:--|:------|:-------------|
| 1 | Créer compte Supabase + configurer PostgreSQL | 30 min |
| 2 | Ajouter Prisma + schéma + migrations | 1h |
| 3 | Créer les API routes (auth, produits, commandes) | 3-4h |
| 4 | Remplacer localStorage par appels API | 2h |
| 5 | Créer compte UnitechPay + obtenir clés API | 1-5 jours* |
| 6 | Intégrer UnitechPay (initiate + webhook) | 2-3h |
| 7 | Tester en mode sandbox | 1h |
| 8 | Configurer Cloudinary (Upload d'images) | 30 min |
| 9 | Acheter domaine tekbiz.sn | 1 jour |
| 10 | Déployer sur Vercel ou VPS | 1-2h |
| 11 | Configurer SSL + DNS wildcard | 1h |
| 12 | Tests finaux + passage UnitechPay en production | 1h |

> * L'obtention des clés de paiement nécessite la validation de documents légaux (NINEA, RCCM).

---

## Commandes utiles

```bash
# Développement
npm run dev                       # Lancer le serveur local
npx prisma studio                 # Interface visuelle pour la DB
npx prisma migrate dev            # Appliquer les migrations
npx prisma db seed                # Peupler la DB avec des données test

# Production
npm run build                     # Build de production
npm start                         # Lancer en production
npx prisma migrate deploy         # Migrations en production (sans prompt)
```
