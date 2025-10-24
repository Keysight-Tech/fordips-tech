# Stripe Payment Integration Setup Guide

## 🎯 Overview
Your Fordips Tech website now has Stripe payment processing integrated! Customers can pay with credit cards, Apple Pay, and Google Pay in real-time.

## 🚀 Quick Setup (5 minutes)

### Step 1: Create a Stripe Account
1. Go to [https://stripe.com](https://stripe.com)
2. Click "Start now" (it's FREE - no monthly fees)
3. Sign up with your email
4. Complete the account verification

### Step 2: Get Your API Keys
1. Log in to your Stripe Dashboard
2. Click on "Developers" in the left sidebar
3. Click on "API keys"
4. You'll see two keys:
   - **Publishable key** (starts with `pk_test_`)
   - **Secret key** (starts with `sk_test_`) - Keep this private!

### Step 3: Add Your Publishable Key
1. Open `stripe-payment.js` in your website files
2. Find line 13: `const STRIPE_PUBLISHABLE_KEY = 'pk_test_51YOUR_TEST_KEY_HERE';`
3. Replace `pk_test_51YOUR_TEST_KEY_HERE` with your actual publishable key
4. Save the file

**Example:**
```javascript
const STRIPE_PUBLISHABLE_KEY = 'pk_test_51Hxxx...your_actual_key_here';
```

### Step 4: Test the Integration
1. Add products to cart
2. Go to checkout
3. Select "Credit Card" as payment method
4. Click "Place Order"
5. You'll be redirected to Stripe's secure checkout page
6. Use test card: `4242 4242 4242 4242`
   - Expiry: Any future date
   - CVC: Any 3 digits
   - ZIP: Any 5 digits

### Step 5: Go Live (When Ready)
1. Complete Stripe account verification in the dashboard
2. Get your LIVE API keys from the dashboard
3. Replace `pk_test_` key with `pk_live_` key
4. You're live! 🎉

## 💳 Test Cards

Use these test card numbers in TEST mode:

| Card Number | Description |
|-------------|-------------|
| `4242 4242 4242 4242` | Successful payment |
| `4000 0025 0000 3155` | Requires 3D Secure authentication |
| `4000 0000 0000 9995` | Payment declined |

**Important:** Always use test cards in test mode. Real cards will be declined.

## 📧 Email Receipts

Stripe automatically sends email receipts to customers after successful payments. You can customize these emails in your Stripe Dashboard under Settings → Emails.

## 💰 Fees

Stripe charges **2.9% + $0.30** per successful transaction. There are no monthly fees or setup costs.

## 🔒 Security

- All payment information is handled by Stripe (PCI-compliant)
- Your website never stores credit card numbers
- Stripe uses industry-standard encryption
- Customers' payment data is secure

## 🛠️ Advanced Features (Optional)

### Enable More Payment Methods
In your Stripe Dashboard:
1. Go to Settings → Payment methods
2. Enable: Apple Pay, Google Pay, etc.
3. These will automatically appear at checkout

### Add Webhooks (Recommended)
Webhooks notify your website when payments succeed/fail:
1. Go to Developers → Webhooks
2. Add endpoint: `https://your-website.com/stripe-webhook`
3. Select events: `checkout.session.completed`, `payment_intent.succeeded`

### View Payments
- Dashboard → Payments to see all transactions
- View customer details, refund payments, download reports

## 🆘 Troubleshooting

### "Stripe not initialized" Error
- **Solution:** Make sure you've added your publishable key in `stripe-payment.js`

### Payment Page Doesn't Load
- **Solution:** Check browser console for errors. Ensure Stripe.js is loaded (check network tab)

### "Invalid API Key" Error
- **Solution:** Double-check you copied the PUBLISHABLE key (pk_test_), not the secret key

## 📚 Documentation

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Dashboard](https://dashboard.stripe.com)
- [Test Cards](https://stripe.com/docs/testing)

## ✅ Checklist

- [ ] Created Stripe account
- [ ] Got publishable key from dashboard
- [ ] Added key to `stripe-payment.js`
- [ ] Tested with test card `4242 4242 4242 4242`
- [ ] Payment successful!

## 🎉 You're Done!

Your customers can now make real-time payments on your website. All payments go directly to your Stripe account, and you can transfer funds to your bank account from the Stripe Dashboard.

**Questions?** Contact Stripe Support (they have 24/7 chat support)
