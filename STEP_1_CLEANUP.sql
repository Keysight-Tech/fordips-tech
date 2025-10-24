/**
 * STEP 1: CLEANUP SCRIPT
 * Run this FIRST to remove any partial migrations
 * This ensures we start with a clean slate
 */

-- ============================================
-- DROP ALL POLICIES (if they exist)
-- ============================================
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
DROP POLICY IF EXISTS "Requesters can view their own requests" ON help_me_pay_requests;
DROP POLICY IF EXISTS "Anyone can view requests they received (by link)" ON help_me_pay_requests;
DROP POLICY IF EXISTS "System can create help me pay requests" ON help_me_pay_requests;
DROP POLICY IF EXISTS "System can update help me pay requests" ON help_me_pay_requests;

-- ============================================
-- DROP ALL TRIGGERS (if they exist)
-- ============================================
DROP TRIGGER IF EXISTS update_notifications_updated_at ON notifications;
DROP TRIGGER IF EXISTS update_help_me_pay_updated_at ON help_me_pay_requests;

-- ============================================
-- DROP ALL FUNCTIONS (if they exist)
-- ============================================
DROP FUNCTION IF EXISTS search_products(TEXT);
DROP FUNCTION IF EXISTS create_notification(UUID, VARCHAR, VARCHAR, TEXT, JSONB);
DROP FUNCTION IF EXISTS mark_notification_read(UUID);
DROP FUNCTION IF EXISTS mark_all_notifications_read(UUID);
DROP FUNCTION IF EXISTS get_user_notifications(UUID, INTEGER);
DROP FUNCTION IF EXISTS create_help_me_pay_request(UUID, VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR, TEXT, JSONB, VARCHAR, DECIMAL);
DROP FUNCTION IF EXISTS get_help_me_pay_request(UUID);
DROP FUNCTION IF EXISTS update_help_me_pay_status(UUID, VARCHAR, UUID);
DROP FUNCTION IF EXISTS cleanup_expired_help_me_pay_requests();
DROP FUNCTION IF EXISTS update_updated_at_column();

-- ============================================
-- DROP ALL TABLES (if they exist)
-- ============================================
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS help_me_pay_requests CASCADE;

-- ============================================
-- VERIFICATION
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '✅ CLEANUP COMPLETED!';
    RAISE NOTICE '📋 All policies, triggers, functions, and tables have been removed.';
    RAISE NOTICE '▶️  You can now run STEP 2: CREATE TABLES';
END $$;
