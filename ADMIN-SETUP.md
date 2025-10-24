# Fordips Tech - Admin Panel Setup Guide

## 🔐 Admin Access Setup

The admin panel requires a user account with admin privileges set in the Supabase database.

### Step 1: Create Admin Account

1. Go to the main website: https://keysight-tech.github.io/fordips-tech/
2. Click the **Account** button in the navigation
3. Click **Sign Up** tab
4. Create an account with:
   - **Email**: brineketum@gmail.com
   - **Password**: (Choose a secure password)
   - **Full Name**: Brian Ketum

### Step 2: Grant Admin Privileges

After creating your account, you need to set the `is_admin` flag in Supabase:

#### Option A: Using Supabase Dashboard (Recommended)

1. Go to https://supabase.com/dashboard
2. Open your project: `loutcbvftzojsioahtdw`
3. Navigate to **Table Editor** → **profiles**
4. Find your user (search by email: brineketum@gmail.com)
5. Edit the row and set `is_admin` to `true`
6. Save changes

#### Option B: Using SQL Editor

1. Go to https://supabase.com/dashboard
2. Open your project: `loutcbvftzojsioahtdw`
3. Navigate to **SQL Editor**
4. Run this query (replace with your actual user ID):

```sql
-- First, find your user ID
SELECT id, email FROM auth.users WHERE email = 'brineketum@gmail.com';

-- Then update the profiles table with your user ID
UPDATE profiles
SET is_admin = true
WHERE id = 'YOUR_USER_ID_HERE';

-- Verify it worked
SELECT * FROM profiles WHERE is_admin = true;
```

### Step 3: Access Admin Panel

After setting admin privileges:

1. **GitHub Pages URL**: https://keysight-tech.github.io/fordips-tech/admin.html
2. **Custom Domain URL**: https://fordipstech.com/admin.html (once DNS is configured)

The admin panel will automatically:
- Check if you're logged in
- Verify admin privileges
- Redirect to homepage if not authorized

## 📊 Admin Panel Features

Once logged in as admin, you can:

### Dashboard Tab
- View total products, orders, revenue
- See recent orders
- Monitor contact submissions
- Track newsletter subscribers

### Products Tab
- Add new products
- Edit existing products
- Delete products
- Filter by category
- View product images

### Orders Tab
- View all orders
- Update order status (pending, processing, shipped, delivered)
- View order details and items
- Track order history

### Contact Submissions Tab
- View all contact form submissions
- Mark messages as read/replied
- View customer email and message
- Add admin notes

### Newsletter Tab
- View all newsletter subscribers
- Export subscriber list
- Track subscription dates

## 🔒 Security Notes

1. **Admin Credentials**: Keep your admin email and password secure
2. **is_admin Flag**: Only set to true for authorized administrators
3. **Supabase Access**: Protect your Supabase dashboard credentials
4. **Row Level Security**: Ensure RLS policies are enabled on sensitive tables

## 🌐 Website URLs

### Main Site
- **GitHub Pages**: https://keysight-tech.github.io/fordips-tech/
- **Custom Domain**: https://fordipstech.com/ (once DNS configured)

### Admin Panel
- **GitHub Pages**: https://keysight-tech.github.io/fordips-tech/admin.html
- **Custom Domain**: https://fordipstech.com/admin.html

### My Account (User Dashboard)
- **GitHub Pages**: https://keysight-tech.github.io/fordips-tech/my-account.html
- **Custom Domain**: https://fordipstech.com/my-account.html

## ✅ Testing Checklist

- [ ] Can create user account on main site
- [ ] Admin flag set in Supabase profiles table
- [ ] Can access admin panel URL
- [ ] Dashboard loads with statistics
- [ ] Can view products
- [ ] Can add/edit/delete products
- [ ] Can view and update orders
- [ ] Can view contact submissions
- [ ] Can view newsletter subscribers
- [ ] Logout works properly

## 🆘 Troubleshooting

### "You do not have admin privileges" Error
**Solution**: Make sure the `is_admin` flag is set to `true` in the profiles table for your user.

### Admin Panel Redirects to Homepage
**Cause**: Either not logged in or not marked as admin.
**Solution**:
1. Log in first on the main site
2. Verify is_admin = true in Supabase

### Dashboard Shows "0" for Everything
**Cause**: No data in database yet.
**Solution**: Add products through admin panel, place test orders through main site.

### Cannot Add Products
**Cause**: Missing image URL or required fields.
**Solution**: Ensure all required fields are filled, especially name, price, and image URL.

## 📧 Admin Email Notifications

The system sends email notifications to **brineketum@gmail.com** for:
- New orders placed
- Contact form submissions
- Newsletter subscriptions

These are stored in the `contact_notifications` table in Supabase.

## 🔧 Database Tables Used

- `profiles` - User profiles with is_admin flag
- `products` - Product catalog
- `orders` - Customer orders
- `order_items` - Items in each order
- `contact_messages` - Contact form submissions
- `newsletter_subscribers` - Email subscribers
- `favorites` - User favorite products
- `contact_notifications` - Email notification queue

---

**Last Updated**: 2025-10-24
**Admin Email**: brineketum@gmail.com
**Supabase Project**: loutcbvftzojsioahtdw
