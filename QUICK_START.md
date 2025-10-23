# Quick Start Guide - Fordips Tech

## Your Supabase Credentials (Already Configured!)

Your project is already configured with:
- **Supabase URL**: https://loutcbvftzojsioahtdw.supabase.co
- **Anon Key**: Already set in `supabase-integration.js`

## Step 1: Set Up Your Database (5 minutes)

### A. Apply Database Schema

1. Go to your Supabase project: https://supabase.com/dashboard/project/loutcbvftzojsioahtdw
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**
4. Open the file `supabase-migration.sql` from this folder
5. Copy ALL the contents and paste into the SQL Editor
6. Click **Run** (or press Ctrl+Enter)
7. Wait for success message

### B. Seed Products Data

1. In SQL Editor, click **New Query** again
2. Open the file `seed-products.sql` from this folder
3. Copy ALL the contents and paste into the SQL Editor
4. Click **Run**
5. You should see "Successfully inserted 75 products!"

## Step 2: Test Locally

Open `index.html` in your web browser - the site should load with products from your database!

## Step 3: Create Your Admin Account

1. On the website, click "My Account"
2. Sign up with your email
3. Verify your email (check spam folder)
4. In Supabase SQL Editor, run:
   ```sql
   UPDATE profiles SET is_admin = true WHERE email = 'your@email.com';
   ```
5. Refresh the page and access `admin.html`

## Step 4: Deploy

Your site is ready to deploy to:
- **GitHub Pages** (free hosting)
- **Netlify** (drag & drop)
- **Vercel** (one-click deploy)

See `SETUP_INSTRUCTIONS.md` for detailed deployment guides.

---

## Quick Links

- Supabase Dashboard: https://supabase.com/dashboard/project/loutcbvftzojsioahtdw
- Main Website: `index.html`
- Admin Panel: `admin.html`

## Troubleshooting

If products don't load:
1. Check browser console (F12) for errors
2. Verify both SQL files ran successfully in Supabase
3. Check credentials in `supabase-integration.js:14-15`
