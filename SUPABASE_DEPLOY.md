# 🚀 Supabase Database Setup - 2 Minute Guide

## Your Supabase Connection

- **URL**: https://loutcbvftzojsioahtdw.supabase.co
- **Anon Key**: Already configured in `supabase-integration.js`
- **Dashboard**: https://supabase.com/dashboard/project/loutcbvftzojsioahtdw

---

## Quick Setup (2 Steps)

### Step 1: Run Database Schema (1 minute)

1. **Open Supabase SQL Editor**
   - Go to: https://supabase.com/dashboard/project/loutcbvftzojsioahtdw
   - Click **SQL Editor** in the left sidebar
   - Click **+ New Query**

2. **Copy & Run Migration**
   - Open the file: `supabase-migration.sql` (in your project folder)
   - Copy ALL contents (Ctrl+A, Ctrl+C)
   - Paste into Supabase SQL Editor
   - Click **Run** (or press Ctrl+Enter)
   - Wait for: "Fordips Tech database schema created successfully!"

### Step 2: Seed Products (1 minute)

1. **Open New Query**
   - In SQL Editor, click **+ New Query** again

2. **Copy & Run Seed Data**
   - Open the file: `seed-products.sql`
   - Copy ALL contents (Ctrl+A, Ctrl+C)
   - Paste into Supabase SQL Editor
   - Click **Run**
   - Wait for: "✅ Successfully inserted 75 products!"

---

## ✅ Done! Now Test Your Website

1. Visit: **https://keysight-tech.github.io/fordips-tech/**

2. You should see:
   - ✅ 75 products loaded
   - ✅ Categories work
   - ✅ Shopping cart functional
   - ✅ Contact form ready

---

## Create Your Admin Account

1. **Sign Up**
   - Go to your website
   - Click "My Account" → "Sign Up"
   - Enter your email and create account
   - Check email for verification link

2. **Make Yourself Admin**
   - In Supabase SQL Editor, run:
   ```sql
   UPDATE profiles SET is_admin = true WHERE email = 'your@email.com';
   ```
   - Replace `your@email.com` with YOUR actual email

3. **Access Admin Panel**
   - Go to: https://keysight-tech.github.io/fordips-tech/admin.html
   - Login with your account
   - You now have full admin access!

---

## 🎉 Complete!

Your e-commerce website is now fully deployed with:
- ✅ Database schema
- ✅ 75 products
- ✅ User authentication
- ✅ Admin panel
- ✅ Shopping cart
- ✅ Order management

**Live Website**: https://keysight-tech.github.io/fordips-tech/

---

## Troubleshooting

**Problem**: Products not showing
- Check browser console (F12) for errors
- Verify both SQL files ran successfully
- Refresh the page

**Problem**: Can't login to admin
- Verify email is confirmed
- Check if `is_admin` is true in database:
  ```sql
  SELECT * FROM profiles WHERE email = 'your@email.com';
  ```

**Problem**: Database connection error
- Verify Supabase project is active
- Check credentials in `supabase-integration.js:14-15`

---

## File Locations

- **Migration**: `D:\Projects\Figma\outputs\websites\fordips-tech\supabase-migration.sql`
- **Seed Data**: `D:\Projects\Figma\outputs\websites\fordips-tech\seed-products.sql`
- **Website Files**: `D:\Projects\Figma\outputs\websites\fordips-tech\`

---

## Quick Links

- 🌐 **Live Website**: https://keysight-tech.github.io/fordips-tech/
- 🎛️ **Admin Panel**: https://keysight-tech.github.io/fordips-tech/admin.html
- 🗄️ **Supabase Dashboard**: https://supabase.com/dashboard/project/loutcbvftzojsioahtdw
- 📦 **GitHub Repo**: https://github.com/Keysight-Tech/fordips-tech

---

**That's it! Your website is deployed and ready to use!** 🎉
