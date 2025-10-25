# Admin Profile System - Complete Setup Guide

## 🎯 World-Class Admin Profile Section

A comprehensive, modern admin profile system with deep Supabase integration designed following industry standards (Stripe, Shopify, Vercel).

---

## ✨ Features

### 📊 Personal Information
- Real-time profile editing
- Avatar management with status badge
- Contact information management
- Address and location tracking
- Activity statistics (days active, total actions, messages)

### 🔐 Security Settings
- Two-Factor Authentication toggle
- Login notifications
- Automatic session timeout
- IP restriction capability
- Password change functionality
- Session management

### 📈 Activity Log
- Real-time activity tracking
- Recent orders monitoring
- Contact message tracking
- Comprehensive audit trail
- Action timestamps
- IP address logging

### 🔑 API Key Management
- Generate API keys
- View and manage active keys
- Copy to clipboard functionality
- Revoke keys securely
- Usage tracking
- Expiration management

### 🔔 Notification Preferences
- Order notifications
- Contact form alerts
- Newsletter subscription alerts
- System notifications
- Granular control over each type

### 📱 Statistics Dashboard
- Total revenue tracking
- Active users count
- Performance metrics
- Trend indicators
- Real-time updates from Supabase

---

## 🛠️ Installation Steps

### Step 1: Database Setup

1. **Open Supabase Dashboard**
   - Go to: https://app.supabase.com
   - Select your Fordips Tech project

2. **Run Database Script**
   - Go to SQL Editor (left sidebar)
   - Click "+ New query"
   - Copy ALL content from `admin-profile-setup.sql`
   - Paste and click "Run"

3. **Verify Tables Created**
```sql
SELECT EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'admin_settings'
) as admin_settings_exists,
EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'api_keys'
) as api_keys_exists;
```

### Step 2: Integrate into Admin Panel

1. **Add CSS Link to admin.html**
```html
<link rel="stylesheet" href="admin-profile.css">
```

2. **Add JavaScript Link**
```html
<script src="admin-profile.js" defer></script>
```

3. **Add Profile Tab to Navigation**
Find the admin-tabs section and add:
```html
<button class="admin-tab" onclick="showTab('profile')">Profile & Settings</button>
```

4. **Add Profile Content**
Copy the content from `admin-profile-section.html` and paste it inside the admin-main container.

### Step 3: Set Admin Permissions

The SQL script automatically sets admin status for brineketum@gmail.com.

To add more admins:
```sql
UPDATE profiles
SET is_admin = true,
    admin_role = 'admin'
WHERE email = 'another-admin@example.com';
```

---

## 📊 Database Tables

### `admin_settings` Table
Stores admin preferences and security settings.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Unique ID |
| admin_id | UUID | References auth.users |
| two_factor_auth | BOOLEAN | 2FA enabled |
| login_notifications | BOOLEAN | Login alerts |
| auto_logout | BOOLEAN | Auto logout inactive sessions |
| ip_restriction | BOOLEAN | IP-based access control |
| order_notifications | BOOLEAN | Order alerts |
| contact_notifications | BOOLEAN | Contact form alerts |
| newsletter_notifications | BOOLEAN | Newsletter alerts |
| system_alerts | BOOLEAN | System notifications |
| allowed_ips | TEXT[] | Whitelisted IPs |
| session_timeout | INTEGER | Timeout in seconds |

### `api_keys` Table
Manages API keys for integrations.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Unique ID |
| admin_id | UUID | References auth.users |
| key_name | TEXT | Descriptive name |
| api_key | TEXT | The actual key |
| is_active | BOOLEAN | Active status |
| last_used_at | TIMESTAMPTZ | Last usage time |
| usage_count | INTEGER | Total uses |
| expires_at | TIMESTAMPTZ | Expiration date |

### `admin_activity_log` Table
Complete audit trail of admin actions.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Unique ID |
| admin_id | UUID | References auth.users |
| action_type | TEXT | Type of action |
| action_description | TEXT | What happened |
| target_table | TEXT | Table affected |
| target_id | UUID | Record affected |
| ip_address | TEXT | Admin's IP |
| user_agent | TEXT | Browser info |
| metadata | JSONB | Additional data |
| created_at | TIMESTAMPTZ | When it happened |

### `admin_sessions` Table
Active session tracking and management.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Unique ID |
| admin_id | UUID | References auth.users |
| session_token | TEXT | Session identifier |
| ip_address | TEXT | Login IP |
| user_agent | TEXT | Browser info |
| is_active | BOOLEAN | Active status |
| last_activity_at | TIMESTAMPTZ | Last activity |
| expires_at | TIMESTAMPTZ | Expiration time |

---

## 🎨 UI Components

### Profile Header
- **Circular avatar** with status badge
- **Name and role** badge (Super Admin, Admin, Viewer)
- **Email address** display
- **Activity stats**: Days active, total actions, messages handled
- **Gradient background** with brand colors

### Sidebar Menu
- **Personal Info** - Edit profile details
- **Account Settings** - Password management
- **Security** - Security preferences
- **Activity Log** - Recent actions
- **API Keys** - Manage integrations
- **Notifications** - Alert preferences

### Content Sections

#### Personal Information
- Full name, email, phone
- Address, city, country, ZIP
- Real-time statistics cards
- Save/Cancel buttons

#### Account Settings
- Current password verification
- New password with confirmation
- Password strength validation
- Secure update process

#### Security
- Toggle switches for all settings
- Visual feedback (green = active)
- Real-time Supabase updates
- Security recommendations

#### Activity Log
- Chronological list of actions
- Icon-based action types
- Time ago formatting
- Detailed descriptions

#### API Keys
- List of active keys
- Masked key display
- Copy to clipboard
- Revoke functionality
- Generation date

#### Notifications
- Granular control per notification type
- Toggle switches
- Instant updates
- Clear descriptions

---

## 🔧 JavaScript Functions

### Core Functions

```javascript
// Initialize admin profile
AdminProfile.init()

// Load admin data from Supabase
AdminProfile.loadAdminData()

// Load activity log
AdminProfile.loadActivityLog()

// Load statistics
AdminProfile.loadStatistics()

// Save profile changes
AdminProfile.saveProfile()

// Change password
AdminProfile.changePassword()

// Update security setting
AdminProfile.updateSecuritySetting(setting, enabled)

// Generate API key
AdminProfile.generateApiKey()

// Load API keys
AdminProfile.loadApiKeys()

// Copy API key to clipboard
AdminProfile.copyApiKey(key)

// Revoke API key
AdminProfile.revokeApiKey(keyId)
```

### Supabase Integration Examples

**Load Admin Profile:**
```javascript
const { data: profile } = await supabaseClient
    .from('profiles')
    .select('*')
    .eq('id', this.currentUser.id)
    .single();
```

**Update Profile:**
```javascript
const { error } = await supabaseClient
    .from('profiles')
    .update({
        full_name: fullName,
        phone: phone,
        address: address
    })
    .eq('id', this.currentUser.id);
```

**Load Activity Log:**
```javascript
const { data: orders } = await supabaseClient
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);
```

**Generate API Key:**
```javascript
const { error } = await supabaseClient
    .from('api_keys')
    .insert({
        admin_id: this.currentUser.id,
        key_name: keyName,
        api_key: apiKey
    });
```

---

## 🎨 Styling

### Color Scheme
- **Primary**: #2ca9a1 (Teal)
- **Secondary**: #239890 (Dark Teal)
- **Success**: #10b981 (Green)
- **Error**: #ef4444 (Red)
- **Dark**: #0A1A2F
- **Gray**: #64748b

### Typography
- **Font Family**: Inter
- **Weights**: 300, 400, 500, 600, 700, 800
- **Headings**: Bold, clear hierarchy
- **Body**: Readable, proper line height

### Components
- **Cards**: Rounded (12px), shadowed
- **Buttons**: Gradient backgrounds, hover effects
- **Forms**: Clean inputs, focus states
- **Toggle Switches**: Custom animated
- **Stats Cards**: Hover lift effect

---

## 📱 Responsive Design

### Desktop (> 1024px)
- Two-column layout (sidebar + content)
- Full statistics cards
- Expanded activity log
- Large avatar (120px)

### Tablet (768px - 1024px)
- Single column layout
- Sidebar becomes horizontal menu
- Stacked statistics
- Medium avatar (100px)

### Mobile (< 768px)
- Vertical layout
- Collapsible sections
- Simplified stats
- Small avatar (80px)
- Touch-friendly buttons

---

## 🔒 Security Features

### Row Level Security (RLS)
- ✅ Admins can only view their own data
- ✅ Profile updates require authentication
- ✅ API keys are user-scoped
- ✅ Activity log is protected

### Password Security
- ✅ Current password verification
- ✅ Minimum 6 characters
- ✅ Password confirmation matching
- ✅ Supabase auth integration

### Session Management
- ✅ Automatic timeout
- ✅ IP address tracking
- ✅ User agent logging
- ✅ Multi-session support

### API Key Security
- ✅ Unique key generation
- ✅ Masked display
- ✅ Secure revocation
- ✅ Usage tracking
- ✅ Expiration support

---

## 📊 Admin Statistics

The profile displays real-time statistics:

- **Days Active**: Since account creation
- **Total Actions**: Admin operations performed
- **Total Messages**: Contact messages handled
- **Total Revenue**: Sum of all orders
- **Active Users**: Orders in last 30 days

---

## 🚀 Usage Examples

### Viewing Profile
1. Log in as admin (brineketum@gmail.com)
2. Navigate to admin panel
3. Click "Profile & Settings" tab
4. View all profile information

### Updating Profile
1. Go to "Personal Info" section
2. Edit desired fields
3. Click "Save Changes"
4. Success notification appears

### Changing Password
1. Go to "Account Settings"
2. Enter current password
3. Enter new password twice
4. Click "Update Password"

### Enabling 2FA
1. Go to "Security" section
2. Toggle "Two-Factor Authentication"
3. Follow setup instructions
4. Verify with code

### Generating API Key
1. Go to "API Keys" section
2. Click "Generate New Key"
3. Enter key name
4. Copy and save securely

### Viewing Activity
1. Go to "Activity Log"
2. See chronological list
3. Filter by type (optional)
4. Click for details

---

## 🧪 Testing

### Test Profile Update
```javascript
// Update profile
await AdminProfile.saveProfile();
// Verify in Supabase
```

### Test Password Change
```javascript
// Change password
await AdminProfile.changePassword();
// Verify with login
```

### Test API Key Generation
```javascript
// Generate key
await AdminProfile.generateApiKey();
// Verify in api_keys table
```

### SQL Verification Queries
```sql
-- View admin profile
SELECT * FROM profiles WHERE is_admin = true;

-- View admin settings
SELECT * FROM admin_settings WHERE admin_id = (
    SELECT id FROM auth.users WHERE email = 'brineketum@gmail.com'
);

-- View API keys
SELECT * FROM api_keys WHERE admin_id = (
    SELECT id FROM auth.users WHERE email = 'brineketum@gmail.com'
);

-- View recent activity
SELECT * FROM admin_activity_log
WHERE admin_id = (SELECT id FROM auth.users WHERE email = 'brineketum@gmail.com')
ORDER BY created_at DESC
LIMIT 10;
```

---

## 📦 Files Included

### Styles
- `admin-profile.css` - Complete styling (800+ lines)

### JavaScript
- `admin-profile.js` - Full functionality (700+ lines)

### HTML
- `admin-profile-section.html` - Complete UI markup

### Database
- `admin-profile-setup.sql` - Database setup (400+ lines)

### Documentation
- `ADMIN-PROFILE-GUIDE.md` - This guide

---

## ✅ Setup Checklist

- [ ] Run `admin-profile-setup.sql` in Supabase
- [ ] Verify tables created
- [ ] Add CSS link to admin.html
- [ ] Add JavaScript link to admin.html
- [ ] Add profile tab to navigation
- [ ] Add profile section HTML
- [ ] Test admin login
- [ ] Verify profile loads
- [ ] Test profile update
- [ ] Test password change
- [ ] Test API key generation
- [ ] Verify activity log
- [ ] Test all toggle switches
- [ ] Check responsive design
- [ ] Verify Supabase integration

---

## 🎯 Admin Access

**Primary Admin:**
- **Name**: Brine Ketum
- **Email**: brineketum@gmail.com
- **Role**: Super Admin
- **Permissions**: Full access

**Access URL:**
- https://keysight-tech.github.io/fordips-tech/admin.html

---

## 🔥 Features Summary

✅ **Personal Information Management** - Complete profile editing
✅ **Security Settings** - 2FA, login alerts, session management
✅ **Activity Logging** - Complete audit trail
✅ **API Key Management** - Generate, revoke, track usage
✅ **Notification Preferences** - Granular control
✅ **Real-time Statistics** - Live data from Supabase
✅ **Password Management** - Secure password changes
✅ **Session Tracking** - IP address and browser logging
✅ **Responsive Design** - Works on all devices
✅ **Deep Supabase Integration** - Real-time data sync

---

## 📞 Support

If you encounter any issues:
1. Check Supabase connection
2. Verify admin permissions in profiles table
3. Check browser console for errors
4. Ensure all SQL tables are created
5. Verify RLS policies are active

---

**Your world-class admin profile system is ready! 🚀**

Last Updated: 2025-10-24
Version: 1.0.0
Status: ✅ Production Ready
