# 🚀 COMPLETE SUPABASE SETUP GUIDE

This guide fixes the migration error and ensures account creation works properly.

---

## ⚠️ THE PROBLEM

You're getting: `ERROR: 42703: column "user_id" does not exist`

**Cause**: Partial migration or conflicting objects in your Supabase database.

**Solution**: Run the 3-step migration below to start fresh.

---

## ✅ THE SOLUTION: 3-STEP MIGRATION

### STEP 1: CLEANUP (Remove old objects)
1. Open **Supabase Dashboard** → https://supabase.com/dashboard
2. Select your **fordips-tech** project
3. Click **SQL Editor** (left sidebar)
4. Click **New query**
5. Open: `STEP_1_CLEANUP.sql`
6. Copy ALL content
7. Paste into Supabase SQL Editor
8. Click **RUN** ✓

**Expected Output:**
```
✅ CLEANUP COMPLETED!
📋 All policies, triggers, functions, and tables have been removed.
```

---

### STEP 2: CREATE TABLES
1. In same **SQL Editor**, click **New query**
2. Open: `STEP_2_CREATE_TABLES.sql`
3. Copy ALL content
4. Paste into editor
5. Click **RUN** ✓

**Expected Output:**
```
✅ TABLES CREATED SUCCESSFULLY!
📊 Created: notifications, help_me_pay_requests
```

You should also see a table showing:
| table_name | column_count |
|-----------|--------------|
| notifications | 9 |
| help_me_pay_requests | 15 |

---

### STEP 3: CREATE FUNCTIONS & POLICIES
1. In same **SQL Editor**, click **New query**
2. Open: `STEP_3_CREATE_FUNCTIONS.sql`
3. Copy ALL content
4. Paste into editor
5. Click **RUN** ✓

**Expected Output:**
```
✅ MIGRATION COMPLETED SUCCESSFULLY!

📊 Tables: notifications, help_me_pay_requests
⚙️ Functions: 9 database functions created
🔒 RLS Policies: Enabled on all tables
✨ Triggers: Auto-update timestamps

🚀 Your Fordips Tech platform is ready!
👤 Account creation should now work properly
```

You should also see a list of functions:
- `cleanup_expired_help_me_pay_requests`
- `create_help_me_pay_request`
- `create_notification`
- `get_help_me_pay_request`
- `get_user_notifications`
- `mark_all_notifications_read`
- `mark_notification_read`
- `search_products`
- `update_help_me_pay_status`
- `update_updated_at_column`

---

## 👤 ENABLE ACCOUNT CREATION

After running the migrations, you need to enable Email Auth in Supabase:

### Enable Email Authentication:
1. In **Supabase Dashboard**, go to **Authentication** (left sidebar)
2. Click **Providers**
3. Find **Email** provider
4. Make sure it's **ENABLED** ✓
5. Settings:
   - ✅ **Enable Email provider**
   - ✅ **Confirm email**: OFF (for testing) or ON (for production)
   - ✅ **Secure email change**: ON (recommended)

### Email Templates (Optional):
1. Go to **Authentication** → **Email Templates**
2. Customize:
   - Confirmation email
   - Magic link email
   - Password reset email

### Test Account Creation:
1. Open your site: https://keysight-tech.github.io/fordips-tech/
2. Click **Account** (top right)
3. Click **Sign Up**
4. Enter:
   - Name: Test User
   - Email: test@example.com
   - Password: Test123456!
5. Click **Create Account**
6. Check for success message

---

## 🧪 VERIFY EVERYTHING WORKS

### 1. Test Product Search
- Type in search bar (header)
- Should see instant results from database
- Try: "laptop", "phone", "keyboard"

### 2. Test Notifications (requires login)
- Login to account
- Bell icon should appear in header
- Click to see notifications dropdown

### 3. Test Help Me Pay
- Add items to cart
- Click **Checkout**
- Enable **"Help Me Pay"** toggle
- Fill helper details
- Submit request

### 4. Test Multi-Currency
- Click globe icon (header)
- Select currency (XAF, NGN, USD, etc.)
- Prices should convert automatically
- Refresh page - currency should persist

### 5. Test AI Chat
- Click blue chat icon (bottom right)
- Ask: "Show me laptops under $1000"
- Should get AI response with products

---

## 📊 WHAT WAS CREATED

### Database Tables (2):
1. **notifications**
   - id, user_id, type, title, message
   - metadata, is_read, created_at, updated_at
   - RLS enabled ✓

2. **help_me_pay_requests**
   - id, requester info, helper info
   - order_data, currency, total_amount
   - payment_link, status, expires_at
   - RLS enabled ✓

### Database Functions (9):
1. `search_products(query)` - Search products by name/description
2. `create_notification(...)` - Create user notification
3. `get_user_notifications(user_id)` - Get user's notifications
4. `mark_notification_read(id)` - Mark notification as read
5. `mark_all_notifications_read(user_id)` - Mark all as read
6. `create_help_me_pay_request(...)` - Create payment request
7. `get_help_me_pay_request(id)` - Get payment request details
8. `update_help_me_pay_status(...)` - Update payment status
9. `cleanup_expired_help_me_pay_requests()` - Expire old requests

### RLS Policies (8):
- Users can view/update their own notifications
- Users can view their own payment requests
- Anyone can view payment requests by link (for helpers)
- System can create/update requests

---

## 🔒 SECURITY NOTES

### Row Level Security (RLS):
- ✅ Enabled on all tables
- ✅ Users can only see their own data
- ✅ Payment links work without login (helper access)
- ✅ Service role bypasses RLS (for admin operations)

### Authentication:
- ✅ Supabase Auth handles all user management
- ✅ Passwords hashed with bcrypt
- ✅ JWT tokens for session management
- ✅ Email verification available (optional)

---

## 🐛 TROUBLESHOOTING

### "ERROR: column user_id does not exist"
**Solution**: You haven't run STEP 1 cleanup. Run all 3 steps in order.

### "Permission denied for table notifications"
**Solution**: Run STEP 3 again (grants permissions).

### "Function search_products does not exist"
**Solution**: Run STEP 3 to create all functions.

### Account creation not working
**Solutions**:
1. Check **Authentication** → **Providers** → Email is enabled
2. Check browser console for errors (F12)
3. Verify SUPABASE_URL and SUPABASE_ANON_KEY in config.js
4. Make sure you ran all 3 migration steps

### Notifications not appearing
**Solutions**:
1. Make sure you're logged in
2. Check browser console (F12) for errors
3. Verify RLS policies are set (run STEP 3)
4. Try creating a test notification in SQL Editor:
```sql
SELECT create_notification(
    auth.uid(),
    'test',
    'Test Notification',
    'This is a test message',
    '{}'::jsonb
);
```

### Help Me Pay not working
**Solutions**:
1. Verify all 3 migration steps completed
2. Check `help_me_pay_requests` table exists
3. Test function in SQL Editor:
```sql
SELECT * FROM get_help_me_pay_request('some-uuid-here');
```

---

## 📞 NEED HELP?

If you still get errors:
1. Share the **exact error message**
2. Share which **step failed** (1, 2, or 3)
3. Check **Supabase Logs**: Dashboard → Logs → select "API"

---

## ✨ NEXT STEPS

After successful migration:

1. ✅ **Test all features** (checklist above)
2. ✅ **Create test account**
3. ✅ **Test product search**
4. ✅ **Test notifications**
5. ✅ **Test Help Me Pay**
6. ✅ **Test currency conversion**
7. ✅ **Invite beta users** to test

---

## 🎉 YOU'RE DONE!

Your Fordips Tech e-commerce platform now has:
- ✅ Real-time product search
- ✅ User notifications system
- ✅ Help Me Pay feature
- ✅ Multi-currency support (15+ currencies)
- ✅ Account creation & authentication
- ✅ AI chat assistants
- ✅ Full Supabase integration

**Live Site**: https://keysight-tech.github.io/fordips-tech/

Enjoy your powerful e-commerce platform! 🚀
