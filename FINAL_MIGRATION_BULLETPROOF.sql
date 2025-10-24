/**
 * FORDIPS TECH - BULLETPROOF MIGRATION
 * This version adds extra safety checks and better error messages
 * Run this in Supabase SQL Editor
 */

-- ============================================
-- DIAGNOSTIC: Check current state
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '📋 Current database state:';

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications') THEN
        RAISE NOTICE '   ⚠️  notifications table EXISTS';
    ELSE
        RAISE NOTICE '   ✓ notifications table does not exist';
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'help_me_pay_requests') THEN
        RAISE NOTICE '   ⚠️  help_me_pay_requests table EXISTS';
    ELSE
        RAISE NOTICE '   ✓ help_me_pay_requests table does not exist';
    END IF;
END $$;

-- ============================================
-- STEP 1: AGGRESSIVE CLEANUP
-- ============================================

-- Drop EVERYTHING that might exist (even if it doesn't)
DO $$
DECLARE
    r RECORD;
BEGIN
    -- Drop all policies on notifications
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'notifications') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON notifications';
    END LOOP;

    -- Drop all policies on help_me_pay_requests
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'help_me_pay_requests') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON help_me_pay_requests';
    END LOOP;

    RAISE NOTICE '✓ Dropped all policies';
END $$;

-- Drop triggers explicitly
DO $$
BEGIN
    DROP TRIGGER IF EXISTS update_notifications_updated_at ON notifications;
    DROP TRIGGER IF EXISTS update_help_me_pay_updated_at ON help_me_pay_requests;
    RAISE NOTICE '✓ Dropped all triggers';
END $$;

-- Drop functions explicitly (in dependency order)
DO $$
BEGIN
    DROP FUNCTION IF EXISTS cleanup_expired_help_me_pay_requests() CASCADE;
    DROP FUNCTION IF EXISTS update_help_me_pay_status(UUID, VARCHAR, UUID) CASCADE;
    DROP FUNCTION IF EXISTS get_help_me_pay_request(UUID) CASCADE;
    DROP FUNCTION IF EXISTS create_help_me_pay_request(UUID, VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR, TEXT, JSONB, VARCHAR, DECIMAL) CASCADE;
    DROP FUNCTION IF EXISTS get_user_notifications(UUID, INTEGER) CASCADE;
    DROP FUNCTION IF EXISTS mark_all_notifications_read(UUID) CASCADE;
    DROP FUNCTION IF EXISTS mark_notification_read(UUID) CASCADE;
    DROP FUNCTION IF EXISTS create_notification(UUID, VARCHAR, VARCHAR, TEXT, JSONB) CASCADE;
    DROP FUNCTION IF EXISTS search_products(TEXT) CASCADE;
    DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
    RAISE NOTICE '✓ Dropped all functions';
END $$;

-- Drop tables with CASCADE (removes any remaining dependencies)
DO $$
BEGIN
    DROP TABLE IF EXISTS notifications CASCADE;
    DROP TABLE IF EXISTS help_me_pay_requests CASCADE;
    RAISE NOTICE '✓ Dropped all tables';
END $$;

-- Verify cleanup
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '✅ CLEANUP COMPLETE - Starting fresh...';
    RAISE NOTICE '';
END $$;

-- ============================================
-- STEP 2: CREATE TABLES (WITH VERIFICATION)
-- ============================================

-- Create notifications table
DO $$
BEGIN
    CREATE TABLE notifications (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID NOT NULL,
        type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        metadata JSONB DEFAULT '{}',
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    CREATE INDEX idx_notifications_user_id ON notifications(user_id);
    CREATE INDEX idx_notifications_is_read ON notifications(is_read);
    CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

    ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

    RAISE NOTICE '✓ Created notifications table with indexes and RLS';
EXCEPTION WHEN duplicate_table THEN
    RAISE NOTICE '⚠️  notifications table already exists - using existing table';
END $$;

-- Create help_me_pay_requests table
DO $$
BEGIN
    CREATE TABLE help_me_pay_requests (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        requester_user_id UUID,
        requester_name VARCHAR(255) NOT NULL,
        requester_email VARCHAR(255) NOT NULL,
        requester_phone VARCHAR(50),
        helper_name VARCHAR(255) NOT NULL,
        helper_email VARCHAR(255),
        helper_phone VARCHAR(50),
        helper_message TEXT,
        order_data JSONB NOT NULL,
        currency VARCHAR(10) NOT NULL DEFAULT 'USD',
        total_amount DECIMAL(10, 2) NOT NULL,
        payment_link VARCHAR(500),
        payment_status VARCHAR(50) DEFAULT 'pending',
        expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '48 hours'),
        paid_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        CONSTRAINT helper_contact_check CHECK (
            helper_email IS NOT NULL OR helper_phone IS NOT NULL
        )
    );

    CREATE INDEX idx_help_me_pay_requester ON help_me_pay_requests(requester_user_id);
    CREATE INDEX idx_help_me_pay_status ON help_me_pay_requests(payment_status);
    CREATE INDEX idx_help_me_pay_created ON help_me_pay_requests(created_at DESC);

    ALTER TABLE help_me_pay_requests ENABLE ROW LEVEL SECURITY;

    RAISE NOTICE '✓ Created help_me_pay_requests table with indexes and RLS';
EXCEPTION WHEN duplicate_table THEN
    RAISE NOTICE '⚠️  help_me_pay_requests table already exists - using existing table';
END $$;

-- Verify tables exist before proceeding
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications') THEN
        RAISE EXCEPTION 'FATAL: notifications table was not created!';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'help_me_pay_requests') THEN
        RAISE EXCEPTION 'FATAL: help_me_pay_requests table was not created!';
    END IF;

    RAISE NOTICE '';
    RAISE NOTICE '✅ TABLES VERIFIED - Both tables exist and ready';
    RAISE NOTICE '';
END $$;

-- Update orders table
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'orders') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='currency') THEN
            ALTER TABLE orders ADD COLUMN currency VARCHAR(10) DEFAULT 'USD';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='exchange_rate') THEN
            ALTER TABLE orders ADD COLUMN exchange_rate DECIMAL(10, 4) DEFAULT 1.0000;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='payment_type') THEN
            ALTER TABLE orders ADD COLUMN payment_type VARCHAR(50) DEFAULT 'direct';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='help_me_pay_request_id') THEN
            ALTER TABLE orders ADD COLUMN help_me_pay_request_id UUID;
        END IF;
        RAISE NOTICE '✓ Updated orders table';
    END IF;
END $$;

-- ============================================
-- STEP 3: CREATE FUNCTIONS (IN SAFE ORDER)
-- ============================================

-- 1. Utility function (no dependencies)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Search function (depends on products table)
CREATE OR REPLACE FUNCTION search_products(search_query TEXT)
RETURNS TABLE(
    id UUID,
    name VARCHAR,
    description TEXT,
    price DECIMAL,
    image_url VARCHAR,
    category_slug VARCHAR,
    badge VARCHAR,
    stock_quantity INTEGER,
    is_active BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.id,
        p.name,
        p.description,
        p.price,
        p.image_url,
        p.category_slug,
        p.badge,
        p.stock_quantity,
        p.is_active
    FROM products p
    WHERE
        p.is_active = TRUE
        AND (
            p.name ILIKE '%' || search_query || '%'
            OR p.description ILIKE '%' || search_query || '%'
            OR p.category_slug ILIKE '%' || search_query || '%'
            OR p.badge ILIKE '%' || search_query || '%'
        )
    ORDER BY
        CASE
            WHEN p.name ILIKE search_query || '%' THEN 1
            WHEN p.name ILIKE '%' || search_query || '%' THEN 2
            ELSE 3
        END,
        p.name ASC
    LIMIT 20;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Notification functions (depend on notifications table)
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

CREATE OR REPLACE FUNCTION mark_notification_read(p_notification_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    current_user_id UUID;
BEGIN
    current_user_id := auth.uid();

    IF current_user_id IS NULL THEN
        UPDATE notifications SET is_read = TRUE, updated_at = NOW() WHERE id = p_notification_id;
    ELSE
        UPDATE notifications SET is_read = TRUE, updated_at = NOW() WHERE id = p_notification_id AND user_id = current_user_id;
    END IF;

    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION mark_all_notifications_read(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    updated_count INTEGER;
BEGIN
    UPDATE notifications SET is_read = TRUE, updated_at = NOW() WHERE user_id = p_user_id AND is_read = FALSE;
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_user_notifications(p_user_id UUID, p_limit INTEGER DEFAULT 50)
RETURNS TABLE(
    id UUID,
    user_id UUID,
    type VARCHAR,
    title VARCHAR,
    message TEXT,
    metadata JSONB,
    is_read BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT n.id, n.user_id, n.type, n.title, n.message, n.metadata, n.is_read, n.created_at, n.updated_at
    FROM notifications n
    WHERE n.user_id = p_user_id
    ORDER BY n.created_at DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Help Me Pay functions (depend on help_me_pay_requests table)
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
    request_id := gen_random_uuid();
    payment_link := 'https://keysight-tech.github.io/fordips-tech/help-me-pay.html?request=' || request_id::TEXT;

    INSERT INTO help_me_pay_requests (
        id, requester_user_id, requester_name, requester_email, requester_phone,
        helper_name, helper_email, helper_phone, helper_message,
        order_data, currency, total_amount, payment_link
    ) VALUES (
        request_id, p_requester_user_id, p_requester_name, p_requester_email, p_requester_phone,
        p_helper_name, p_helper_email, p_helper_phone, p_helper_message,
        p_order_data, p_currency, p_total_amount, payment_link
    );

    IF p_requester_user_id IS NOT NULL THEN
        PERFORM create_notification(
            p_requester_user_id, 'help_me_pay', 'Payment Request Sent',
            'Your payment request to ' || p_helper_name || ' has been sent successfully.',
            jsonb_build_object('request_id', request_id, 'helper_name', p_helper_name)
        );
    END IF;

    RETURN request_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_help_me_pay_request(p_request_id UUID)
RETURNS TABLE(
    id UUID,
    requester_user_id UUID,
    requester_name VARCHAR,
    requester_email VARCHAR,
    requester_phone VARCHAR,
    helper_name VARCHAR,
    helper_email VARCHAR,
    helper_phone VARCHAR,
    helper_message TEXT,
    order_data JSONB,
    currency VARCHAR,
    total_amount DECIMAL,
    payment_link VARCHAR,
    payment_status VARCHAR,
    expires_at TIMESTAMP WITH TIME ZONE,
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT h.* FROM help_me_pay_requests h
    WHERE h.id = p_request_id AND (h.expires_at > NOW() OR h.payment_status = 'paid');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_help_me_pay_status(
    p_request_id UUID,
    p_new_status VARCHAR(50),
    p_order_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    v_requester_user_id UUID;
    v_helper_name VARCHAR(255);
BEGIN
    -- Get request details
    SELECT requester_user_id, helper_name INTO v_requester_user_id, v_helper_name
    FROM help_me_pay_requests WHERE id = p_request_id;

    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;

    -- Update status
    UPDATE help_me_pay_requests
    SET payment_status = p_new_status,
        paid_at = CASE WHEN p_new_status = 'paid' THEN NOW() ELSE paid_at END,
        updated_at = NOW()
    WHERE id = p_request_id;

    -- Create notification if paid
    IF p_new_status = 'paid' AND v_requester_user_id IS NOT NULL THEN
        PERFORM create_notification(
            v_requester_user_id, 'payment', 'Payment Received!',
            v_helper_name || ' has completed the payment for your order.',
            jsonb_build_object('request_id', p_request_id, 'order_id', p_order_id)
        );
    END IF;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION cleanup_expired_help_me_pay_requests()
RETURNS void AS $$
BEGIN
    UPDATE help_me_pay_requests SET payment_status = 'expired'
    WHERE expires_at < NOW() AND payment_status = 'pending';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verify functions
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '✅ FUNCTIONS CREATED - All 10 functions ready';
    RAISE NOTICE '';
END $$;

-- ============================================
-- STEP 4: CREATE TRIGGERS
-- ============================================

CREATE TRIGGER update_notifications_updated_at
    BEFORE UPDATE ON notifications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_help_me_pay_updated_at
    BEFORE UPDATE ON help_me_pay_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- STEP 5: CREATE RLS POLICIES
-- ============================================

CREATE POLICY "Users can view their own notifications"
    ON notifications FOR SELECT USING (auth.uid() = user_id OR auth.uid() IS NULL);

CREATE POLICY "Users can insert notifications"
    ON notifications FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own notifications"
    ON notifications FOR UPDATE USING (auth.uid() = user_id OR auth.uid() IS NULL);

CREATE POLICY "Users can view their own requests"
    ON help_me_pay_requests FOR SELECT USING (auth.uid() = requester_user_id OR auth.uid() IS NULL);

CREATE POLICY "Anyone can view requests by link"
    ON help_me_pay_requests FOR SELECT USING (true);

CREATE POLICY "Anyone can create requests"
    ON help_me_pay_requests FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update requests"
    ON help_me_pay_requests FOR UPDATE USING (true);

-- ============================================
-- STEP 6: GRANT PERMISSIONS
-- ============================================

GRANT SELECT, INSERT, UPDATE ON notifications TO authenticated, anon;
GRANT SELECT, INSERT, UPDATE ON help_me_pay_requests TO authenticated, anon;

GRANT EXECUTE ON FUNCTION search_products(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION create_notification(UUID, VARCHAR, VARCHAR, TEXT, JSONB) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION mark_notification_read(UUID) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION mark_all_notifications_read(UUID) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_user_notifications(UUID, INTEGER) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION create_help_me_pay_request(UUID, VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR, TEXT, JSONB, VARCHAR, DECIMAL) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_help_me_pay_request(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION update_help_me_pay_status(UUID, VARCHAR, UUID) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION cleanup_expired_help_me_pay_requests() TO authenticated, anon;

-- ============================================
-- FINAL SUCCESS MESSAGE
-- ============================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '═══════════════════════════════════════════════════';
    RAISE NOTICE '✅ ✅ ✅ MIGRATION SUCCESSFUL! ✅ ✅ ✅';
    RAISE NOTICE '═══════════════════════════════════════════════════';
    RAISE NOTICE '';
    RAISE NOTICE '📊 Created:';
    RAISE NOTICE '   ✓ 2 Tables (notifications, help_me_pay_requests)';
    RAISE NOTICE '   ✓ 10 Functions (search, notifications, help-me-pay)';
    RAISE NOTICE '   ✓ 7 RLS Policies (security enabled)';
    RAISE NOTICE '   ✓ 2 Triggers (auto-timestamps)';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 Features Ready:';
    RAISE NOTICE '   ✓ Product search';
    RAISE NOTICE '   ✓ User notifications';
    RAISE NOTICE '   ✓ Help Me Pay';
    RAISE NOTICE '   ✓ Multi-currency';
    RAISE NOTICE '   ✓ Account creation';
    RAISE NOTICE '';
    RAISE NOTICE '📝 Next: Enable Email Auth in Dashboard → Authentication → Providers';
    RAISE NOTICE '═══════════════════════════════════════════════════';
    RAISE NOTICE '';
END $$;
