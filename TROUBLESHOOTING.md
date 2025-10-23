# 🔧 Products Not Showing - Troubleshooting Guide

## Quick Fix Steps (Do These in Order)

### Step 1: Run the Fix Script in Supabase

1. **Go to Supabase SQL Editor**:
   ```
   https://supabase.com/dashboard/project/loutcbvftzojsioahtdw/sql
   ```

2. **Click "New Query"**

3. **Open and copy FIX_PRODUCTS.sql**:
   ```
   Location: D:\Projects\Figma\outputs\websites\fordips-tech\FIX_PRODUCTS.sql
   ```

4. **Paste and Run** (Ctrl+Enter)

5. **Read the output messages** - it will tell you exactly what's wrong

---

### Step 2: Check Browser Console

1. **Open your website**:
   ```
   https://keysight-tech.github.io/fordips-tech/
   ```

2. **Press F12** to open Developer Tools

3. **Click "Console" tab**

4. **Look for errors** (red text)

5. **Take a screenshot if you see errors**

---

### Step 3: Test Supabase Connection

**Copy and paste this in your browser console (F12 → Console):**

```javascript
// Test 1: Check if Supabase client is loaded
console.log('Supabase client exists?', !!window.supabase);

// Test 2: Check configuration
console.log('Supabase config:', {
    url: 'https://loutcbvftzojsioahtdw.supabase.co',
    hasKey: !!window.fordipsTech
});

// Test 3: Try to fetch products directly
if (window.fordipsTech && window.fordipsTech.loadProducts) {
    window.fordipsTech.loadProducts().then(products => {
        console.log('✅ Products loaded:', products.length);
        console.log('First 3 products:', products.slice(0, 3));
    }).catch(error => {
        console.error('❌ Error loading products:', error);
    });
} else {
    console.error('❌ fordipsTech not initialized');
}
```

---

## Common Issues & Solutions

### Issue 1: "No products found" in Supabase

**Solution**: Run FIX_PRODUCTS.sql - it will automatically insert products

### Issue 2: "RLS Policy Error" in console

**Solution**: The FIX_PRODUCTS.sql script fixes this automatically

**Or run this manually in Supabase SQL Editor:**

```sql
-- Allow everyone to SELECT products
DROP POLICY IF EXISTS "Products are viewable by everyone" ON products;
CREATE POLICY "Products are viewable by everyone"
ON products FOR SELECT
USING (true);
```

### Issue 3: "Invalid API key" error

**Solution**: Verify your Supabase credentials

1. Open: `supabase-integration.js`
2. Check lines 14-15:
   ```javascript
   const SUPABASE_URL = 'https://loutcbvftzojsioahtdw.supabase.co';
   const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
   ```
3. Verify these match your Supabase project

### Issue 4: Products exist in DB but don't show on website

**Solutions**:

A) **Clear browser cache**:
   - Press Ctrl+Shift+Delete
   - Clear cache
   - Refresh page (Ctrl+F5)

B) **Check if products are active**:
   ```sql
   SELECT COUNT(*) FROM products WHERE is_active = true;
   ```

C) **Check JavaScript is loading**:
   - F12 → Network tab
   - Refresh page
   - Look for `supabase-integration.js` - should be 200 OK

### Issue 5: CORS errors

**Solution**: This shouldn't happen with GitHub Pages, but if it does:

1. Go to Supabase → Settings → API
2. Add to allowed origins:
   ```
   https://keysight-tech.github.io
   ```

---

## Detailed Diagnostics

### Check 1: Verify Database Tables

Run in Supabase SQL Editor:

```sql
-- Check all tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Should see:
-- categories
-- products
-- profiles
-- orders
-- order_items
-- cart_items
-- contact_submissions
-- newsletter_subscriptions
```

### Check 2: Count Products

```sql
-- Total products
SELECT COUNT(*) as total FROM products;

-- Active products by category
SELECT
    category_slug,
    COUNT(*) as count
FROM products
WHERE is_active = true
GROUP BY category_slug;
```

### Check 3: Test Product Query (Same as website uses)

```sql
-- This is exactly what the website runs
SELECT
    p.*,
    c.name as category_name,
    c.slug as category_slug,
    c.icon as category_icon
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
WHERE p.is_active = true
ORDER BY p.created_at DESC
LIMIT 10;
```

### Check 4: Verify RLS Policies

```sql
-- Check policies on products table
SELECT
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'products';

-- Should see:
-- "Products are viewable by everyone" with USING (true)
```

---

## Manual Product Insertion (If Needed)

If FIX_PRODUCTS.sql doesn't work, insert products manually:

```sql
-- First, ensure categories exist
INSERT INTO categories (name, slug, description, icon) VALUES
    ('iPhones', 'iphone', 'Latest iPhone models', '📱'),
    ('Samsung', 'samsung', 'Samsung Galaxy phones', '📱'),
    ('Laptops', 'laptop', 'MacBooks and laptops', '💻')
ON CONFLICT (slug) DO NOTHING;

-- Then insert a test product
INSERT INTO products (name, category_slug, price, description, image_url, is_active)
SELECT
    'iPhone 14 Pro',
    'iphone',
    999,
    'Latest iPhone with pro features',
    'https://images.unsplash.com/photo-1592286927505-24b683486e36?w=800&q=80',
    true
WHERE NOT EXISTS (
    SELECT 1 FROM products WHERE name = 'iPhone 14 Pro'
);

-- Verify it was inserted
SELECT * FROM products WHERE name = 'iPhone 14 Pro';
```

---

## Test the Complete Flow

### 1. Database Check
```sql
-- Run in Supabase SQL Editor
SELECT
    'Database Status' as check_type,
    COUNT(*) as product_count,
    COUNT(*) FILTER (WHERE is_active = true) as active_count
FROM products;
```

### 2. API Check
Open browser console and run:
```javascript
// Direct API test
fetch('https://loutcbvftzojsioahtdw.supabase.co/rest/v1/products?select=*&is_active=eq.true', {
    headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvdXRjYnZmdHpvanNpb2FodGR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyNDc5NjMsImV4cCI6MjA3NjgyMzk2M30.u49fBtuF99IsEAr8iYLo_3SnHAOqTR-Y7WPXnkGVKOs',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvdXRjYnZmdHpvanNpb2FodGR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyNDc5NjMsImV4cCI6MjA3NjgyMzk2M30.u49fBtuF99IsEAr8iYLo_3SnHAOqTR-Y7WPXnkGVKOs'
    }
})
.then(r => r.json())
.then(products => {
    console.log('✅ Products from API:', products.length);
    console.log(products);
})
.catch(err => console.error('❌ API Error:', err));
```

### 3. Website Check
```
1. Go to: https://keysight-tech.github.io/fordips-tech/
2. Wait 5 seconds
3. Products should appear
4. If not, check F12 console for errors
```

---

## Still Not Working?

### Send me this information:

1. **Supabase SQL Editor Results**:
   - Run: `SELECT COUNT(*) FROM products;`
   - Screenshot the result

2. **Browser Console Errors**:
   - Press F12
   - Go to Console tab
   - Screenshot any red errors

3. **Network Tab**:
   - F12 → Network tab
   - Refresh page
   - Screenshot showing supabase requests

4. **RLS Check**:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'products';
   ```
   - Screenshot the result

---

## Quick Test URLs

Test these directly in your browser:

1. **Website**: https://keysight-tech.github.io/fordips-tech/
2. **Supabase Dashboard**: https://supabase.com/dashboard/project/loutcbvftzojsioahtdw
3. **SQL Editor**: https://supabase.com/dashboard/project/loutcbvftzojsioahtdw/sql
4. **Table Editor**: https://supabase.com/dashboard/project/loutcbvftzojsioahtdw/editor

---

## Expected Results

When everything works:

✅ Supabase shows 75+ products in table editor
✅ Browser console shows "✅ Fordips Tech Supabase Integration Loaded"
✅ Website displays products in grid
✅ No errors in F12 console
✅ Products can be added to cart

---

## File Locations

- **Fix Script**: `D:\Projects\Figma\outputs\websites\fordips-tech\FIX_PRODUCTS.sql`
- **Deploy Script**: `D:\Projects\Figma\outputs\websites\fordips-tech\DEPLOY_ALL.sql`
- **Config File**: `D:\Projects\Figma\outputs\websites\fordips-tech\supabase-integration.js`

---

## Need Help?

If you've tried all these steps and products still don't show:

1. Run FIX_PRODUCTS.sql in Supabase
2. Check browser console (F12) for errors
3. Screenshot the errors
4. Check Supabase table editor - are products there?

**Most common fix**: Run FIX_PRODUCTS.sql - it fixes 90% of issues automatically! ✨
