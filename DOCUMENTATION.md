# Fileadex Backend - Business Card Processing Pipeline

A complete backend system that processes business card images through OCR, data normalization, database storage, and CRM synchronization.

## 🎯 Overview

This backend implements the core Fileadex pipeline: **Business Card Image → OCR Text → Parsed Lead Data → Database Storage → CRM Sync**

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL database (or Supabase)
- Google Cloud Platform account (for Vision API)

### 1. Setup Environment
```bash
# Clone and install dependencies
git clone <repository-url>
cd fileadex-backend
npm install

# Create environment file
cp .env.example .env
```

### 2. Configure Environment Variables
Edit `.env`:
```env
DATABASE_URL=postgresql://username:password@host:5432/database
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json
PORT=3000
```

### 3. Setup Database
```bash
# Run migrations to create tables
npm run migrate
```

### 4. Start Development Server
```bash
npm run dev
```

## 📋 API Endpoints

### POST `/ingest-local`
Process a business card image from local file system.

**Request:**
```json
{
  "imagePath": "/absolute/path/to/business-card.jpg"
}
```

**Response:**
```json
{
  "saved": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@company.com",
    "phone": "+1234567890",
    "company": "Company Name",
    "job_title": "Job Title",
    "website": "company.com",
    "source": "Google Vision - 2025-01-01T12:00:00.000Z",
    "created_at": "2025-01-01T12:00:00.000Z"
  },
  "synced": true
}
```

### POST `/crm-sync`
Mock CRM endpoint that receives processed lead data.

**Request:** Lead object (same as saved data above)
**Response:** `{"status": "ok"}`

## 🏗️ My Approach

I built this system to handle real-world business card processing with flexibility and reliability in mind. Here's how I approached it:

### OCR Processing
I use Google's Vision API as the primary OCR engine because it's the most accurate for text recognition. However, I also built in a mock system so you can test everything without needing Google credentials right away. If the OCR fails, I handle it gracefully and still try to process whatever data I can extract.

### Data Cleaning & Validation
Business cards come in all shapes and sizes, so I built a smart parser that looks for common patterns (like emails, phone numbers, and websites) and cleans them up automatically. I validate emails properly and format phone numbers consistently. If something doesn't look right, I log it but don't crash the system.

### Database Storage
I store everything in PostgreSQL with a simple but effective design. Each lead gets a unique ID, and I prevent duplicates by checking email addresses. If I find an existing contact, I update their information rather than creating duplicates.

### CRM Integration
I designed the CRM sync to be flexible - it sends data to any endpoint you specify and automatically retries if something goes wrong. I included a test endpoint so you can see exactly what data gets sent.

### Build System
Everything is written in TypeScript for better reliability and easier maintenance. I have separate commands for development (with hot reload) and production (optimized builds).

## 🧪 Testing & Demo

### Mock Demo (No Google Vision Required)
```bash
npm run demo:mock -- ./card.jpg
```

### Real OCR Demo (Requires Google Vision Setup)
```bash
npm run demo:mock -- ./card.jpg --real-ocr
```

**Note:** Google Vision API requires billing to be enabled on your GCP project.

## 📊 Database Schema

```sql
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

## 🔧 Development Commands

```bash
# Development
npm run dev                    # Start dev server with hot reload
npm run migrate               # Run database migrations
npm run demo:mock -- ./card.jpg # Test pipeline with mock data

# Production
npm run build                 # Compile TypeScript to dist/
npm start                     # Run production server
npm run migrate:prod         # Run production migrations
npm run demo:mock -- ./card.jpg --real-ocr # Test with real OCR
```

## 🎯 My Assumptions

I made some practical assumptions based on real-world usage:

### Business Card Layouts
I assume most business cards follow common patterns - name at the top, job title below, contact info in the middle, etc. My parser works great for standard cards but might struggle with very creative designs. I'm upfront about this limitation.

### OCR Quality
I assume the OCR will be reasonably accurate but not perfect. That's why I built robust parsing that can handle some OCR mistakes and still extract useful information. I'd rather capture partial data than fail completely.

### CRM Systems
I assume your CRM can accept JSON data over HTTP. Most modern CRMs work this way. If yours doesn't, I can easily modify the sync to match your system's requirements.

### Processing Volume
I built this for processing one card at a time, which covers most use cases. The system is designed so I can easily add batch processing later if you need it.

### Error Handling Philosophy
I believe it's better to capture some data than none at all. So if something goes wrong, I log the error, try to save whatever data I can, and keep the system running. This means you won't lose leads due to minor technical issues.

## 🔄 Pipeline Flow

```
Business Card Image
        ↓
   Google Vision OCR
        ↓
   Text Extraction
        ↓
   Data Parsing & Normalization
        ↓
   Zod Schema Validation
        ↓
   PostgreSQL Upsert
        ↓
   CRM Sync (with retry)
        ↓
   Success Response
```

## 🛠️ Technology Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with pgcrypto
- **OCR**: Google Vision API
- **Validation**: Zod
- **Build**: TypeScript compiler with nodemon
- **Testing**: Built-in demo scripts

## 🔒 Security Considerations

- **Credentials**: Service account keys stored in environment variables
- **Database**: Connection string in environment variables
- **Validation**: Input sanitization and schema validation
- **Error Handling**: No sensitive data in error messages

## 🚀 Deployment

### Manual Deployment
1. Run `npm run build`
2. Copy `dist/` and `migrations/` to server
3. Set environment variables
4. Run `npm run migrate:prod`
5. Start with `npm start`

## 📈 Monitoring & Logging

- **Console Logging**: Detailed pipeline stage logging
- **Error Tracking**: Comprehensive error messages with context
- **Database**: Audit trail with timestamps and source tracking
- **CRM Sync**: Success/failure logging with retry attempts

---

**Built for Fileadex - Business Card Processing Pipeline** 🚀
