-- =====================================================
-- FORDIPS TECH - Admin Profile System Database Setup
-- Run this script in your Supabase SQL Editor
-- =====================================================

-- 1. ADD ADMIN FIELDS TO PROFILES TABLE (if not exists)
-- This extends the profiles table with admin-specific fields
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS admin_role TEXT DEFAULT 'viewer',
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS zip_code TEXT,
ADD COLUMN IF NOT EXISTS country TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS login_count INTEGER DEFAULT 0;

-- 2. CREATE ADMIN SETTINGS TABLE
CREATE TABLE IF NOT EXISTS admin_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    two_factor_auth BOOLEAN DEFAULT false,
    login_notifications BOOLEAN DEFAULT true,
    auto_logout BOOLEAN DEFAULT true,
    ip_restriction BOOLEAN DEFAULT false,
    order_notifications BOOLEAN DEFAULT true,
    contact_notifications BOOLEAN DEFAULT true,
    newsletter_notifications BOOLEAN DEFAULT true,
    system_alerts BOOLEAN DEFAULT true,
    allowed_ips TEXT[],
    session_timeout INTEGER DEFAULT 3600,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CREATE API KEYS TABLE
CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    key_name TEXT NOT NULL,
    api_key TEXT NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT true,
    last_used_at TIMESTAMPTZ,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ
);

-- 4. CREATE ADMIN ACTIVITY LOG TABLE
CREATE TABLE IF NOT EXISTS admin_activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL,
    action_description TEXT,
    target_table TEXT,
    target_id UUID,
    ip_address TEXT,
    user_agent TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. CREATE ADMIN SESSIONS TABLE
CREATE TABLE IF NOT EXISTS admin_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_token TEXT NOT NULL UNIQUE,
    ip_address TEXT,
    user_agent TEXT,
    is_active BOOLEAN DEFAULT true,
    last_activity_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ
);

-- 6. CREATE INDEXES FOR BETTER PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON profiles(is_admin);
CREATE INDEX IF NOT EXISTS idx_profiles_admin_role ON profiles(admin_role);
CREATE INDEX IF NOT EXISTS idx_admin_settings_admin_id ON admin_settings(admin_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_admin_id ON api_keys(admin_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_api_key ON api_keys(api_key);
CREATE INDEX IF NOT EXISTS idx_api_keys_is_active ON api_keys(is_active);
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_admin_id ON admin_activity_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_created_at ON admin_activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_admin_id ON admin_sessions(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_is_active ON admin_sessions(is_active);

-- 7. ENABLE ROW LEVEL SECURITY
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;

-- 8. CREATE RLS POLICIES FOR ADMIN SETTINGS
DROP POLICY IF EXISTS "Admins can view their own settings" ON admin_settings;
CREATE POLICY "Admins can view their own settings" ON admin_settings
    FOR SELECT USING (admin_id = auth.uid());

DROP POLICY IF EXISTS "Admins can update their own settings" ON admin_settings;
CREATE POLICY "Admins can update their own settings" ON admin_settings
    FOR UPDATE USING (admin_id = auth.uid());

DROP POLICY IF EXISTS "Admins can insert their own settings" ON admin_settings;
CREATE POLICY "Admins can insert their own settings" ON admin_settings
    FOR INSERT WITH CHECK (admin_id = auth.uid());

-- 9. CREATE RLS POLICIES FOR API KEYS
DROP POLICY IF EXISTS "Admins can view their own API keys" ON api_keys;
CREATE POLICY "Admins can view their own API keys" ON api_keys
    FOR SELECT USING (admin_id = auth.uid());

DROP POLICY IF EXISTS "Admins can create their own API keys" ON api_keys;
CREATE POLICY "Admins can create their own API keys" ON api_keys
    FOR INSERT WITH CHECK (admin_id = auth.uid());

DROP POLICY IF EXISTS "Admins can delete their own API keys" ON api_keys;
CREATE POLICY "Admins can delete their own API keys" ON api_keys
    FOR DELETE USING (admin_id = auth.uid());

-- 10. CREATE RLS POLICIES FOR ACTIVITY LOG
DROP POLICY IF EXISTS "Admins can view their own activity" ON admin_activity_log;
CREATE POLICY "Admins can view their own activity" ON admin_activity_log
    FOR SELECT USING (admin_id = auth.uid());

DROP POLICY IF EXISTS "System can log admin activity" ON admin_activity_log;
CREATE POLICY "System can log admin activity" ON admin_activity_log
    FOR INSERT WITH CHECK (true);

-- 11. CREATE RLS POLICIES FOR SESSIONS
DROP POLICY IF EXISTS "Admins can view their own sessions" ON admin_sessions;
CREATE POLICY "Admins can view their own sessions" ON admin_sessions
    FOR SELECT USING (admin_id = auth.uid());

DROP POLICY IF EXISTS "Admins can manage their own sessions" ON admin_sessions;
CREATE POLICY "Admins can manage their own sessions" ON admin_sessions
    FOR ALL USING (admin_id = auth.uid());

-- 12. CREATE FUNCTION TO LOG ADMIN ACTIVITY
CREATE OR REPLACE FUNCTION log_admin_activity(
    p_admin_id UUID,
    p_action_type TEXT,
    p_action_description TEXT,
    p_target_table TEXT DEFAULT NULL,
    p_target_id UUID DEFAULT NULL,
    p_metadata JSONB DEFAULT NULL
)
RETURNS void AS $$
BEGIN
    INSERT INTO admin_activity_log (
        admin_id,
        action_type,
        action_description,
        target_table,
        target_id,
        metadata
    ) VALUES (
        p_admin_id,
        p_action_type,
        p_action_description,
        p_target_table,
        p_target_id,
        p_metadata
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 13. CREATE FUNCTION TO UPDATE LAST LOGIN
CREATE OR REPLACE FUNCTION update_last_login()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE profiles
    SET last_login_at = NOW(),
        login_count = login_count + 1
    WHERE id = NEW.user_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 14. CREATE FUNCTION TO CLEAN EXPIRED SESSIONS
CREATE OR REPLACE FUNCTION clean_expired_sessions()
RETURNS void AS $$
BEGIN
    UPDATE admin_sessions
    SET is_active = false
    WHERE expires_at < NOW()
    AND is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 15. CREATE FUNCTION TO REVOKE API KEY
CREATE OR REPLACE FUNCTION revoke_api_key(p_key_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE api_keys
    SET is_active = false
    WHERE id = p_key_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 16. CREATE FUNCTION TO GET ADMIN STATISTICS
CREATE OR REPLACE FUNCTION get_admin_statistics(p_admin_id UUID)
RETURNS TABLE (
    total_actions INTEGER,
    total_revenue DECIMAL(10,2),
    total_orders INTEGER,
    total_messages INTEGER,
    active_users INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        (SELECT COUNT(*)::INTEGER FROM admin_activity_log WHERE admin_id = p_admin_id),
        (SELECT COALESCE(SUM(total_amount), 0)::DECIMAL(10,2) FROM orders),
        (SELECT COUNT(*)::INTEGER FROM orders),
        (SELECT COUNT(*)::INTEGER FROM contact_messages),
        (SELECT COUNT(DISTINCT customer_email)::INTEGER FROM orders
         WHERE created_at > NOW() - INTERVAL '30 days');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 17. CREATE TRIGGER FOR UPDATED_AT
CREATE OR REPLACE FUNCTION update_admin_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_admin_settings_updated_at ON admin_settings;
CREATE TRIGGER update_admin_settings_updated_at
    BEFORE UPDATE ON admin_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_admin_settings_updated_at();

-- 18. SET ADMIN STATUS FOR MAIN ADMIN
-- IMPORTANT: Replace 'brineketum@gmail.com' with your actual admin email
UPDATE profiles
SET is_admin = true,
    admin_role = 'super_admin'
WHERE email = 'brineketum@gmail.com';

-- If the profile doesn't exist, create it
INSERT INTO profiles (id, email, full_name, is_admin, admin_role)
SELECT
    id,
    email,
    COALESCE(raw_user_meta_data->>'full_name', email),
    true,
    'super_admin'
FROM auth.users
WHERE email = 'brineketum@gmail.com'
ON CONFLICT (id) DO UPDATE
SET is_admin = true,
    admin_role = 'super_admin';

-- 19. CREATE DEFAULT ADMIN SETTINGS
INSERT INTO admin_settings (admin_id, two_factor_auth, login_notifications, auto_logout, order_notifications, contact_notifications)
SELECT id, false, true, true, true, true
FROM auth.users
WHERE email = 'brineketum@gmail.com'
ON CONFLICT DO NOTHING;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check if tables were created successfully
SELECT EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'admin_settings'
) as admin_settings_exists,
EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'api_keys'
) as api_keys_exists,
EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'admin_activity_log'
) as activity_log_exists,
EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'admin_sessions'
) as sessions_exists;

-- View admin profile
SELECT * FROM profiles WHERE is_admin = true;

-- View admin settings
SELECT * FROM admin_settings;

-- =====================================================
-- ADMIN OPERATIONS (Optional)
-- =====================================================

-- Grant admin access to a user
-- UPDATE profiles
-- SET is_admin = true, admin_role = 'admin'
-- WHERE email = 'user@example.com';

-- Revoke admin access
-- UPDATE profiles
-- SET is_admin = false, admin_role = 'viewer'
-- WHERE email = 'user@example.com';

-- View all API keys
-- SELECT * FROM api_keys WHERE admin_id = (SELECT id FROM auth.users WHERE email = 'brineketum@gmail.com');

-- View recent admin activity
-- SELECT * FROM admin_activity_log
-- WHERE admin_id = (SELECT id FROM auth.users WHERE email = 'brineketum@gmail.com')
-- ORDER BY created_at DESC
-- LIMIT 20;

-- Clean expired sessions
-- SELECT clean_expired_sessions();

-- Get admin statistics
-- SELECT * FROM get_admin_statistics((SELECT id FROM auth.users WHERE email = 'brineketum@gmail.com'));

-- =====================================================
-- DONE! Your admin profile system is ready
-- =====================================================

COMMENT ON TABLE admin_settings IS 'Admin user settings and preferences';
COMMENT ON TABLE api_keys IS 'API keys for external integrations and automation';
COMMENT ON TABLE admin_activity_log IS 'Complete audit log of all admin actions';
COMMENT ON TABLE admin_sessions IS 'Active admin login sessions with security tracking';
