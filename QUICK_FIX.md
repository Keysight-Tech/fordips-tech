# ⚡ Quick Fix Guide - Fordips Tech

**Last Updated:** October 23, 2025

## Most Common Issue: Products Not Showing

### Quick Diagnosis
Open your website and check if products are visible:
- **URL:** https://keysight-tech.github.io/fordips-tech/
- **Expected:** Product grid showing iPhones, Samsung, Laptops, etc.
- **If empty:** Follow fixes below

---

## Fix #1: Run Complete Deployment (Recommended)

### What it does:
- Creates all database tables
- Sets up security policies
- Inserts 75 products
- Adds 8 categories

### How to run:
1. Go to Supabase SQL Editor:
   ```
   https://supabase.com/dashboard/project/loutcbvftzojsioahtdw/sql
   ```

2. Click **"New Query"**

3. Open file: `DEPLOY_ALL.sql`

4. Copy entire contents and paste into SQL Editor

5. Click **"Run"** (or press Ctrl+Enter)

6. Wait for success message (about 5 seconds)

7. Refresh your website - products should appear!

---

## Fix #2: Diagnostic & Auto-Fix

### What it does:
- Checks what's wrong
- Tells you exactly what's missing
- Automatically fixes RLS policies
- Inserts products if missing

### How to run:
1. Go to Supabase SQL Editor

2. Open file: `FIX_PRODUCTS.sql`

3. Copy and paste into SQL Editor

4. Click **"Run"**

5. Read the diagnostic messages

6. Products will be inserted automatically if missing

---

## Fix #3: Manual Verification

### Check if database exists:
```sql
-- Run in Supabase SQL Editor:
SELECT COUNT(*) FROM products;
```

**Expected Result:** 75 (or more)
**If 0:** Database is empty, run DEPLOY_ALL.sql

### Check if categories exist:
```sql
SELECT * FROM categories ORDER BY name;
```

**Expected Result:** 8 rows (accessories, desktop, iphone, laptop, samsung, smartwatch, starlink, tablet)
**If empty:** Run DEPLOY_ALL.sql

### Check RLS policies:
```sql
SELECT * FROM pg_policies WHERE tablename = 'products';
```

**Expected:** 2 policies
- "Products are viewable by everyone"
- "Products are editable by admins"

**If missing:** Run FIX_PRODUCTS.sql

---

## Fix #4: Create Admin User

### After signing up on website:
```sql
-- Replace with YOUR email:
UPDATE profiles
SET is_admin = true
WHERE email = 'your@email.com';
```

### Verify admin status:
```sql
SELECT email, is_admin FROM profiles WHERE is_admin = true;
```

---

## Fix #5: Clear Cache & Test

### Browser cache:
1. Press **Ctrl + Shift + Delete**
2. Select "Cached images and files"
3. Click "Clear data"
4. Hard refresh: **Ctrl + F5**

### Test the website:
1. Go to: https://keysight-tech.github.io/fordips-tech/
2. Open browser console: **F12**
3. Check for errors (red text)
4. Look for: "✅ Supabase integration ready!"

---

## Fix #6: Test Supabase Connection

### Run this in browser console (F12):
```javascript
// Test 1: Check if Supabase loaded
console.log('Supabase loaded?', !!window.supabase);

// Test 2: Check if integration ready
console.log('Integration ready?', !!window.fordipsTech);

// Test 3: Try to load products
if (window.fordipsTech?.loadProducts) {
    window.fordipsTech.loadProducts().then(products => {
        console.log('✅ Products loaded:', products.length);
        console.log('First 3:', products.slice(0, 3));
    }).catch(error => {
        console.error('❌ Error:', error.message);
    });
}
```

---

## Quick Health Check

### 1. Website Accessible?
```bash
curl -I https://keysight-tech.github.io/fordips-tech/
```
**Expected:** HTTP/1.1 200 OK

### 2. Supabase Project Active?
Go to: https://supabase.com/dashboard/project/loutcbvftzojsioahtdw
**Check:** Project status is "Active" (not paused)

### 3. Database Tables Exist?
In Supabase, go to **Table Editor**
**Expected:** See 8 tables (categories, products, profiles, orders, etc.)

### 4. Products in Database?
Click on **products** table
**Expected:** See 75+ rows

---

## Still Not Working?

### Run the Integration Test Suite:
1. Open: `TEST_INTEGRATION.html` in browser
2. Click: **"Run All Tests"**
3. Review results
4. Screenshot any errors

### Common Solutions:

#### "Invalid API key"
**Fix:** Check supabase-integration.js lines 14-15
```javascript
const SUPABASE_URL = 'https://loutcbvftzojsioahtdw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

#### "RLS policy error"
**Fix:** Run FIX_PRODUCTS.sql - it fixes RLS automatically

#### "No products found"
**Fix:** Run DEPLOY_ALL.sql - it inserts 75 products

#### "Admin panel access denied"
**Fix:**
```sql
UPDATE profiles SET is_admin = true WHERE email = 'your@email.com';
```

---

## Emergency Reset (Nuclear Option)

### ⚠️ WARNING: This deletes ALL data!

Only use if you want to start completely fresh:

```sql
-- 1. Drop all tables
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS cart_items CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS contact_submissions CASCADE;
DROP TABLE IF EXISTS newsletter_subscriptions CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- 2. Now run DEPLOY_ALL.sql to recreate everything
```

---

## Prevention Tips

### Before making changes:
1. ✅ Test in local environment first
2. ✅ Backup database (Supabase → Database → Backups)
3. ✅ Commit code to Git before deploying
4. ✅ Use TEST_INTEGRATION.html to verify

### Regular checks:
- Run TEST_INTEGRATION.html weekly
- Monitor Supabase dashboard for errors
- Check website logs
- Test all features after updates

---

## Support Contacts

### Documentation:
- **Main Docs:** SETUP_INSTRUCTIONS.md
- **Full Audit:** AUDIT_REPORT.md
- **Troubleshooting:** TROUBLESHOOTING.md

### Live URLs:
- **Website:** https://keysight-tech.github.io/fordips-tech/
- **Supabase:** https://supabase.com/dashboard/project/loutcbvftzojsioahtdw
- **GitHub Repo:** https://github.com/Keysight-Tech/fordips-tech

---

## Success Checklist

After running fixes, verify:
- [ ] Website loads without errors
- [ ] Products visible in grid (75 items)
- [ ] Can add items to cart
- [ ] Cart count updates
- [ ] Can open checkout modal
- [ ] Contact form submits
- [ ] Newsletter subscription works
- [ ] Admin panel accessible (if admin user created)

**All checked?** ✅ You're good to go!

---

**Pro Tip:** Bookmark this page for quick access to common fixes!
