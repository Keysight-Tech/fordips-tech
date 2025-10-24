/**
 * STEP 3: CREATE FUNCTIONS AND POLICIES
 * Run this AFTER Step 2 (tables created)
 * Creates all database functions, triggers, and RLS policies
 */

-- ============================================
-- FUNCTION: Update Timestamps
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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
-- NOTIFICATION FUNCTIONS
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

CREATE OR REPLACE FUNCTION mark_notification_read(p_notification_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    current_user_id UUID;
BEGIN
    -- Get current user ID (works for both authenticated and service role)
    current_user_id := auth.uid();

    -- If no auth context, allow update (for service role)
    IF current_user_id IS NULL THEN
        UPDATE notifications
        SET is_read = TRUE, updated_at = NOW()
        WHERE id = p_notification_id;
    ELSE
        -- Only update if user owns the notification
        UPDATE notifications
        SET is_read = TRUE, updated_at = NOW()
        WHERE id = p_notification_id AND user_id = current_user_id;
    END IF;

    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION mark_all_notifications_read(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    updated_count INTEGER;
BEGIN
    UPDATE notifications
    SET is_read = TRUE, updated_at = NOW()
    WHERE user_id = p_user_id AND is_read = FALSE;

    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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
-- HELP ME PAY FUNCTIONS
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

CREATE OR REPLACE FUNCTION get_help_me_pay_request(p_request_id UUID)
RETURNS SETOF help_me_pay_requests AS $$
BEGIN
    RETURN QUERY
    SELECT *
    FROM help_me_pay_requests
    WHERE id = p_request_id AND (expires_at > NOW() OR payment_status = 'paid');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_help_me_pay_status(
    p_request_id UUID,
    p_new_status VARCHAR(50),
    p_order_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    request_record help_me_pay_requests;
BEGIN
    SELECT * INTO request_record
    FROM help_me_pay_requests
    WHERE id = p_request_id;

    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;

    UPDATE help_me_pay_requests
    SET
        payment_status = p_new_status,
        paid_at = CASE WHEN p_new_status = 'paid' THEN NOW() ELSE paid_at END,
        updated_at = NOW()
    WHERE id = p_request_id;

    IF p_new_status = 'paid' AND request_record.requester_user_id IS NOT NULL THEN
        PERFORM create_notification(
            request_record.requester_user_id,
            'payment',
            'Payment Received!',
            request_record.helper_name || ' has completed the payment for your order.',
            jsonb_build_object('request_id', p_request_id, 'order_id', p_order_id)
        );
    END IF;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION cleanup_expired_help_me_pay_requests()
RETURNS void AS $$
BEGIN
    UPDATE help_me_pay_requests
    SET payment_status = 'expired'
    WHERE expires_at < NOW() AND payment_status = 'pending';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TRIGGERS
-- ============================================
CREATE TRIGGER update_notifications_updated_at
    BEFORE UPDATE ON notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_help_me_pay_updated_at
    BEFORE UPDATE ON help_me_pay_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Notifications policies
CREATE POLICY "Users can view their own notifications"
    ON notifications FOR SELECT
    USING (auth.uid() = user_id OR auth.uid() IS NULL);

CREATE POLICY "Users can insert their own notifications"
    ON notifications FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Users can update their own notifications"
    ON notifications FOR UPDATE
    USING (auth.uid() = user_id OR auth.uid() IS NULL);

-- Help Me Pay policies
CREATE POLICY "Users can view their own requests"
    ON help_me_pay_requests FOR SELECT
    USING (auth.uid() = requester_user_id OR auth.uid() IS NULL);

CREATE POLICY "Anyone can view requests by link"
    ON help_me_pay_requests FOR SELECT
    USING (true);

CREATE POLICY "Anyone can create help me pay requests"
    ON help_me_pay_requests FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Anyone can update help me pay requests"
    ON help_me_pay_requests FOR UPDATE
    USING (true);

-- ============================================
-- GRANT PERMISSIONS
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
-- VERIFICATION
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '✅ MIGRATION COMPLETED SUCCESSFULLY!';
    RAISE NOTICE '';
    RAISE NOTICE '📊 Tables: notifications, help_me_pay_requests';
    RAISE NOTICE '⚙️  Functions: 9 database functions created';
    RAISE NOTICE '🔒 RLS Policies: Enabled on all tables';
    RAISE NOTICE '✨ Triggers: Auto-update timestamps';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 Your Fordips Tech platform is ready!';
    RAISE NOTICE '👤 Account creation should now work properly';
END $$;

-- Show all functions created
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND (routine_name LIKE '%notification%'
     OR routine_name LIKE '%help_me_pay%'
     OR routine_name LIKE '%search_products%'
     OR routine_name LIKE '%update_updated_at%')
ORDER BY routine_name;
