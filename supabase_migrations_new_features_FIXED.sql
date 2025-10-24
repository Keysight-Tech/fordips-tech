/**
 * FORDIPS TECH - SUPABASE MIGRATIONS (FIXED)
 * Database tables and functions for new features
 * Run this in Supabase SQL Editor
 *
 * FIXED: Removed direct references to auth.users table
 */

-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,  -- Removed REFERENCES auth.users(id) - will validate in app
    type VARCHAR(50) NOT NULL, -- 'order', 'payment', 'help_me_pay', 'shipping', 'account', 'promo'
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- Enable Row Level Security
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policies for notifications
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
CREATE POLICY "Users can view their own notifications"
    ON notifications FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
CREATE POLICY "Users can update their own notifications"
    ON notifications FOR UPDATE
    USING (auth.uid() = user_id);

-- ============================================
-- HELP ME PAY REQUESTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS help_me_pay_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    requester_user_id UUID,  -- Removed REFERENCES auth.users(id) - will validate in app
    requester_name VARCHAR(255) NOT NULL,
    requester_email VARCHAR(255) NOT NULL,
    requester_phone VARCHAR(50),

    helper_name VARCHAR(255) NOT NULL,
    helper_email VARCHAR(255),
    helper_phone VARCHAR(50),
    helper_message TEXT,

    order_data JSONB NOT NULL, -- Contains cart items, totals, etc.
    currency VARCHAR(10) NOT NULL DEFAULT 'USD',
    total_amount DECIMAL(10, 2) NOT NULL,

    payment_link VARCHAR(500),
    payment_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'paid', 'expired', 'cancelled'

    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '48 hours'),
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT helper_contact_check CHECK (
        helper_email IS NOT NULL OR helper_phone IS NOT NULL
    )
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_help_me_pay_requester ON help_me_pay_requests(requester_user_id);
CREATE INDEX IF NOT EXISTS idx_help_me_pay_status ON help_me_pay_requests(payment_status);
CREATE INDEX IF NOT EXISTS idx_help_me_pay_created ON help_me_pay_requests(created_at DESC);

-- Enable Row Level Security
ALTER TABLE help_me_pay_requests ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Requesters can view their own requests" ON help_me_pay_requests;
CREATE POLICY "Requesters can view their own requests"
    ON help_me_pay_requests FOR SELECT
    USING (auth.uid() = requester_user_id);

DROP POLICY IF EXISTS "Anyone can view requests they received (by link)" ON help_me_pay_requests;
CREATE POLICY "Anyone can view requests they received (by link)"
    ON help_me_pay_requests FOR SELECT
    USING (true); -- We'll validate via the unique ID in the link

DROP POLICY IF EXISTS "System can create help me pay requests" ON help_me_pay_requests;
CREATE POLICY "System can create help me pay requests"
    ON help_me_pay_requests FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS "System can update help me pay requests" ON help_me_pay_requests;
CREATE POLICY "System can update help me pay requests"
    ON help_me_pay_requests FOR UPDATE
    USING (true);

-- ============================================
-- UPDATE EXISTING ORDERS TABLE
-- Add currency support
-- ============================================
DO $$
BEGIN
    -- Only add columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='orders' AND column_name='currency') THEN
        ALTER TABLE orders ADD COLUMN currency VARCHAR(10) DEFAULT 'USD';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='orders' AND column_name='exchange_rate') THEN
        ALTER TABLE orders ADD COLUMN exchange_rate DECIMAL(10, 4) DEFAULT 1.0000;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='orders' AND column_name='payment_type') THEN
        ALTER TABLE orders ADD COLUMN payment_type VARCHAR(50) DEFAULT 'direct';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='orders' AND column_name='help_me_pay_request_id') THEN
        ALTER TABLE orders ADD COLUMN help_me_pay_request_id UUID;
    END IF;
END $$;

-- ============================================
-- FUNCTION: Search Products
-- ============================================
CREATE OR REPLACE FUNCTION search_products(search_query TEXT)
RETURNS SETOF products AS $$
BEGIN
    RETURN QUERY
    SELECT *
    FROM products
    WHERE
        is_active = TRUE
        AND (
            name ILIKE '%' || search_query || '%'
            OR description ILIKE '%' || search_query || '%'
            OR category_slug ILIKE '%' || search_query || '%'
            OR badge ILIKE '%' || search_query || '%'
        )
    ORDER BY
        CASE
            WHEN name ILIKE search_query || '%' THEN 1
            WHEN name ILIKE '%' || search_query || '%' THEN 2
            ELSE 3
        END,
        name ASC
    LIMIT 20;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FUNCTION: Create Notification
-- ============================================
CREATE OR REPLACE FUNCTION create_notification(
    p_user_id UUID,
    p_type VARCHAR(50),
    p_title VARCHAR(255),
    p_message TEXT,
    p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
    notification_id UUID;
BEGIN
    INSERT INTO notifications (user_id, type, title, message, metadata)
    VALUES (p_user_id, p_type, p_title, p_message, p_metadata)
    RETURNING id INTO notification_id;

    RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FUNCTION: Mark Notification as Read
-- ============================================
CREATE OR REPLACE FUNCTION mark_notification_read(notification_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE notifications
    SET is_read = TRUE, updated_at = NOW()
    WHERE id = notification_id AND user_id = auth.uid();

    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FUNCTION: Mark All Notifications as Read
-- ============================================
CREATE OR REPLACE FUNCTION mark_all_notifications_read(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    updated_count INTEGER;
BEGIN
    UPDATE notifications
    SET is_read = TRUE, updated_at = NOW()
    WHERE user_id = p_user_id AND user_id = auth.uid() AND is_read = FALSE;

    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FUNCTION: Get User Notifications
-- ============================================
CREATE OR REPLACE FUNCTION get_user_notifications(p_user_id UUID, p_limit INTEGER DEFAULT 50)
RETURNS SETOF notifications AS $$
BEGIN
    RETURN QUERY
    SELECT *
    FROM notifications
    WHERE user_id = p_user_id
    ORDER BY created_at DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FUNCTION: Create Help Me Pay Request
-- ============================================
CREATE OR REPLACE FUNCTION create_help_me_pay_request(
    p_requester_user_id UUID,
    p_requester_name VARCHAR(255),
    p_requester_email VARCHAR(255),
    p_requester_phone VARCHAR(50),
    p_helper_name VARCHAR(255),
    p_helper_email VARCHAR(255),
    p_helper_phone VARCHAR(50),
    p_helper_message TEXT,
    p_order_data JSONB,
    p_currency VARCHAR(10),
    p_total_amount DECIMAL(10, 2)
)
RETURNS UUID AS $$
DECLARE
    request_id UUID;
    payment_link TEXT;
BEGIN
    -- Generate unique request ID
    request_id := gen_random_uuid();

    -- Create payment link (update domain to your actual domain)
    payment_link := 'https://keysight-tech.github.io/fordips-tech/help-me-pay.html?request=' || request_id::TEXT;

    -- Insert request
    INSERT INTO help_me_pay_requests (
        id,
        requester_user_id,
        requester_name,
        requester_email,
        requester_phone,
        helper_name,
        helper_email,
        helper_phone,
        helper_message,
        order_data,
        currency,
        total_amount,
        payment_link
    ) VALUES (
        request_id,
        p_requester_user_id,
        p_requester_name,
        p_requester_email,
        p_requester_phone,
        p_helper_name,
        p_helper_email,
        p_helper_phone,
        p_helper_message,
        p_order_data,
        p_currency,
        p_total_amount,
        payment_link
    );

    -- Create notification for requester (if they have an account)
    IF p_requester_user_id IS NOT NULL THEN
        PERFORM create_notification(
            p_requester_user_id,
            'help_me_pay',
            'Payment Request Sent',
            'Your payment request to ' || p_helper_name || ' has been sent successfully.',
            jsonb_build_object('request_id', request_id, 'helper_name', p_helper_name)
        );
    END IF;

    RETURN request_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FUNCTION: Get Help Me Pay Request
-- ============================================
CREATE OR REPLACE FUNCTION get_help_me_pay_request(request_id UUID)
RETURNS SETOF help_me_pay_requests AS $$
BEGIN
    RETURN QUERY
    SELECT *
    FROM help_me_pay_requests
    WHERE id = request_id AND (expires_at > NOW() OR payment_status = 'paid');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FUNCTION: Update Help Me Pay Status
-- ============================================
CREATE OR REPLACE FUNCTION update_help_me_pay_status(
    request_id UUID,
    new_status VARCHAR(50),
    order_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    request_record help_me_pay_requests;
BEGIN
    -- Get the request
    SELECT * INTO request_record
    FROM help_me_pay_requests
    WHERE id = request_id;

    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;

    -- Update status
    UPDATE help_me_pay_requests
    SET
        payment_status = new_status,
        paid_at = CASE WHEN new_status = 'paid' THEN NOW() ELSE paid_at END,
        updated_at = NOW()
    WHERE id = request_id;

    -- If paid, create notification for requester
    IF new_status = 'paid' AND request_record.requester_user_id IS NOT NULL THEN
        PERFORM create_notification(
            request_record.requester_user_id,
            'payment',
            'Payment Received!',
            request_record.helper_name || ' has completed the payment for your order.',
            jsonb_build_object('request_id', request_id, 'order_id', order_id)
        );
    END IF;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TRIGGER: Update timestamps
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to notifications
DROP TRIGGER IF EXISTS update_notifications_updated_at ON notifications;
CREATE TRIGGER update_notifications_updated_at
    BEFORE UPDATE ON notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Apply to help_me_pay_requests
DROP TRIGGER IF EXISTS update_help_me_pay_updated_at ON help_me_pay_requests;
CREATE TRIGGER update_help_me_pay_updated_at
    BEFORE UPDATE ON help_me_pay_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- CLEANUP: Expire old help me pay requests
-- ============================================
CREATE OR REPLACE FUNCTION cleanup_expired_help_me_pay_requests()
RETURNS void AS $$
BEGIN
    UPDATE help_me_pay_requests
    SET payment_status = 'expired'
    WHERE expires_at < NOW() AND payment_status = 'pending';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- GRANT PERMISSIONS
-- ============================================
-- Grant access to authenticated users
GRANT SELECT, INSERT, UPDATE ON notifications TO authenticated;
GRANT SELECT, INSERT, UPDATE ON help_me_pay_requests TO authenticated;
GRANT SELECT ON help_me_pay_requests TO anon; -- For payment links

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION search_products(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION create_notification(UUID, VARCHAR, VARCHAR, TEXT, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION mark_notification_read(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION mark_all_notifications_read(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_notifications(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION create_help_me_pay_request(UUID, VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR, TEXT, JSONB, VARCHAR, DECIMAL) TO authenticated;
GRANT EXECUTE ON FUNCTION get_help_me_pay_request(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION update_help_me_pay_status(UUID, VARCHAR, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_expired_help_me_pay_requests() TO authenticated;

-- ============================================
-- VERIFICATION QUERIES
-- Run these to verify everything is set up
-- ============================================

-- Check if tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('notifications', 'help_me_pay_requests');

-- Check if functions exist
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_type = 'FUNCTION'
AND (routine_name LIKE '%notification%' OR routine_name LIKE '%help_me_pay%' OR routine_name LIKE '%search_products%');

-- Check row counts
SELECT
    'notifications' as table_name, COUNT(*) as row_count FROM notifications
UNION ALL
SELECT
    'help_me_pay_requests' as table_name, COUNT(*) as row_count FROM help_me_pay_requests;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ MIGRATION COMPLETED SUCCESSFULLY!';
    RAISE NOTICE '📊 Tables created: notifications, help_me_pay_requests';
    RAISE NOTICE '⚙️  Functions created: 8 database functions';
    RAISE NOTICE '🔒 Row Level Security enabled on all tables';
    RAISE NOTICE '🚀 Your Fordips Tech platform is ready!';
END $$;
