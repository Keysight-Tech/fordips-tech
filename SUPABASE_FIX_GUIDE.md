# Fix Supabase RLS Infinite Recursion Error

## Problem
You're seeing this error in the console:
```
GET https://loutcbvftzojsioahtdw.supabase.co/rest/v1/products 500 (Internal Server Error)
Supabase Error: infinite recursion detected in policy for relation "profiles"
```

## Root Cause
The Row Level Security (RLS) policies in `DEPLOY_ALL.sql` have a circular dependency:
- The `products` table policy checks if a user is an admin
- To check if user is admin, it queries the `profiles` table
- The `profiles` table has its own RLS policy that references itself
- This creates an infinite loop → 500 error

## Solution: Run FIX_RLS_POLICIES.sql

### Step 1: Open Supabase SQL Editor
1. Go to: https://supabase.com/dashboard/project/loutcbvftzojsioahtdw/sql
2. Click **"New Query"**

### Step 2: Run the Fix
1. Open the file: `D:\Projects\Figma\outputs\websites\fordips-tech\FIX_RLS_POLICIES.sql`
2. Copy ALL the contents
3. Paste into the Supabase SQL Editor
4. Click **"Run"** (or press Ctrl+Enter)

### Step 3: Verify the Fix
After running the SQL, test the fix by running this query in the SQL Editor:
```sql
SELECT * FROM products WHERE is_active = true ORDER BY created_at DESC LIMIT 5;
```

If you see products (or an empty result without errors), the fix worked! ✅

### Step 4: Refresh Your Website
1. Open your website: https://keysight-tech.github.io/fordips-tech/
2. Open the browser console (F12)
3. Refresh the page (Ctrl+R)
4. The error should be gone!

## What Changed?

### Before (Problematic):
```sql
-- This caused infinite recursion
CREATE POLICY "Products are editable by admins" ON products FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);
```

### After (Fixed):
```sql
-- Split into separate policies by operation type
CREATE POLICY "Anyone can view products" ON products FOR SELECT USING (true);

CREATE POLICY "Admins can insert products" ON products FOR INSERT
WITH CHECK (
    auth.jwt() ->> 'email' IN (SELECT email FROM profiles WHERE is_admin = true)
);

-- Similar for UPDATE and DELETE
```

**Key Differences:**
1. **Separated SELECT from write operations** - Public can view, only admins can modify
2. **Used `auth.jwt() ->> 'email'`** instead of `EXISTS (SELECT ... WHERE id = auth.uid())`
3. **Eliminated circular dependency** - Simpler, more efficient queries

## If You Still See Errors

### Check 1: Verify RLS is enabled
Run this in SQL Editor:
```sql
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
```
All tables should show `rowsecurity = true`

### Check 2: List all policies
```sql
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

### Check 3: Is your Supabase project paused?
Go to: https://supabase.com/dashboard/project/loutcbvftzojsioahtdw

If you see "Paused" status, click **"Resume"**

## Still Need Help?

If the error persists:
1. Check the browser console for any NEW error messages
2. Run this diagnostic query:
```sql
SELECT
    tablename,
    COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename;
```
3. Share the results with me

---

**Quick Links:**
- 🔗 Supabase Dashboard: https://supabase.com/dashboard/project/loutcbvftzojsioahtdw
- 🔗 SQL Editor: https://supabase.com/dashboard/project/loutcbvftzojsioahtdw/sql
- 📁 Fix File: `D:\Projects\Figma\outputs\websites\fordips-tech\FIX_RLS_POLICIES.sql`
