# Sheet to Contacts

Convert Excel, CSV, and Google Sheets to phone contacts (VCF) instantly.

## Features

- Drag & drop file upload
- Excel (.xlsx, .xls) and CSV support
- Google Sheets URL import
- Auto-detect columns (name, phone, email, company, notes)
- Manual column mapping
- Preview contacts before export
- VCF/vCard file generation
- QR code for mobile scanning
- Beautiful responsive UI with dark mode

## Quick Start

```bash
# Install dependencies
npm install

# Run locally
npm run dev

# Open http://localhost:3000
```

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- xlsx, papaparse, qrcode, react-dropzone

## Deploy to Vercel

```bash
npm install -g vercel
vercel
```

## Usage

1. Upload an Excel/CSV file or paste a Google Sheets URL
2. Map columns to contact fields (auto-detected)
3. Preview your contacts
4. Download VCF file and import to your phone

## Target Users

- Real Estate Agents
- Insurance Agents
- Sales Teams
- Event Organizers
- Recruiters

---

Built for salespeople who hate manual data entry.
