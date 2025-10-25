# Admin Panel Troubleshooting Guide

## Problem: Can't Login to Admin Panel & No Product Upload Button

If you're experiencing:
- ❌ Admin login not working
- ❌ Can't see "Add New Product" button
- ❌ Getting redirected to homepage

Follow these steps in order:

---

## 🔥 CRITICAL: Fix Supabase RLS Policies First!

**This MUST be done before anything else!**

### Why?
The admin panel cannot check if you're an admin due to the RLS infinite recursion error. This causes login failures.

### Fix Steps:

1. **Open Supabase SQL Editor**:
   https://supabase.com/dashboard/project/loutcbvftzojsioahtdw/sql

2. **Click "New Query"**

3. **Open this file on your computer**:
   ```
   D:\Projects\Figma\outputs\websites\fordips-tech\FIX_RLS_POLICIES.sql
   ```

4. **Copy ALL contents** (Ctrl+A, Ctrl+C)

5. **Paste into SQL Editor** and click **"Run"**

6. **You should see**: "Success. No rows returned"

✅ **RLS policies are now fixed!**

---

## Step 1: Create Your Account

1. **Go to the MAIN website** (NOT the admin panel):
   https://keysight-tech.github.io/fordips-tech/

2. **Click "Account" button** (top right)

3. **Click "Sign Up" tab**

4. **Fill in**:
   - Email: `brineketum@gmail.com`
   - Password: (choose a strong password - SAVE IT!)
   - Full Name: `Brian Ketum`

5. **Click "Sign Up"**

6. **Check your email** (brineketum@gmail.com)
   - Look for email from Supabase
   - Click the confirmation link
   - ✅ Account is now confirmed!

---

## Step 2: Grant Admin Privileges

### Method A: Supabase Dashboard (Easiest)

1. **Go to Table Editor**:
   https://supabase.com/dashboard/project/loutcbvftzojsioahtdw/editor

2. **Click "profiles" table** (left sidebar)

3. **Find your email**: `brineketum@gmail.com`
   - If you don't see it, refresh the page
   - If still not there, you need to complete Step 1 first

4. **Click the row** to edit

5. **Find "is_admin" column** → Change to `true`

6. **Click ✓ (checkmark) or press Enter** to save

7. **Verify**: You should see `is_admin: true` ✅

### Method B: Using SQL

1. **Go to SQL Editor**:
   https://supabase.com/dashboard/project/loutcbvftzojsioahtdw/sql

2. **Paste this query**:
   ```sql
   -- Find your profile
   SELECT id, email, is_admin FROM profiles WHERE email = 'brineketum@gmail.com';

   -- Make yourself admin
   UPDATE profiles
   SET is_admin = true
   WHERE email = 'brineketum@gmail.com';

   -- Verify it worked
   SELECT id, email, is_admin FROM profiles WHERE email = 'brineketum@gmail.com';
   ```

3. **Click "Run"**

4. **Check result**: Should show `is_admin = true` ✅

---

## Step 3: Login to Main Site

**IMPORTANT**: You must login to the MAIN site first, NOT the admin panel!

1. **Go to**: https://keysight-tech.github.io/fordips-tech/

2. **Click "Account"** (top right)

3. **Click "Login" tab** (if you see Sign Up tab)

4. **Enter**:
   - Email: `brineketum@gmail.com`
   - Password: (the password you created)

5. **Click "Login"**

6. **Check**: Top right should now show your name or email instead of "Account"

✅ **You are now logged in!**

---

## Step 4: Access Admin Panel

Now you can access the admin panel:

1. **Go to**: https://keysight-tech.github.io/fordips-tech/admin.html

2. **You should see**: Admin Dashboard with stats

3. **If you still get redirected**:
   - Open browser console (F12)
   - Look for error messages
   - Make sure you completed ALL steps above
   - Try clearing browser cache (Ctrl+Shift+Delete)

✅ **You're in the admin panel!**

---

## Step 5: Upload Products

1. **Click "Products" tab** (in admin navigation)

2. **You should see**:
   - "Product Management" heading
   - **"+ Add New Product" button** (top right)

3. **Click "+ Add New Product"**

4. **A modal form should appear!**

5. **Fill in product details**:
   - Product Name: e.g., "iPhone 17 Pro Max"
   - Category: Select from dropdown
   - Price: e.g., 1299.99
   - Description: Product description
   - Image URL: Product image URL
   - Stock Quantity: e.g., 50
   - ✅ Check "Is Active"

6. **Click "Save Product"**

7. **Check your website**: https://keysight-tech.github.io/fordips-tech/
   - Product should appear!

✅ **Product uploaded successfully!**

---

## 🐛 Troubleshooting

### Issue 1: "Please log in to access the admin panel"

**Cause**: You're not logged in

**Fix**:
1. Go to main site: https://keysight-tech.github.io/fordips-tech/
2. Click "Account" → Login
3. Then go to admin panel

---

### Issue 2: "You do not have admin privileges"

**Cause**: `is_admin` is not set to `true` in Supabase

**Fix**:
1. Go to: https://supabase.com/dashboard/project/loutcbvftzojsioahtdw/editor
2. Click "profiles" table
3. Find your email
4. Set `is_admin` to `true`
5. Save
6. Try accessing admin panel again

---

### Issue 3: Don't see "+ Add New Product" button

**Cause**:
- Not logged in as admin OR
- JavaScript error preventing page load

**Fix**:
1. Open browser console (F12)
2. Look for red errors
3. If you see "infinite recursion" error:
   - Run FIX_RLS_POLICIES.sql (see top of this guide)
4. Refresh page (Ctrl+R)

---

### Issue 4: Modal doesn't appear when clicking "Add Product"

**Cause**: JavaScript error

**Fix**:
1. Open browser console (F12)
2. Click "+ Add New Product"
3. Check for errors
4. Try refreshing page
5. Clear browser cache (Ctrl+Shift+Delete)

---

### Issue 5: Can't save product - 500 error

**Cause**: RLS policy error

**Fix**:
1. Run FIX_RLS_POLICIES.sql (see top of this guide)
2. Try again

---

## 📋 Checklist

Before accessing admin panel, make sure:

- [ ] RLS policies fixed (ran FIX_RLS_POLICIES.sql)
- [ ] Account created (brineketum@gmail.com)
- [ ] Email confirmed
- [ ] `is_admin` set to `true` in Supabase
- [ ] Logged in to MAIN site (not admin panel)
- [ ] Can see your name/email in top right of main site
- [ ] Browser cache cleared

If all checked, you should be able to:
- ✅ Access admin panel
- ✅ See "+ Add New Product" button
- ✅ Upload products
- ✅ Products appear on website

---

## 🎯 Quick Test

Try this to verify everything works:

1. Login to main site ✅
2. Go to admin panel: https://keysight-tech.github.io/fordips-tech/admin.html
3. Click "Products" tab
4. Click "+ Add New Product"
5. Fill in test product:
   - Name: Test Product
   - Category: iphone
   - Price: 999
   - Image URL: https://images.unsplash.com/photo-1592286927505-24b683486e36?w=800
   - Stock: 100
   - Active: ✅ Yes
6. Click "Save Product"
7. Go to main site
8. Product should appear!

If it works, everything is set up correctly! 🎉

---

## 🆘 Still Having Issues?

If you're still stuck:

1. **Check browser console** (F12) for errors
2. **Clear browser cache** completely
3. **Try in incognito/private mode**
4. **Check Supabase dashboard**:
   - Is project paused?
   - Are there errors in logs?
5. **Verify all SQL fixes were run**

Share the error messages from browser console if you need more help!

---

**Quick Links:**
- 🌐 Main Site: https://keysight-tech.github.io/fordips-tech/
- 👨‍💼 Admin Panel: https://keysight-tech.github.io/fordips-tech/admin.html
- 🔧 Supabase Dashboard: https://supabase.com/dashboard/project/loutcbvftzojsioahtdw
- 📊 Table Editor: https://supabase.com/dashboard/project/loutcbvftzojsioahtdw/editor
- 💾 SQL Editor: https://supabase.com/dashboard/project/loutcbvftzojsioahtdw/sql
