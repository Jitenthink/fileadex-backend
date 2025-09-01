# Fileadex Backend

Implements OCR → normalize → store → CRM sync pipeline.

## Setup

1. Prereqs: Node.js 18+, Postgres, Google Vision credentials JSON.
2. Env: create `.env` with

```
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DB
GOOGLE_APPLICATION_CREDENTIALS=/absolute/path/google-key.json
PORT=3000
```

3. Install: `npm install`
4. Migrate: `npm run migrate`
5. Start: `npm run dev`

## Build & Production

```bash
npm run build          # Compile TypeScript + copy migrations to dist/
npm start              # Run built server from dist/
npm run migrate:prod   # Run built migration script
npm run ingest:local:prod -- /path/to/image.jpg  # Run built ingest script
```

## Demo & Testing

### Mock Demo (No Google Vision Required)
```bash
npm run demo:mock -- ./card.jpg
```
Shows complete pipeline flow with mock OCR data.

### Real OCR Demo (Requires Google Vision Setup)
```bash
npm run demo:mock -- ./card.jpg --real-ocr
```

**Note:** Google Vision API requires billing to be enabled on your GCP project.

## Endpoints

- POST `/crm-sync` – mock CRM receiver
- POST `/ingest-local` – body `{ "imagePath": "/abs/path/to/card.jpg" }`

## Schema

```
CREATE TABLE leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE,
  phone TEXT,
  company TEXT,
  job_title TEXT,
  website TEXT,
  source TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Notes

- Uses Google Vision API; replaceable with AWS Textract.
- Zod validation for email/phone/website.
- Dedup by unique email.
- Build output: `dist/` contains compiled JS + migrations + scripts.