# Contact Form System with Admin Notifications

Complete contact form system for Fordips Tech with automatic admin notifications and message storage.

## Features

✅ **Contact Form Submission**
- Captures: Name, Email, Subject, Message
- Records IP address and user agent
- Timestamps for tracking

✅ **Dual Notifications**
- **Admin Notification** → Sent to: `brineketum@gmail.com`
- **Customer Confirmation** → Sent to customer's email
- Both stored in database for tracking

✅ **Database Storage**
- All messages stored in Supabase `contact_messages` table
- Notifications tracked in `contact_notifications` table
- Status tracking: new → read → replied → archived

✅ **Message Tracking**
- View all contact messages
- Filter by status (new, read, replied, archived)
- Get unread message count
- Track when messages were read/replied

## Setup Instructions

### 1. Run SQL Setup in Supabase

1. Go to your Supabase Dashboard: https://app.supabase.com
2. Select your Fordips Tech project
3. Navigate to **SQL Editor**
4. Create a new query
5. Copy and paste the contents of `contact-setup.sql`
6. Click **Run** to execute

This will create:
- `contact_messages` table
- `contact_notifications` table
- Indexes for performance
- Row Level Security policies
- Helper functions

### 2. Verify Installation

Run this query in Supabase SQL Editor:

```sql
-- Check if tables exist
SELECT EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'contact_messages'
) as contact_messages_exists,
EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'contact_notifications'
) as contact_notifications_exists;
```

Expected result: Both should return `true`

### 3. Test the Contact Form

1. Go to your website
2. Navigate to the "Get In Touch" section
3. Fill out the contact form:
   - Name: Test User
   - Email: your-email@example.com
   - Subject: Test Message
   - Message: Testing the contact system
4. Click "Send Message"

You should see:
- Success message confirming submission
- Notification that admin has been notified
- Email confirmation to the customer

### 4. View Messages in Supabase

```sql
-- View all contact messages
SELECT * FROM contact_messages
ORDER BY created_at DESC;

-- View new/unread messages
SELECT * FROM contact_messages
WHERE status = 'new'
ORDER BY created_at DESC;

-- View notifications for a message
SELECT cm.subject, cm.name, cm.email,
       cn.notification_type, cn.recipient_email, cn.status
FROM contact_messages cm
LEFT JOIN contact_notifications cn ON cm.id = cn.contact_message_id
ORDER BY cm.created_at DESC;
```

## How It Works

### When a User Submits the Contact Form:

1. **Form Submission**
   - User fills out contact form
   - JavaScript validates input
   - Form data sent to `contact-system.js`

2. **Database Storage**
   - Message saved to `contact_messages` table
   - Status set to 'new'
   - IP address and user agent recorded

3. **Notification Creation**
   - Two notifications created in `contact_notifications` table:
     - Admin notification → brineketum@gmail.com
     - Customer confirmation → customer's email

4. **User Feedback**
   - Success message displayed
   - Confirmation that admin was notified
   - Page notification popup

## Admin Operations

### View New Messages

```sql
SELECT id, name, email, subject, created_at, status
FROM contact_messages
WHERE status = 'new'
ORDER BY created_at DESC;
```

### Mark Message as Read

```sql
UPDATE contact_messages
SET status = 'read', read_at = NOW()
WHERE id = 'message-uuid-here';
```

### Mark Message as Replied

```sql
UPDATE contact_messages
SET status = 'replied',
    replied_at = NOW(),
    admin_notes = 'Responded via email on [date]'
WHERE id = 'message-uuid-here';
```

### Get Message Statistics

```sql
SELECT
    COUNT(*) as total_messages,
    COUNT(CASE WHEN status = 'new' THEN 1 END) as new_messages,
    COUNT(CASE WHEN status = 'read' THEN 1 END) as read_messages,
    COUNT(CASE WHEN status = 'replied' THEN 1 END) as replied_messages,
    COUNT(CASE WHEN status = 'archived' THEN 1 END) as archived_messages
FROM contact_messages;
```

### View Message with Full Details

```sql
SELECT
    cm.*,
    (SELECT COUNT(*) FROM contact_notifications
     WHERE contact_message_id = cm.id) as notification_count,
    (SELECT COUNT(*) FROM contact_notifications
     WHERE contact_message_id = cm.id
     AND status = 'sent') as sent_notifications
FROM contact_messages cm
WHERE cm.id = 'message-uuid-here';
```

## Database Schema

### contact_messages Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | TEXT | Customer name |
| email | TEXT | Customer email |
| subject | TEXT | Message subject |
| message | TEXT | Message content |
| status | TEXT | new, read, replied, archived |
| ip_address | TEXT | Sender's IP |
| user_agent | TEXT | Browser info |
| created_at | TIMESTAMPTZ | When sent |
| updated_at | TIMESTAMPTZ | Last update |
| read_at | TIMESTAMPTZ | When read |
| replied_at | TIMESTAMPTZ | When replied |
| admin_notes | TEXT | Admin notes |

### contact_notifications Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| contact_message_id | UUID | References contact_messages |
| recipient_email | TEXT | Who receives notification |
| notification_type | TEXT | admin_notification or customer_confirmation |
| subject | TEXT | Email subject |
| message | TEXT | Email content |
| sent_at | TIMESTAMPTZ | When created |
| status | TEXT | pending, sent, failed |
| error_message | TEXT | If failed |

## Configuration

### Admin Email

The admin email is set in `contact-system.js`:

```javascript
const ADMIN_EMAIL = 'brineketum@gmail.com';
```

To change the admin email, update this constant.

### Notification Messages

Notification templates are in `contact-system.js` in the `sendContactNotifications()` function.

You can customize:
- Email subject lines
- Email body content
- Notification timing

## Troubleshooting

### Messages not saving

1. Check Supabase connection in browser console
2. Verify `contact-setup.sql` was run successfully
3. Check browser console for errors
4. Verify RLS policies are set correctly

### Notifications not created

1. Check `contact_notifications` table in Supabase
2. Verify foreign key relationship exists
3. Check for JavaScript errors in console
4. Ensure `supabaseClient` is defined globally

### Offline/Fallback Mode

If Supabase is unavailable:
- Messages saved to localStorage
- Notification shown to user
- Message will be synced when connection restored

## Security

✅ **Row Level Security (RLS)** enabled on both tables
✅ **Anyone can submit** contact forms
✅ **Only admins can view** all messages
✅ **Users can view** their own messages
✅ **IP tracking** for security
✅ **Input validation** in JavaScript

## Testing Checklist

- [ ] SQL setup script runs without errors
- [ ] Tables created successfully
- [ ] Contact form submission works
- [ ] Success message displays
- [ ] Message appears in `contact_messages` table
- [ ] Two notifications created in `contact_notifications` table
- [ ] Admin email is correct (brineketum@gmail.com)
- [ ] Customer email is captured correctly
- [ ] Status tracking works (new → read → replied)
- [ ] Unread count function works
- [ ] Translations work in all languages (EN, FR, PCM)

## Files Involved

- `contact-system.js` - Main contact system logic
- `contact-setup.sql` - Database schema and setup
- `forms.js` - Contact form handler
- `translations.js` - Multi-language support
- `index.html` - Contact form HTML

## Admin Dashboard (Future Enhancement)

To build an admin dashboard for managing messages:

1. Create admin page with authentication
2. Use `window.contactSystem` functions:
   - `loadContactMessages(status)` - Get messages
   - `markContactAsRead(id)` - Mark as read
   - `updateContactStatus(id, status)` - Update status
   - `getUnreadContactCount()` - Get unread count
   - `getContactNotifications(id)` - View notifications

## Support

For issues or questions:
- Email: support@fordipstech.com
- Check browser console for errors
- Verify Supabase connection
- Review SQL execution logs

---

**System Ready!** ✅

Your contact form system is now fully configured with admin notifications and database storage.
