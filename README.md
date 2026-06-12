# Lumen

**Your weekly dose of health tech intelligence.**

Angular frontend + Node.js (Express) API + CMS admin dashboard, deployable on Vercel.

## Project structure

```
├── src/                    # Angular application (public site + admin CMS)
├── server/                 # Node.js Express API
│   └── src/
│       ├── routes/admin/   # Protected CMS routes (JWT)
│       ├── middleware/     # Auth middleware
│       └── db/             # Prisma client
├── prisma/                 # Database schema & seed
├── api/index.ts            # Vercel serverless entry
└── public/
```

## Local development

### Prerequisites

- Node.js 20+
- npm 10+

### Install & database setup

```bash
npm install
cp .env.example .env
npm run db:setup    # creates SQLite DB + seeds admin + articles
```

Default admin credentials (change in `.env` before seeding):

- **Email:** `admin@lumen.health`
- **Password:** `changeme123`

### Run full stack

```bash
npm run dev
# Web  → http://localhost:4200
# CMS  → http://localhost:4200/admin/login
# API  → http://localhost:3001
```

## CMS Admin Dashboard

| URL | Description |
|-----|-------------|
| `/admin/login` | Admin sign-in (bcrypt + JWT) |
| `/admin` | Article list with filters |
| `/admin/articles/new` | Create article |
| `/admin/articles/:id/edit` | Edit article |

### Admin API (requires `Authorization: Bearer <token>`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/admin/auth/login` | Login, returns JWT |
| GET | `/api/admin/auth/me` | Verify session |
| GET | `/api/admin/articles` | List all articles |
| POST | `/api/admin/articles` | Create article |
| GET | `/api/admin/articles/:id` | Get article |
| PUT | `/api/admin/articles/:id` | Update article |
| DELETE | `/api/admin/articles/:id` | Delete article |

Public site reads published articles from `GET /api/articles`.

## Environment variables

| Variable | Used by | Description |
|----------|---------|-------------|
| `DATABASE_URL` | CMS | SQLite locally (`file:./prisma/dev.db`); Postgres on Vercel |
| `JWT_SECRET` | CMS | Secret for signing admin tokens |
| `JWT_EXPIRES_IN` | CMS | Token expiry (default `8h`) |
| `ADMIN_EMAIL` | Seed | Initial admin email |
| `ADMIN_PASSWORD` | Seed | Initial admin password |
| `PORT` | Node server | API port (default `3001`) |
| `BEEHIIV_API_KEY` | Subscribe | Beehiiv API bearer token |
| `BEEHIIV_PUB_ID` | Subscribe | Publication UUID |
| `RESEND_API_KEY` | Contact | Resend API key |
| `CONTACT_FROM_EMAIL` | Contact | Verified sender in Resend |
| `CONTACT_TO_EMAIL` | Contact | Inbox for contact form |
| `CORS_ORIGIN` | API | Allowed frontend origin |

## Deploy to Vercel

1. Push to GitHub and import in [Vercel](https://vercel.com/new).
2. Add a **Postgres** database (Neon/Vercel Postgres) and set `DATABASE_URL`.
3. Set `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` and run seed once.
4. Deploy with build command `npm run build`.

> SQLite does not work on Vercel serverless. Use PostgreSQL in production.

## API endpoints

```bash
# Login
curl -X POST http://localhost:3001/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@lumen.health","password":"changeme123"}'

# List articles (authenticated)
curl http://localhost:3001/api/admin/articles \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Public articles
curl http://localhost:3001/api/articles
```

## Brand

- **Primary color:** `#0d6b63` (deep teal)
- **Fonts:** Satoshi (body), Boska (display) via Fontshare
- **Voice:** Sharp, Axios-style briefs
