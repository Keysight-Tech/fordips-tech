# How to Login as Admin and Upload Products

## ✅ YES! Products added to Supabase will show on your website automatically!

Once you:
1. Fix the RLS policies (run FIX_RLS_POLICIES.sql)
2. Add products via the admin panel
3. The products will appear on your website immediately!

---

## 🔐 Step-by-Step: Login as Admin

### Step 1: Create Your Admin Account

1. **Go to your website**: https://keysight-tech.github.io/fordips-tech/

2. **Click "Account"** in the top navigation bar

3. **Click "Sign Up"** tab

4. **Fill in your details**:
   - **Email**: brineketum@gmail.com
   - **Password**: (Choose a strong password - save it!)
   - **Full Name**: Brian Ketum

5. **Click "Sign Up"**

6. **Check your email** (brineketum@gmail.com):
   - You'll receive a confirmation email from Supabase
   - Click the confirmation link
   - Your account is now created!

---

### Step 2: Grant Admin Privileges in Supabase

Your account exists, but you need to make it an ADMIN account.

#### Method A: Using Supabase Dashboard (Easiest)

1. **Go to Supabase Dashboard**:
   https://supabase.com/dashboard/project/loutcbvftzojsioahtdw

2. **Click "Table Editor"** in the left sidebar

3. **Click on the "profiles" table**

4. **Find your row**:
   - Look for email: `brineketum@gmail.com`
   - If you can't find it, you may need to sign up first (Step 1)

5. **Click the row to edit it**

6. **Find the "is_admin" column**

7. **Change `false` to `true`**

8. **Click Save** ✅

#### Method B: Using SQL Editor (Alternative)

1. **Go to SQL Editor**:
   https://supabase.com/dashboard/project/loutcbvftzojsioahtdw/sql

2. **Click "New Query"**

3. **Paste this SQL**:
   ```sql
   -- Find your user
   SELECT id, email, is_admin FROM profiles WHERE email = 'brineketum@gmail.com';

   -- Make yourself admin
   UPDATE profiles
   SET is_admin = true
   WHERE email = 'brineketum@gmail.com';

   -- Verify it worked
   SELECT id, email, is_admin FROM profiles WHERE email = 'brineketum@gmail.com';
   ```

4. **Click "Run"** (or press Ctrl+Enter)

5. **Check the result**: You should see `is_admin = true` ✅

---

### Step 3: Access the Admin Panel

1. **Go to the Admin Panel**:
   https://keysight-tech.github.io/fordips-tech/admin.html

2. **You should see the admin dashboard!** 🎉

   If you see "Access Denied" or are redirected:
   - Make sure you're logged in (go to main site, click Account, login)
   - Make sure `is_admin = true` in Supabase (repeat Step 2)
   - Clear your browser cache and try again

---

## 📦 How to Upload Products

### Step 1: Access Products Section

1. **Go to**: https://keysight-tech.github.io/fordips-tech/admin.html

2. **Click the "Products" tab** (on the left or top menu)

### Step 2: Add a New Product

1. **Click "Add New Product" button**

2. **Fill in the product details**:
   - **Product Name**: e.g., "iPhone 17 Pro Max"
   - **Category**: Select from dropdown (iphone, samsung, laptop, etc.)
   - **Price**: Enter price (e.g., 1299.99)
   - **Description**: Product description
   - **Image URL**: Product image URL
   - **Badge**: Optional (NEW, SALE, POPULAR)
   - **Stock Quantity**: How many in stock (e.g., 50)
   - **Is Active**: Check this to make product visible

3. **Click "Save Product"**

4. **Product is now in Supabase!** ✅

### Step 3: Verify Product Shows on Website

1. **Open your website**: https://keysight-tech.github.io/fordips-tech/

2. **Scroll to the products section**

3. **Your new product should appear!** 🎉

   If you don't see it:
   - Make sure "Is Active" was checked
   - Refresh the page (Ctrl+R)
   - Check browser console for errors
   - Make sure you ran FIX_RLS_POLICIES.sql

---

## 🖼️ How to Get Product Images

### Option 1: Upload to Supabase Storage

1. **Go to Supabase Storage**:
   https://supabase.com/dashboard/project/loutcbvftzojsioahtdw/storage/buckets

2. **Click "Create bucket"** (if you don't have one):
   - Name: `products`
   - Make it **public**

3. **Upload your image**:
   - Click the bucket
   - Click "Upload file"
   - Select image
   - Copy the public URL

4. **Use this URL** in the "Image URL" field when adding products

### Option 2: Use External URLs

You can use image URLs from:
- Unsplash: https://unsplash.com/
- Your own server
- Product manufacturer websites

Example URLs:
```
https://images.unsplash.com/photo-1592286927505-24b683486e36?w=800&q=80
```

---

## 🔄 Product Flow Diagram

```
1. You add product in Admin Panel
         ↓
2. Product saved to Supabase database
         ↓
3. Website queries Supabase for products
         ↓
4. Products display on website automatically!
```

---

## 📋 Product Fields Reference

When adding a product, here's what each field means:

| Field | Required | Example | Description |
|-------|----------|---------|-------------|
| **name** | ✅ Yes | "iPhone 17 Pro Max" | Product name |
| **category_slug** | ✅ Yes | "iphone" | Category (dropdown) |
| **price** | ✅ Yes | 1299.99 | Price in USD |
| **description** | ⚠️ Recommended | "Latest flagship..." | Product description |
| **image_url** | ⚠️ Recommended | "https://..." | Product image URL |
| **badge** | ❌ Optional | "NEW" or "SALE" | Badge text |
| **stock_quantity** | ✅ Yes | 50 | How many in stock |
| **is_active** | ✅ Yes | true | Show on website? |

---

## 🛠️ Troubleshooting

### "I can't see the Products tab"
- Make sure `is_admin = true` in Supabase profiles table
- Logout and login again
- Clear browser cache

### "Product saved but doesn't show on website"
1. **Check if product is active**: In admin panel, make sure "Is Active" is checked
2. **Run the RLS fix**: Make sure you ran `FIX_RLS_POLICIES.sql`
3. **Check browser console**: Look for errors (press F12)
4. **Verify in Supabase**: Go to Table Editor → products, confirm product exists

### "500 Error when adding product"
- Run `FIX_RLS_POLICIES.sql` (see SUPABASE_FIX_GUIDE.md)
- Check that you're logged in as admin
- Verify your admin status in profiles table

---

## 🎯 Quick Test

Try adding this test product:

```
Name: Test iPhone 17
Category: iphone
Price: 999
Description: This is a test product
Image URL: https://images.unsplash.com/photo-1592286927505-24b683486e36?w=800&q=80
Badge: NEW
Stock: 100
Active: ✅ Yes
```

Save it, then check your website. If it appears, everything is working! 🎉

---

## 📞 Need Help?

If you're stuck:
1. Check browser console (F12) for errors
2. Check Supabase logs: https://supabase.com/dashboard/project/loutcbvftzojsioahtdw/logs
3. Verify you ran `FIX_RLS_POLICIES.sql`
4. Make sure you're logged in and have admin privileges

---

**Quick Links:**
- 🌐 Website: https://keysight-tech.github.io/fordips-tech/
- 👨‍💼 Admin Panel: https://keysight-tech.github.io/fordips-tech/admin.html
- 🔧 Supabase Dashboard: https://supabase.com/dashboard/project/loutcbvftzojsioahtdw
- 📊 Table Editor: https://supabase.com/dashboard/project/loutcbvftzojsioahtdw/editor
- 💾 SQL Editor: https://supabase.com/dashboard/project/loutcbvftzojsioahtdw/sql
