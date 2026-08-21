# Trillion AI Tech — Digital Headquarters

Private operating system for **Trillion AI Tech Company Limited**.

**Founder, Owner & CEO:** Anselm Perkins  
**Command sign-in:** `anselm.perkins@gmail.com`  
**Domain:** [trillionaitech.com](https://trillionaitech.com)

Public site, product catalog (Trillion Market), and three command floors. There are **no subscription tiers** on this website. Stripe is wired for when a product is listed for sale.

| Floor | Path | Access |
|---|---|---|
| Market | `/` `/market` | Public |
| Throne | `/throne` | Anselm Perkins only |
| Watch | `/watch` | Security team |
| Desk | `/desk` | Staff (role-based) |

## Stack

- TanStack Start + React 19 + Tailwind CSS v4
- Better Auth (email/password, Google, X)
- PGLite locally, Postgres (Supabase or Neon) in production
- Stripe Checkout for one-time sales when a secret key is present

## Command floors

**Throne** — overview, users, products, staff, God Codes, Architect, Sentinel, Shield, analytics, disaster recovery, immutable audit logs.

**Watch** — threat dashboard, staff activity, vulnerability scanner, incidents, audit viewer, reports.

**Desk** — role-gated product, tickets, users, campaigns, and compliance.

Architect never acts without explicit CEO approval. Sentinel watches staff mutations.

## Local run

```bash
npm install
cp .env.example .env
npm run dev
```

Sign in with **anselm.perkins@gmail.com** (Google or email) to open Throne. Other accounts enter as customers until staffed.

## Deploy

1. Set `DATABASE_URL` (Supabase or Neon) and `BETTER_AUTH_SECRET`.
2. Set `BETTER_AUTH_URL=https://trillionaitech.com`.
3. Add Stripe keys when you list a product for sale.
4. Point Vercel at this repository. Production domain: `trillionaitech.com`.

## Contact

- hello@trillionaitech.com
- support@trillionaitech.com
- anselm.perkins@gmail.com
- anselm@trillionaitech.com

© Trillion AI Tech Company Limited. All rights reserved.
