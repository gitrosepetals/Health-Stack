# Lumen

**Your weekly dose of health tech intelligence.**

A production-ready static site + serverless API for the Lumen health tech newsletter. Built for health tech students, operators, and early-career investors.

## Project structure

```
├── index.html                  # Main entry point
├── 404.html                    # CloudFront error page
├── assets/
│   ├── css/                    # tokens → base → components → layout
│   ├── js/                     # theme, nav, subscribe
│   ├── images/                 # logo, og-image, favicon
│   └── fonts/                  # Self-hosted woff2 fallback
├── api/
│   ├── subscribe/              # POST /subscribe → Beehiiv
│   ├── contact/                # POST /contact → SES
│   └── articles/               # GET /articles → DynamoDB
└── infrastructure/             # SAM, CloudFront, S3 policy
```

## Local development

### Static site

```bash
python3 -m http.server 8080
# → http://localhost:8080
```

The subscribe form POSTs to `/subscribe`. For local testing without an API, uncomment the Beehiiv embed in `index.html` or run `sam local start-api` (see below).

### Python environment

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # fill in your keys
```

### Fonts (optional self-host)

Download [Satoshi](https://www.fontshare.com/fonts/satoshi) and [Boska](https://www.fontshare.com/fonts/boska) woff2 files into `assets/fonts/`. Fontshare CDN is used by default.

### API (SAM local)

```bash
cd infrastructure
sam build
sam local start-api --env-vars ../.env.json
```

Create `.env.json` for SAM local:

```json
{
  "SubscribeFunction": {
    "BEEHIIV_API_KEY": "your_key",
    "BEEHIIV_PUB_ID": "your_pub_id"
  },
  "ContactFunction": {
    "SES_FROM_EMAIL": "hello@lumen.health",
    "SES_TO_EMAIL": "team@lumen.health"
  },
  "ArticlesFunction": {
    "ARTICLES_TABLE": "lumen-articles"
  }
}
```

Test endpoints:

```bash
curl -X POST http://127.0.0.1:3000/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

curl http://127.0.0.1:3000/articles
```

## AWS deployment

### 1. Deploy API (SAM)

```bash
cd infrastructure
sam build
sam deploy --guided \
  --parameter-overrides \
    BeehiivApiKey=YOUR_KEY \
    BeehiivPubId=YOUR_PUB_ID \
    CorsOrigin=https://yourdomain.com
```

Note the `ApiEndpoint` output.

### 2. Deploy static site (S3)

```bash
aws s3 sync . s3://your-lumen-bucket/ \
  --exclude "api/*" \
  --exclude "infrastructure/*" \
  --exclude ".env*" \
  --exclude "requirements.txt" \
  --exclude "README.md" \
  --exclude ".gitignore" \
  --exclude ".git/*"
```

### 3. CloudFront

Use `infrastructure/cloudfront.json` as a reference. Key settings:

- **S3 origin** with Origin Access Control (OAC)
- **API Gateway origin** for `/subscribe`, `/contact`, `/articles`
- **Custom error responses** → `/404.html` (403 and 404)
- Apply `infrastructure/s3-bucket-policy.json` (replace placeholders)

### 4. Activate Beehiiv embed (alternative to API)

Uncomment at the bottom of `index.html`:

```html
<script async src="https://subscribe-forms.beehiiv.com/v3/loader.js" data-beehiiv-form="acc6204b-fa5f-4da1-8f34-813a7a096fae"></script>
```

## Environment variables

| Variable | Used by | Description |
|----------|---------|-------------|
| `BEEHIIV_API_KEY` | Subscribe | Beehiiv API bearer token |
| `BEEHIIV_PUB_ID` | Subscribe | Publication UUID |
| `SES_FROM_EMAIL` | Contact | Verified SES sender |
| `SES_TO_EMAIL` | Contact | Inbox for contact form |
| `ARTICLES_TABLE` | Articles | DynamoDB table name |
| `CORS_ORIGIN` | All | Allowed frontend origin |
| `SENTRY_DSN` | All | Error tracking (optional) |

## Brand

- **Primary color:** `#0f766e` (deep teal)
- **Fonts:** Satoshi (body), Boska (display) via Fontshare
- **Voice:** Sharp, Axios-style briefs
