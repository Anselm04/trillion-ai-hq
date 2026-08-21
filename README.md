# Trillion AI Tech — Digital Headquarters

Private operating system for **Trillion AI Tech Company Limited**.

Public site, product catalog (Trillion Market), Stripe checkout, and three command floors:

| Floor | Path | Access |
|---|---|---|
| Market | `/` `/market` | Public |
| Throne | `/throne` | CEO only |
| Watch | `/watch` | Security team |
| Desk | `/desk` | Staff (role-based) |

**Domain:** [trillionaitech.com](https://trillionaitech.com)  
**Founder & CEO:** Anselm Perkins

## Stack

- TanStack Start + React 19 + Tailwind CSS v4
- Better Auth (email/password, Google, X)
- PGLite locally, Neon Postgres in production
- Stripe Checkout (live key, or demo ledger without it)

## Command floors

**Throne** — empire overview, users, products, staff, God Codes, Architect, Sentinel, Shield, analytics, disaster recovery, immutable audit logs.

**Watch** — threat dashboard, staff activity, vulnerability scanner, incidents, audit viewer, reports.

**Desk** — role-gated product, tickets, users, campaigns, and compliance.

Architect never acts without explicit CEO approval. Sentinel watches staff mutations.

## Local run

```bash
npm install
cp .env.example .env
npm run dev
```

Open `http://localhost:8080`. First signed-in account claims Throne. `anselm@trillionaitech.com` is always elevated to Throne.

## Deploy

1. Set `DATABASE_URL` (Neon) and `BETTER_AUTH_SECRET`.
2. Add Stripe keys for live checkout.
3. Point Vercel at this repository. Production domain: `trillionaitech.com`.

## Contact

- hello@trillionaitech.com
- support@trillionaitech.com
- anselm@trillionaitech.com

© Trillion AI Tech Company Limited. All rights reserved.
