-- =====================================================
-- FORDIPS TECH - Contact Messages System
-- Run this script in your Supabase SQL Editor
-- =====================================================

-- 1. CREATE CONTACT MESSAGES TABLE
CREATE TABLE IF NOT EXISTS contact_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'archived')),
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    read_at TIMESTAMPTZ,
    replied_at TIMESTAMPTZ,
    admin_notes TEXT
);

-- 2. CREATE INDEXES FOR BETTER PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_contact_messages_email ON contact_messages(email);
CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages(created_at DESC);

-- 3. ENABLE ROW LEVEL SECURITY
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- 4. CREATE RLS POLICIES
-- Allow anyone to insert contact messages
DROP POLICY IF EXISTS "Enable insert access for contact messages" ON contact_messages;
CREATE POLICY "Enable insert access for contact messages" ON contact_messages
    FOR INSERT WITH CHECK (true);

-- Allow users to read their own messages
DROP POLICY IF EXISTS "Enable read access for own messages" ON contact_messages;
CREATE POLICY "Enable read access for own messages" ON contact_messages
    FOR SELECT USING (email = auth.jwt()->>'email' OR auth.jwt()->>'role' = 'admin');

-- Allow admin to update messages
DROP POLICY IF EXISTS "Enable update access for admins" ON contact_messages;
CREATE POLICY "Enable update access for admins" ON contact_messages
    FOR UPDATE USING (auth.jwt()->>'role' = 'admin');

-- 5. CREATE TRIGGER FOR UPDATED_AT
CREATE OR REPLACE FUNCTION update_contact_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_contact_messages_updated_at ON contact_messages;
CREATE TRIGGER update_contact_messages_updated_at
    BEFORE UPDATE ON contact_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_contact_messages_updated_at();

-- 6. CREATE CONTACT NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS contact_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contact_message_id UUID REFERENCES contact_messages(id) ON DELETE CASCADE,
    recipient_email TEXT NOT NULL,
    notification_type TEXT NOT NULL CHECK (notification_type IN ('admin_notification', 'customer_confirmation')),
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
    error_message TEXT
);

-- 7. CREATE INDEX FOR NOTIFICATIONS
CREATE INDEX IF NOT EXISTS idx_contact_notifications_message_id ON contact_notifications(contact_message_id);
CREATE INDEX IF NOT EXISTS idx_contact_notifications_status ON contact_notifications(status);
CREATE INDEX IF NOT EXISTS idx_contact_notifications_sent_at ON contact_notifications(sent_at DESC);

-- 8. ENABLE RLS FOR NOTIFICATIONS
ALTER TABLE contact_notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable insert access for notifications" ON contact_notifications;
CREATE POLICY "Enable insert access for notifications" ON contact_notifications
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Enable read access for admins" ON contact_notifications;
CREATE POLICY "Enable read access for admins" ON contact_notifications
    FOR SELECT USING (auth.jwt()->>'role' = 'admin');

-- 9. CREATE FUNCTION TO GET UNREAD MESSAGE COUNT
CREATE OR REPLACE FUNCTION get_unread_contact_count()
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)
        FROM contact_messages
        WHERE status = 'new'
    );
END;
$$ LANGUAGE plpgsql;

-- 10. CREATE FUNCTION TO MARK MESSAGE AS READ
CREATE OR REPLACE FUNCTION mark_contact_as_read(message_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE contact_messages
    SET status = 'read',
        read_at = NOW()
    WHERE id = message_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- INSTRUCTIONS:
-- 1. Go to your Supabase Dashboard (https://app.supabase.com)
-- 2. Select your project
-- 3. Go to SQL Editor
-- 4. Create a new query
-- 5. Copy and paste this entire script
-- 6. Click "Run" to execute
-- =====================================================

-- =====================================================
-- ADMIN OPERATIONS (Optional)
-- =====================================================

-- View all contact messages
-- SELECT * FROM contact_messages ORDER BY created_at DESC;

-- View new/unread messages
-- SELECT * FROM contact_messages WHERE status = 'new' ORDER BY created_at DESC;

-- Mark message as read
-- UPDATE contact_messages SET status = 'read', read_at = NOW() WHERE id = 'message-uuid-here';

-- Reply to message and mark as replied
-- UPDATE contact_messages SET status = 'replied', replied_at = NOW(), admin_notes = 'Response sent via email' WHERE id = 'message-uuid-here';

-- Get contact message statistics
-- SELECT
--     COUNT(*) as total_messages,
--     COUNT(CASE WHEN status = 'new' THEN 1 END) as new_messages,
--     COUNT(CASE WHEN status = 'read' THEN 1 END) as read_messages,
--     COUNT(CASE WHEN status = 'replied' THEN 1 END) as replied_messages
-- FROM contact_messages;

-- View messages with notifications
-- SELECT cm.*,
--        COUNT(cn.id) as notification_count,
--        COUNT(CASE WHEN cn.status = 'sent' THEN 1 END) as sent_notifications
-- FROM contact_messages cm
-- LEFT JOIN contact_notifications cn ON cm.id = cn.contact_message_id
-- GROUP BY cm.id
-- ORDER BY cm.created_at DESC;

-- =====================================================
-- VERIFICATION QUERIES (Run these after setup)
-- =====================================================

-- Check if tables were created successfully
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

-- View table structures
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'contact_messages'
ORDER BY ordinal_position;

-- Check indexes
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename IN ('contact_messages', 'contact_notifications');

-- =====================================================
-- DONE! Your contact system is ready
-- =====================================================

COMMENT ON TABLE contact_messages IS 'Customer contact form submissions with tracking and admin management';
COMMENT ON COLUMN contact_messages.status IS 'Message status: new, read, replied, or archived';
COMMENT ON TABLE contact_notifications IS 'Email notifications for contact form submissions (admin alerts and customer confirmations)';
