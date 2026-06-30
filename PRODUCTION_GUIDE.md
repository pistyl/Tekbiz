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

> **Note :** Pour une auth plus robuste, utilisez des JWT ou NextAuth.js v5.

---

## Phase 2 — Intégration PayTech (Paiements)

### 2.1 Créer un compte PayTech

1. Aller sur [https://paytech.sn](https://paytech.sn)
2. Créer un **compte marchand**
3. Documents requis :
   - NINEA (Numéro d'Identification National des Entreprises)
   - RCCM (Registre du Commerce)
   - Pièce d'identité du gérant
   - RIB bancaire
4. Récupérer vos **clés API** dans le dashboard PayTech :
   - `PAYTECH_API_KEY`
   - `PAYTECH_API_SECRET`

### 2.2 Variables d'environnement

```env
PAYTECH_API_KEY=pk_live_xxxxxxxxxxxxx
PAYTECH_API_SECRET=sk_live_xxxxxxxxxxxxx
PAYTECH_ENV=production    # "test" pour sandbox
NEXT_PUBLIC_APP_URL=https://tekbiz.sn
```

### 2.3 Créer le client PayTech

Créer `lib/paytech.js` :

```js
const PAYTECH_BASE_URL = 'https://paytech.sn/api/payment';

export async function createPayment({ amount, description, orderId, customerName, customerPhone }) {
  const response = await fetch(`${PAYTECH_BASE_URL}/request-payment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'API_KEY': process.env.PAYTECH_API_KEY,
      'API_SECRET': process.env.PAYTECH_API_SECRET,
    },
    body: JSON.stringify({
      item_name: description,
      item_price: amount,
      currency: 'XOF',
      ref_command: orderId,
      command_name: `Commande ${orderId}`,
      env: process.env.PAYTECH_ENV || 'test',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/success?order=${orderId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/cancel?order=${orderId}`,
      ipn_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/webhook`,
      custom_field: JSON.stringify({
        orderId,
        customerName,
        customerPhone,
      }),
    }),
  });

  const data = await response.json();
  return data; // { success: 1, redirect_url: "https://paytech.sn/..." }
}

export function verifyWebhookSignature(body, signature) {
  // Vérifier la signature HMAC du webhook PayTech
  const crypto = require('crypto');
  const hash = crypto
    .createHmac('sha256', process.env.PAYTECH_API_SECRET)
    .update(JSON.stringify(body))
    .digest('hex');
  return hash === signature;
}
```

### 2.4 API Route — Initier un paiement

Créer `app/api/payments/initiate/route.js` :

```js
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createPayment } from '@/lib/paytech';

export async function POST(request) {
  const { items, customerName, customerPhone, customerAddress, storeId, paymentMethod } = await request.json();

  // Calculer le total
  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Créer la commande en base
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

  // Initier le paiement PayTech
  const payment = await createPayment({
    amount: totalAmount,
    description: `Commande ${order.orderNumber}`,
    orderId: order.id,
    customerName,
    customerPhone,
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

export async function POST(request) {
  const body = await request.json();

  // PayTech envoie : type_event, ref_command, item_price, payment_method, etc.
  const { type_event, ref_command, custom_field } = body;

  if (type_event === 'sale_complete') {
    const { orderId } = JSON.parse(custom_field);

    // Mettre à jour la commande
    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: 'COMPLETED',
        status: 'CONFIRMED',
        paymentRef: ref_command,
      }
    });

    // TODO: Envoyer notification au marchand (SMS, email, push)
  }

  return NextResponse.json({ received: true });
}
```

### 2.6 Flow de paiement complet

```
Client → Valide panier → POST /api/payments/initiate
                             ↓
                    Crée commande (PENDING)
                    Appelle PayTech API
                             ↓
                    Retourne redirect_url
                             ↓
Client → Redirigé vers PayTech → Paie via Wave/OM
                             ↓
              PayTech → POST /api/payments/webhook
                             ↓
                   Commande → CONFIRMED
                   Notification marchand
                             ↓
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
- [ ] **Webhook PayTech** vérifié avec signature HMAC
- [ ] **Backups automatiques** de la base PostgreSQL
- [ ] **Tests sandbox PayTech** avant de passer en production
- [ ] **Monitoring** : Vercel Analytics ou Sentry pour les erreurs

### Variables d'environnement production

```env
# Base de données
DATABASE_URL="postgresql://tekbiz:MOT_DE_PASSE_FORT@db.supabase.co:5432/tekbiz"

# Auth
NEXTAUTH_SECRET="clé-secrète-de-64-caractères-minimum"
NEXTAUTH_URL="https://tekbiz.sn"

# PayTech (PRODUCTION)
PAYTECH_API_KEY="pk_live_xxxxx"
PAYTECH_API_SECRET="sk_live_xxxxx"
PAYTECH_ENV="production"

# App
NEXT_PUBLIC_APP_URL="https://tekbiz.sn"
NEXT_PUBLIC_APP_NAME="TEKBIZ"
```

---

## Résumé des étapes

| # | Étape | Temps estimé |
|:--|:------|:-------------|
| 1 | Créer compte Supabase + configurer PostgreSQL | 30 min |
| 2 | Ajouter Prisma + schéma + migrations | 1h |
| 3 | Créer les API routes (auth, produits, commandes) | 3-4h |
| 4 | Remplacer localStorage par appels API | 2h |
| 5 | Créer compte PayTech + obtenir clés API | 1-5 jours* |
| 6 | Intégrer PayTech (initiate + webhook) | 2-3h |
| 7 | Tester en mode sandbox | 1h |
| 8 | Acheter domaine tekbiz.sn | 1 jour |
| 9 | Déployer sur Vercel ou VPS | 1-2h |
| 10 | Configurer SSL + DNS wildcard | 1h |
| 11 | Tests finaux + passage PayTech en production | 1h |

> \* L'obtention des clés PayTech nécessite la validation de documents légaux (NINEA, RCCM).

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
