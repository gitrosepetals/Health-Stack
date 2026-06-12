# Lumen

**Your weekly dose of health tech intelligence.**

Angular frontend + Node.js (Express) API, deployable on Vercel.

## Project structure

```
├── src/                    # Angular application
│   ├── app/
│   │   ├── components/     # Page sections (hero, posts, etc.)
│   │   ├── services/       # Theme, articles
│   │   └── directives/     # Scroll reveal
│   └── styles/             # Global CSS
├── server/                 # Node.js Express API
│   └── src/
│       ├── index.ts        # Standalone server entry (local / Node hosting)
│       ├── app.ts          # Express app factory (shared with Vercel)
│       ├── routes/         # subscribe, contact, articles
│       ├── data/           # Article seed data
│       └── lib/            # Env helpers
├── api/
│   └── index.ts            # Vercel serverless entry → exports Express app
├── public/                 # Static assets
├── vercel.json
└── angular.json
```

## Local development

### Prerequisites

- Node.js 20+
- npm 10+

### Install

```bash
npm install
cp .env.example .env   # fill in your keys
```

### Run full stack (Angular + Node API)

```bash
npm run dev
# Web  → http://localhost:4200
# API  → http://localhost:3001
```

Angular proxies `/api/*` to the Node server via `proxy.conf.json`.

### Run separately

```bash
npm start          # Angular only → :4200
npm run server     # Node API only → :3001
```

### Environment variables

| Variable | Used by | Description |
|----------|---------|-------------|
| `PORT` | Node server | API port (default `3001`) |
| `BEEHIIV_API_KEY` | Subscribe | Beehiiv API bearer token |
| `BEEHIIV_PUB_ID` | Subscribe | Publication UUID |
| `RESEND_API_KEY` | Contact | Resend API key |
| `CONTACT_FROM_EMAIL` | Contact | Verified sender in Resend |
| `CONTACT_TO_EMAIL` | Contact | Inbox for contact form |
| `CORS_ORIGIN` | API | Allowed frontend origin |

## Deploy to Vercel

1. Push to GitHub and import in [Vercel](https://vercel.com/new).
2. Confirm build settings:
   - **Build command:** `npm run build`
   - **Output directory:** `dist/lumen/browser`
3. Add environment variables from the table above.
4. Deploy.

Vercel routes all `/api/*` requests to `api/index.ts`, which runs the same Express app from `server/`.

```bash
vercel
vercel --prod
```

## Node.js production (optional)

Build and run the API as a standalone Node process (e.g. Railway, Render, Fly.io):

```bash
npm run build:server
node server/dist/index.js
```

Serve the Angular build from `dist/lumen/browser` with any static host, pointing `/api` at your Node server.

## API endpoints

```bash
# Health check
curl http://localhost:3001/api/health

# Subscribe
curl -X POST http://localhost:3001/api/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Contact
curl -X POST http://localhost:3001/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane","email":"jane@example.com","message":"Hello from Lumen."}'

# Articles
curl http://localhost:3001/api/articles
```

## Brand

- **Primary color:** `#0d6b63` (deep teal)
- **Fonts:** Satoshi (body), Boska (display) via Fontshare
- **Voice:** Sharp, Axios-style briefs
