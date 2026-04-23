# Expired Goods Return App

A mobile-friendly web form for field executives to record expired goods returns at retailer shops. Data is saved directly to Supabase (PostgreSQL).

---

## What This App Does

- Executive visits a retailer → opens the app on their phone
- Fills in retailer details (shop name, area, phone)
- Adds one or more expired products with name, brand, MRP, dates, quantity
- Submits → data saves to your Supabase database instantly
- Gets a reference number to confirm submission

---

## Setup Guide (Step by Step)

### STEP 1 — Create Supabase Account & Project

1. Go to https://supabase.com → Sign Up (free)
2. Click **New Project**
3. Name: `expired-returns` | Region: **Singapore** (closest to India)
4. Set a strong database password → **Create Project** (wait ~1 min)

---

### STEP 2 — Create Database Tables

1. In Supabase dashboard → Click **SQL Editor** (left sidebar)
2. Click **New Query**
3. Copy the entire contents of `supabase_setup.sql`
4. Paste into the editor → Click **Run**
5. You should see "Success. No rows returned"

---

### STEP 3 — Get Your API Keys

1. In Supabase → **Settings** (gear icon) → **API**
2. Copy:
   - **Project URL** → looks like `https://abcdefgh.supabase.co`
   - **anon public** key → long string starting with `eyJ...`

---

### STEP 4 — Add Keys to the App

Open `src/supabaseClient.js` and replace:

```js
const SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co'   // ← paste Project URL
const SUPABASE_ANON_KEY = 'YOUR_ANON_PUBLIC_KEY'              // ← paste anon key
```

---

### STEP 5 — Run Locally to Test

```bash
npm install
npm run dev
```

Open http://localhost:5173 on your computer or phone (same WiFi).
Submit a test entry and check Supabase → **Table Editor** → `expired_returns` to confirm it saved.

---

### STEP 6 — Deploy Online (Free on Vercel)

#### Option A: Deploy via GitHub (Recommended)

1. Create a free account at https://github.com
2. Create a new repository named `expired-returns`
3. Push code:
   ```bash
   git init
   git add .
   git commit -m "initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/expired-returns.git
   git push -u origin main
   ```
4. Go to https://vercel.com → Sign in with GitHub
5. Click **Add New Project** → Import `expired-returns`
6. Click **Deploy** — done!

Your app will be live at: `https://expired-returns.vercel.app`

#### Option B: Deploy via Vercel CLI

```bash
npm install -g vercel
vercel
```

Follow the prompts — it will give you a live URL immediately.

---

## Sharing With Executives

Once deployed, share the Vercel URL with your field executives. They can:
- Bookmark it on their phone's home screen
- Open it in any browser (Chrome, Safari, etc.)
- Works offline-aware — shows error if no internet

---

## Viewing Submitted Data

### In Supabase (Raw Tables)
- Dashboard → **Table Editor** → `expired_returns` or `return_products`

### Full Report View (Flat)
Run this in SQL Editor to see everything in one view:
```sql
SELECT * FROM return_summary ORDER BY submitted_at DESC;
```

### Export to Excel/CSV
- Table Editor → Select all rows → **Export as CSV**
- Open in Excel or Google Sheets

---

## Database Structure

### `expired_returns` table
| Column | Type | Description |
|---|---|---|
| id | Serial | Auto ID |
| ref_number | VARCHAR | e.g. RET-230426-1234 |
| exec_name | VARCHAR | Field executive name |
| shop_name | VARCHAR | Retailer shop name |
| shop_phone | VARCHAR | Shop contact number |
| visit_date | DATE | Date of visit |
| area | VARCHAR | Location/area |
| submitted_at | Timestamp | Auto-recorded |

### `return_products` table
| Column | Type | Description |
|---|---|---|
| id | Serial | Auto ID |
| return_id | Integer | Links to expired_returns |
| product_name | VARCHAR | Product name |
| brand | VARCHAR | Brand name |
| mrp | Numeric | MRP in ₹ |
| mfg_date | CHAR(10) | Format: DD.MM.YYYY |
| exp_date | CHAR(10) | Format: DD/MM/YYYY |
| quantity | Integer | Number of pieces |

---

## Tech Stack

| Layer | Technology | Cost |
|---|---|---|
| Database | Supabase (PostgreSQL) | Free (500MB) |
| Frontend | React + Vite | Free |
| Hosting | Vercel | Free |

**Total cost: ₹0**

---

## Support

If submission fails, check:
1. Supabase URL and anon key are correctly pasted in `supabaseClient.js`
2. Internet connection is active on the device
3. Supabase project is not paused (free tier pauses after 1 week of inactivity — just click Resume)
