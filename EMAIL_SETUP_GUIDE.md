# 📧 Complete Email & Notifications Setup Guide

## Overview

This guide will help you set up:
- ✅ User account verification emails
- ✅ Order confirmation emails
- ✅ Password reset emails
- ✅ Welcome emails for new users
- ✅ Admin notifications for new orders

---

## Part 1: Configure Supabase Email Templates

### Step 1: Access Email Templates

1. Go to your Supabase Dashboard:
   ```
   https://supabase.com/dashboard/project/loutcbvftzojsioahtdw
   ```

2. Click **Authentication** in the left sidebar

3. Click **Email Templates**

### Step 2: Configure Email Verification Template

1. Select **"Confirm signup"** template

2. Customize the template:

```html
<h2>Welcome to Fordips Tech!</h2>

<p>Hi {{ .Email }},</p>

<p>Thanks for signing up! Please confirm your email address by clicking the button below:</p>

<p><a href="{{ .ConfirmationURL }}" style="background: #2CC4C4; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Confirm Email Address</a></p>

<p>Or copy and paste this URL into your browser:</p>
<p>{{ .ConfirmationURL }}</p>

<p>If you didn't create an account with us, please ignore this email.</p>

<p>Best regards,<br>
Fordips Tech Team</p>
```

3. Click **Save**

### Step 3: Configure Welcome Email (Optional)

1. Go to **Database** → **Triggers**

2. Create a trigger to send welcome emails after email confirmation

### Step 4: Configure Password Reset Template

1. Select **"Reset password"** template

2. Customize:

```html
<h2>Reset Your Password</h2>

<p>Hi,</p>

<p>We received a request to reset your password. Click the button below to create a new password:</p>

<p><a href="{{ .ConfirmationURL }}" style="background: #2CC4C4; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a></p>

<p>Or copy and paste this URL into your browser:</p>
<p>{{ .ConfirmationURL }}</p>

<p>If you didn't request this, please ignore this email.</p>

<p>Best regards,<br>
Fordips Tech Team</p>
```

3. Click **Save**

---

## Part 2: Order Confirmation Emails

### Option A: Use Supabase Edge Functions (Recommended)

1. Create an Edge Function for order confirmations:

```bash
supabase functions new send-order-confirmation
```

2. Add the function code (see below)

### Option B: Use Third-Party Service (Easier)

**Using SendGrid, Mailgun, or Resend:**

1. Sign up for a free account at:
   - SendGrid: https://sendgrid.com (Free: 100 emails/day)
   - Resend: https://resend.com (Free: 100 emails/day)
   - Mailgun: https://mailgun.com (Free: 5000 emails/month)

2. Get your API key

3. Create a database function to send emails

---

## Part 3: Set Up Order Confirmation Function

### Create Database Function for Order Emails

1. Go to **SQL Editor** in Supabase

2. Run this SQL:

```sql
-- Create function to send order confirmation
CREATE OR REPLACE FUNCTION send_order_confirmation()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert into a notifications queue table
    INSERT INTO email_queue (
        to_email,
        subject,
        template,
        data,
        created_at
    ) VALUES (
        NEW.customer_email,
        'Order Confirmation - Order #' || NEW.order_number,
        'order_confirmation',
        json_build_object(
            'order_number', NEW.order_number,
            'customer_name', NEW.customer_name,
            'total_amount', NEW.total_amount,
            'order_date', NEW.created_at
        ),
        NOW()
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on orders table
DROP TRIGGER IF EXISTS on_order_created ON orders;
CREATE TRIGGER on_order_created
    AFTER INSERT ON orders
    FOR EACH ROW
    EXECUTE FUNCTION send_order_confirmation();
```

3. Create email queue table:

```sql
-- Email queue table
CREATE TABLE IF NOT EXISTS email_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    to_email TEXT NOT NULL,
    subject TEXT NOT NULL,
    template TEXT NOT NULL,
    data JSONB,
    sent BOOLEAN DEFAULT false,
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_email_queue_sent ON email_queue(sent);
```

---

## Part 4: Email Service Integration

### Using Resend (Recommended - Easiest)

1. Sign up at https://resend.com

2. Get your API key

3. Create Supabase Edge Function:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

serve(async (req) => {
  const { to, subject, orderNumber, customerName, totalAmount, items } = await req.json()

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${RESEND_API_KEY}`
    },
    body: JSON.stringify({
      from: 'Fordips Tech <orders@fordipstech.com>',
      to: [to],
      subject: subject,
      html: `
        <h2>Thank You for Your Order!</h2>
        <p>Hi ${customerName},</p>
        <p>Your order has been confirmed and is being processed.</p>

        <h3>Order Details</h3>
        <p><strong>Order Number:</strong> ${orderNumber}</p>
        <p><strong>Total Amount:</strong> $${totalAmount}</p>

        <h3>Items Ordered</h3>
        ${items.map(item => `
          <p>${item.product_name} - Qty: ${item.quantity} - $${item.subtotal}</p>
        `).join('')}

        <p>We'll send you another email when your order ships.</p>

        <p>Track your order: <a href="https://keysight-tech.github.io/fordips-tech/my-account.html">View Order Status</a></p>

        <p>Best regards,<br>Fordips Tech Team</p>
      `
    })
  })

  const data = await res.json()
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' }
  })
})
```

4. Deploy the function:

```bash
supabase functions deploy send-order-confirmation
```

5. Set the environment variable:

```bash
supabase secrets set RESEND_API_KEY=your_api_key_here
```

---

## Part 5: Simple Email Setup (No Edge Functions)

If you want a simpler approach without Edge Functions:

### Use Zapier or Make.com

1. **Sign up for Zapier** (free): https://zapier.com

2. **Create a Zap:**
   - Trigger: Supabase - New Row in `orders` table
   - Action: Gmail/SendGrid - Send Email

3. **Configure the email template:**
   ```
   To: {{customer_email}}
   Subject: Order Confirmation - Order #{{order_number}}

   Hi {{customer_name}},

   Thank you for your order!

   Order Number: {{order_number}}
   Total: ${{total_amount}}

   View your order: https://keysight-tech.github.io/fordips-tech/my-account.html

   Best regards,
   Fordips Tech
   ```

---

## Part 6: Testing Email Flow

### Test User Signup Emails

1. Go to your website: https://keysight-tech.github.io/fordips-tech/

2. Click "My Account" → "Sign Up"

3. Create a test account with your email

4. Check your email for verification link

5. Click the link to verify

### Test Order Confirmation

1. Add products to cart

2. Go to checkout

3. Complete the order form

4. Submit order

5. Check your email for order confirmation

---

## Part 7: Email Settings in Supabase

### Configure SMTP Settings (Optional)

If you want to use your own email server:

1. Go to **Project Settings** → **Authentication**

2. Scroll to **SMTP Settings**

3. Enter your SMTP details:
   - **Host**: smtp.gmail.com (for Gmail)
   - **Port**: 587
   - **Username**: your-email@gmail.com
   - **Password**: Your app password
   - **Sender Email**: noreply@yourdomain.com
   - **Sender Name**: Fordips Tech

4. Click **Save**

### Enable Email Confirmations

1. Go to **Authentication** → **Settings**

2. Make sure these are enabled:
   - ✅ Enable email confirmations
   - ✅ Enable email change confirmations
   - ✅ Secure email change

3. Set **Site URL**: `https://keysight-tech.github.io/fordips-tech/`

4. Set **Redirect URLs**: `https://keysight-tech.github.io/fordips-tech/**`

---

## What's Already Working

Your website already has:

✅ **User Authentication**
- Sign up with email verification
- Login/Logout
- Password requirements
- Session management

✅ **Order System**
- Shopping cart (persistent for logged-in users)
- Guest checkout
- Order placement
- Order history tracking

✅ **Database Security**
- Row Level Security (RLS) enabled
- Secure authentication
- Protected user data

---

## Next Steps

1. ✅ **Run DEPLOY_ALL.sql** (if you haven't already)

2. 📧 **Set up email verification:**
   - Go to Supabase → Authentication → Email Templates
   - Customize the templates
   - Enable email confirmations

3. 🛍️ **Test the full flow:**
   - Create account → Verify email
   - Browse products → Add to cart
   - Checkout → Place order
   - View order in My Account page

4. 📨 **(Optional) Set up order emails:**
   - Use Resend/SendGrid for order confirmations
   - Or use Zapier for simple automation

---

## Quick Links

- **Live Website**: https://keysight-tech.github.io/fordips-tech/
- **My Account Page**: https://keysight-tech.github.io/fordips-tech/my-account.html
- **Admin Panel**: https://keysight-tech.github.io/fordips-tech/admin.html
- **Supabase Dashboard**: https://supabase.com/dashboard/project/loutcbvftzojsioahtdw

---

## Troubleshooting

**Emails not sending?**
1. Check Supabase logs: Dashboard → Logs → Auth Logs
2. Verify SMTP settings are correct
3. Check spam folder
4. Make sure email confirmations are enabled

**Order emails not working?**
1. Check if email queue table exists
2. Verify trigger is created
3. Check Supabase logs for errors
4. Test with a third-party service first

**Users not getting verified?**
1. Make sure "Enable email confirmations" is ON
2. Check email template is configured
3. Verify SMTP settings
4. Check user's spam folder

---

## Summary

Your e-commerce website now has:

✅ Complete user authentication system
✅ Email verification for new accounts
✅ Shopping cart with persistent storage
✅ Order placement and tracking
✅ Order history in My Account page
✅ Admin panel for management
✅ Secure database with RLS

**Just configure the email templates in Supabase and you're fully operational!** 🎉
