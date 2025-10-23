# Fordips Tech - Complete Setup Instructions

## Overview

This document provides step-by-step instructions to set up and deploy your Fordips Tech e-commerce website with Supabase backend integration.

---

## Prerequisites

- A Supabase account (free tier available at [supabase.com](https://supabase.com))
- Web browser
- Text editor (optional, for configuration)

---

## Part 1: Supabase Database Setup

### Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign in or create a free account
3. Click "New Project"
4. Fill in the project details:
   - **Project Name**: Fordips Tech
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose closest to your location
   - **Pricing Plan**: Free (or select paid if needed)
5. Click "Create new project"
6. Wait 2-3 minutes for the project to be created

### Step 2: Run the Database Migration

1. In your Supabase project dashboard, click on the **SQL Editor** in the left sidebar
2. Click "New Query"
3. Open the file `supabase-migration.sql` from your project folder
4. Copy the entire contents
5. Paste into the Supabase SQL Editor
6. Click "Run" or press `Ctrl+Enter`
7. You should see a success message: "Fordips Tech database schema created successfully!"

### Step 3: Seed the Products Database

1. Still in the SQL Editor, click "New Query" again
2. Open the file `seed-products.sql` from your project folder
3. Copy the entire contents
4. Paste into the Supabase SQL Editor
5. Click "Run" or press `Ctrl+Enter`
6. You should see: "✅ Successfully inserted 75 products!"

### Step 4: Get Your Supabase Credentials

1. In Supabase, go to **Settings** (gear icon in left sidebar)
2. Click on **API** in the settings menu
3. You'll see two important values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public** key (under "Project API keys")
4. Copy both of these values - you'll need them in the next step

---

## Part 2: Configure Your Website

### Step 5: Update Supabase Configuration

1. Open the file `supabase-integration.js` in your text editor
2. Find lines 14-15 at the top of the file:
   ```javascript
   const SUPABASE_URL = 'https://ugoqxizvtcmiexadffvh.supabase.co';
   const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY_HERE';
   ```
3. Replace `YOUR_SUPABASE_ANON_KEY_HERE` with your actual anon key from Step 4
4. The URL should already be correct (`https://ugoqxizvtcmiexadffvh.supabase.co`)
5. Save the file

---

## Part 3: Create Your First Admin User

### Step 6: Sign Up for an Account

1. Open `index.html` in your web browser
2. Click on "My Account" in the navigation
3. Click on the "Sign Up" tab
4. Enter your details:
   - Full Name
   - Email
   - Password (minimum 6 characters)
   - Confirm Password
5. Click "Create Account"
6. Check your email for a verification link from Supabase
7. Click the verification link to verify your account

### Step 7: Make Yourself an Admin

1. Go back to your Supabase project dashboard
2. Click on **SQL Editor** in the left sidebar
3. Click "New Query"
4. Paste this SQL command (replace with YOUR email):
   ```sql
   UPDATE profiles
   SET is_admin = true
   WHERE email = 'your-email@example.com';
   ```
5. Click "Run"
6. You should see "Success. 1 rows affected."

---

## Part 4: Access the Admin Panel

### Step 8: Log Into Admin Panel

1. Open `admin.html` in your web browser
2. You'll be automatically redirected to login if not logged in
3. Or, if already logged in on `index.html`, you'll see the admin dashboard
4. The admin panel allows you to:
   - View dashboard statistics
   - Manage all products (add, edit, delete)
   - Manage orders and update status
   - View contact form submissions
   - View newsletter subscribers

---

## Part 5: Testing Your Website

### Step 9: Test All Features

#### Test Product Browsing
1. Open `index.html`
2. Scroll to the products section
3. You should see 75 products loaded from the database
4. Try filtering by category

#### Test Shopping Cart
1. Click "Add to Cart" on any product
2. Click the cart icon in the header
3. Verify the product appears in your cart
4. Try changing quantities

#### Test Checkout
1. With items in your cart, click "Proceed to Checkout"
2. Fill in the checkout form
3. Submit the order
4. You should get an order number

#### Test Contact Form
1. Scroll to the contact section
2. Fill in and submit the contact form
3. Check the admin panel to see the submission

#### Test Newsletter
1. Find the newsletter section
2. Enter an email and subscribe
3. Check the admin panel to see the new subscriber

#### Test Admin Panel
1. Go to `admin.html`
2. Try adding a new product
3. Try editing an existing product
4. Try updating an order status
5. View contact submissions and newsletter subscribers

---

## Part 6: Deployment (Optional)

### Option A: Deploy to Netlify

1. Create a [Netlify](https://netlify.com) account
2. Click "Add new site" → "Deploy manually"
3. Drag and drop your entire project folder
4. Your site will be live in minutes!

### Option B: Deploy to Vercel

1. Create a [Vercel](https://vercel.com) account
2. Click "New Project"
3. Import your project folder
4. Click "Deploy"
5. Your site will be live!

### Option C: Deploy to GitHub Pages

1. Create a GitHub repository
2. Push your files to the repository
3. Go to Settings → Pages
4. Select main branch as source
5. Your site will be live at `https://username.github.io/repo-name`

---

## Troubleshooting

### Issue: "Invalid API key"
**Solution**: Make sure you copied the correct anon key from Supabase Settings → API

### Issue: "Products not loading"
**Solution**:
1. Check browser console for errors (F12)
2. Verify the seed-products.sql file was run successfully
3. Check that products exist: In Supabase, go to Table Editor → products

### Issue: "Cannot create account"
**Solution**:
1. Check that email is valid format
2. Verify password is at least 6 characters
3. Check Supabase Auth settings are enabled

### Issue: "Not authorized to access admin panel"
**Solution**:
1. Make sure you ran the SQL command to set is_admin = true
2. Log out and log back in
3. Check profiles table in Supabase to verify is_admin column is true

### Issue: "CORS errors in browser"
**Solution**:
1. Make sure you're using the correct Supabase URL
2. Check that your domain is allowed in Supabase Settings → API → URL Configuration

---

## Security Best Practices

### Important Security Notes:

1. **Never commit your anon key to public repositories** - While the anon key is "public" in the sense that it's used client-side, you should still protect it
2. **Row Level Security (RLS) is enabled** - This protects your data even if someone has your anon key
3. **Use environment variables for production** - Consider using environment variables for your Supabase credentials in production
4. **Regular backups** - Set up automatic backups in Supabase project settings
5. **Monitor usage** - Check your Supabase dashboard regularly for unusual activity

---

## Database Schema Overview

Your database includes the following tables:

### Core Tables:
- **categories** - Product categories (iPhone, Samsung, Laptops, etc.)
- **products** - All products with prices, images, stock, etc.
- **profiles** - User profiles (extends Supabase auth.users)
- **orders** - Customer orders
- **order_items** - Individual items in each order
- **cart_items** - Persistent shopping carts for logged-in users
- **contact_submissions** - Contact form messages
- **newsletter_subscriptions** - Newsletter email addresses

### Security:
All tables have Row Level Security (RLS) enabled with appropriate policies:
- Public can view products and categories
- Users can only see their own orders and cart
- Admins can see and manage everything
- Anyone can submit contact forms and subscribe to newsletter

---

## File Structure

```
fordips-tech/
├── index.html                    # Main website
├── admin.html                    # Admin panel
├── admin.js                      # Admin panel functionality
├── admin-styles.css              # Admin panel styles
├── styles.css                    # Main website styles
├── script.js                     # Main website JavaScript
├── forms.js                      # Form handling
├── products.js                   # Original products (now in DB)
├── supabase-integration.js       # Supabase client & functions
├── supabase-migration.sql        # Database schema
├── seed-products.sql             # Product data
└── SETUP_INSTRUCTIONS.md         # This file
```

---

## Next Steps

1. **Customize Design**: Modify colors, fonts, and layouts in `styles.css`
2. **Add More Products**: Use the admin panel to add products
3. **Set Up Email**: Configure email templates in Supabase for order confirmations
4. **Add Payment Processing**: Integrate Stripe or PayPal for real payments
5. **SEO Optimization**: Add meta tags, sitemap, and optimize images
6. **Analytics**: Add Google Analytics or similar tracking
7. **Customer Dashboard**: Create a user dashboard for order history (currently basic)

---

## Support

If you encounter any issues:

1. Check browser console (F12) for error messages
2. Check Supabase logs in your project dashboard
3. Verify all SQL migrations ran successfully
4. Make sure your Supabase credentials are correct

---

## Features Included

✅ **User Features:**
- Browse products by category
- Search products
- Add to cart (persists for logged-in users)
- Guest checkout
- Account creation & login
- Order placement
- Contact form
- Newsletter subscription

✅ **Admin Features:**
- Dashboard with statistics
- Product management (CRUD)
- Order management & status updates
- Contact submission viewing
- Newsletter subscriber management
- CSV export for subscribers

✅ **Security:**
- Row Level Security (RLS) on all tables
- Secure authentication with Supabase Auth
- Admin-only access controls
- Protected API endpoints

---

## Congratulations!

Your Fordips Tech e-commerce website is now fully set up and ready to use! 🎉

The website includes:
- 75 pre-loaded products
- Full shopping cart functionality
- User authentication
- Complete admin panel
- Order management system
- Contact form integration
- Newsletter system

You can now start customizing and adding your own products!
