-- =====================================================
-- FORDIPS TECH - Complete Order Tracking System
-- End-to-End Order Management with Notifications
-- Run this script in your Supabase SQL Editor
-- =====================================================

-- 1. UPDATE ORDERS TABLE WITH TRACKING FIELDS
-- Add new columns to existing orders table
ALTER TABLE IF EXISTS orders
ADD COLUMN IF NOT EXISTS tracking_number TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS carrier TEXT,
ADD COLUMN IF NOT EXISTS estimated_delivery_date DATE,
ADD COLUMN IF NOT EXISTS actual_delivery_date DATE,
ADD COLUMN IF NOT EXISTS last_status_update TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Update status field to include more statuses
-- Existing status: pending, processing, shipped, delivered, cancelled

-- 2. CREATE ORDER STATUS HISTORY TABLE
CREATE TABLE IF NOT EXISTS order_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    previous_status TEXT,
    new_status TEXT NOT NULL,
    changed_by TEXT, -- user_id or 'system' or 'admin'
    changed_by_name TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CREATE ORDER NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS order_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    recipient_email TEXT NOT NULL,
    recipient_type TEXT CHECK (recipient_type IN ('customer', 'admin')),
    notification_type TEXT CHECK (notification_type IN (
        'order_placed',
        'order_confirmed',
        'order_processing',
        'order_shipped',
        'order_out_for_delivery',
        'order_delivered',
        'order_cancelled',
        'order_refunded',
        'status_updated'
    )),
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    error_message TEXT,
    metadata JSONB -- For additional data like tracking numbers, etc.
);

-- 4. CREATE SHIPPING TRACKING TABLE
CREATE TABLE IF NOT EXISTS shipping_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    tracking_number TEXT NOT NULL,
    carrier TEXT NOT NULL,
    status TEXT NOT NULL,
    location TEXT,
    event_description TEXT,
    event_timestamp TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. CREATE CUSTOMER ORDER VIEWS TABLE (for easy tracking)
CREATE TABLE IF NOT EXISTS customer_order_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    customer_email TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    order_number TEXT NOT NULL,
    status TEXT NOT NULL,
    total_amount DECIMAL(10, 2),
    items_count INTEGER,
    tracking_url TEXT,
    last_viewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. CREATE INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_order_status_history_order_id ON order_status_history(order_id);
CREATE INDEX IF NOT EXISTS idx_order_status_history_created_at ON order_status_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_notifications_order_id ON order_notifications(order_id);
CREATE INDEX IF NOT EXISTS idx_order_notifications_recipient ON order_notifications(recipient_email);
CREATE INDEX IF NOT EXISTS idx_order_notifications_status ON order_notifications(status);
CREATE INDEX IF NOT EXISTS idx_shipping_tracking_order_id ON shipping_tracking(order_id);
CREATE INDEX IF NOT EXISTS idx_shipping_tracking_number ON shipping_tracking(tracking_number);
CREATE INDEX IF NOT EXISTS idx_customer_order_tracking_email ON customer_order_tracking(customer_email);
CREATE INDEX IF NOT EXISTS idx_customer_order_tracking_order_number ON customer_order_tracking(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_tracking_number ON orders(tracking_number);

-- 7. ENABLE ROW LEVEL SECURITY
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipping_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_order_tracking ENABLE ROW LEVEL SECURITY;

-- 8. CREATE RLS POLICIES FOR ORDER STATUS HISTORY
DROP POLICY IF EXISTS "Users can view their order history" ON order_status_history;
CREATE POLICY "Users can view their order history" ON order_status_history
    FOR SELECT USING (
        order_id IN (
            SELECT id FROM orders WHERE customer_email = auth.jwt()->>'email'
        ) OR auth.jwt()->>'role' = 'admin'
    );

DROP POLICY IF EXISTS "Admins can insert status history" ON order_status_history;
CREATE POLICY "Admins can insert status history" ON order_status_history
    FOR INSERT WITH CHECK (auth.jwt()->>'role' = 'admin' OR changed_by = 'system');

-- 9. CREATE RLS POLICIES FOR ORDER NOTIFICATIONS
DROP POLICY IF EXISTS "Users can view their notifications" ON order_notifications;
CREATE POLICY "Users can view their notifications" ON order_notifications
    FOR SELECT USING (
        recipient_email = auth.jwt()->>'email' OR auth.jwt()->>'role' = 'admin'
    );

DROP POLICY IF EXISTS "System can insert notifications" ON order_notifications;
CREATE POLICY "System can insert notifications" ON order_notifications
    FOR INSERT WITH CHECK (true);

-- 10. CREATE RLS POLICIES FOR SHIPPING TRACKING
DROP POLICY IF EXISTS "Users can view their shipping tracking" ON shipping_tracking;
CREATE POLICY "Users can view their shipping tracking" ON shipping_tracking
    FOR SELECT USING (
        order_id IN (
            SELECT id FROM orders WHERE customer_email = auth.jwt()->>'email'
        ) OR auth.jwt()->>'role' = 'admin'
    );

DROP POLICY IF EXISTS "Admins can manage shipping tracking" ON shipping_tracking;
CREATE POLICY "Admins can manage shipping tracking" ON shipping_tracking
    FOR ALL USING (auth.jwt()->>'role' = 'admin');

-- 11. CREATE RLS POLICIES FOR CUSTOMER ORDER TRACKING
DROP POLICY IF EXISTS "Users can view their order tracking" ON customer_order_tracking;
CREATE POLICY "Users can view their order tracking" ON customer_order_tracking
    FOR SELECT USING (
        customer_email = auth.jwt()->>'email' OR auth.jwt()->>'role' = 'admin'
    );

DROP POLICY IF EXISTS "System can insert order tracking" ON customer_order_tracking;
CREATE POLICY "System can insert order tracking" ON customer_order_tracking
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "System can update order tracking" ON customer_order_tracking;
CREATE POLICY "System can update order tracking" ON customer_order_tracking
    FOR UPDATE USING (true);

-- 12. CREATE FUNCTION TO GENERATE TRACKING NUMBER
CREATE OR REPLACE FUNCTION generate_tracking_number()
RETURNS TEXT AS $$
DECLARE
    tracking_num TEXT;
    exists_check INTEGER;
BEGIN
    LOOP
        -- Generate format: FT-YYYYMMDD-XXXXXX
        tracking_num := 'FT-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' ||
                       LPAD(FLOOR(RANDOM() * 999999)::TEXT, 6, '0');

        -- Check if it exists
        SELECT COUNT(*) INTO exists_check
        FROM orders
        WHERE tracking_number = tracking_num;

        EXIT WHEN exists_check = 0;
    END LOOP;

    RETURN tracking_num;
END;
$$ LANGUAGE plpgsql;

-- 13. CREATE FUNCTION TO UPDATE ORDER STATUS
CREATE OR REPLACE FUNCTION update_order_status(
    p_order_id UUID,
    p_new_status TEXT,
    p_changed_by TEXT DEFAULT 'system',
    p_changed_by_name TEXT DEFAULT 'System',
    p_notes TEXT DEFAULT NULL,
    p_tracking_number TEXT DEFAULT NULL,
    p_carrier TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_old_status TEXT;
    v_customer_email TEXT;
    v_customer_name TEXT;
    v_order_number TEXT;
    v_result JSONB;
BEGIN
    -- Get current order status
    SELECT status, customer_email, customer_name, order_number
    INTO v_old_status, v_customer_email, v_customer_name, v_order_number
    FROM orders
    WHERE id = p_order_id;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Order not found');
    END IF;

    -- Update order status
    UPDATE orders
    SET status = p_new_status,
        last_status_update = NOW(),
        tracking_number = COALESCE(p_tracking_number, tracking_number),
        carrier = COALESCE(p_carrier, carrier),
        notes = COALESCE(p_notes, notes)
    WHERE id = p_order_id;

    -- Record status change in history
    INSERT INTO order_status_history (
        order_id,
        previous_status,
        new_status,
        changed_by,
        changed_by_name,
        notes
    ) VALUES (
        p_order_id,
        v_old_status,
        p_new_status,
        p_changed_by,
        p_changed_by_name,
        p_notes
    );

    -- Create notifications (will be handled by trigger or application)
    -- This is a placeholder - actual notification sending happens in application

    RETURN jsonb_build_object(
        'success', true,
        'order_id', p_order_id,
        'old_status', v_old_status,
        'new_status', p_new_status,
        'customer_email', v_customer_email
    );
END;
$$ LANGUAGE plpgsql;

-- 14. CREATE FUNCTION TO GET ORDER TRACKING INFO
CREATE OR REPLACE FUNCTION get_order_tracking(p_order_number TEXT)
RETURNS TABLE (
    order_id UUID,
    order_number TEXT,
    status TEXT,
    customer_name TEXT,
    customer_email TEXT,
    total_amount DECIMAL,
    tracking_number TEXT,
    carrier TEXT,
    estimated_delivery DATE,
    created_at TIMESTAMPTZ,
    status_history JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        o.id,
        o.order_number,
        o.status,
        o.customer_name,
        o.customer_email,
        o.total_amount,
        o.tracking_number,
        o.carrier,
        o.estimated_delivery_date,
        o.created_at,
        COALESCE(
            (SELECT jsonb_agg(
                jsonb_build_object(
                    'status', osh.new_status,
                    'changed_at', osh.created_at,
                    'changed_by', osh.changed_by_name,
                    'notes', osh.notes
                ) ORDER BY osh.created_at ASC
            )
            FROM order_status_history osh
            WHERE osh.order_id = o.id),
            '[]'::jsonb
        ) as status_history
    FROM orders o
    WHERE o.order_number = p_order_number;
END;
$$ LANGUAGE plpgsql;

-- 15. CREATE FUNCTION TO GET CUSTOMER ORDERS
CREATE OR REPLACE FUNCTION get_customer_orders(p_customer_email TEXT)
RETURNS TABLE (
    order_id UUID,
    order_number TEXT,
    status TEXT,
    total_amount DECIMAL,
    items_count BIGINT,
    tracking_number TEXT,
    created_at TIMESTAMPTZ,
    last_update TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        o.id,
        o.order_number,
        o.status,
        o.total_amount,
        (SELECT COUNT(*) FROM order_items WHERE order_id = o.id),
        o.tracking_number,
        o.created_at,
        o.last_status_update
    FROM orders o
    WHERE o.customer_email = p_customer_email
    ORDER BY o.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- 16. CREATE TRIGGER TO AUTO-GENERATE TRACKING NUMBER
CREATE OR REPLACE FUNCTION auto_generate_tracking_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.tracking_number IS NULL THEN
        NEW.tracking_number := generate_tracking_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_auto_tracking_number ON orders;
CREATE TRIGGER trigger_auto_tracking_number
    BEFORE INSERT ON orders
    FOR EACH ROW
    EXECUTE FUNCTION auto_generate_tracking_number();

-- 17. CREATE FUNCTION TO GET ADMIN DASHBOARD DATA
CREATE OR REPLACE FUNCTION get_admin_order_dashboard()
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'total_orders', (SELECT COUNT(*) FROM orders),
        'pending_orders', (SELECT COUNT(*) FROM orders WHERE status = 'pending'),
        'processing_orders', (SELECT COUNT(*) FROM orders WHERE status = 'processing'),
        'shipped_orders', (SELECT COUNT(*) FROM orders WHERE status = 'shipped'),
        'delivered_orders', (SELECT COUNT(*) FROM orders WHERE status = 'delivered'),
        'cancelled_orders', (SELECT COUNT(*) FROM orders WHERE status = 'cancelled'),
        'total_revenue', (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE status != 'cancelled'),
        'today_orders', (SELECT COUNT(*) FROM orders WHERE DATE(created_at) = CURRENT_DATE),
        'recent_orders', (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'order_number', order_number,
                    'customer_name', customer_name,
                    'status', status,
                    'total', total_amount,
                    'created_at', created_at
                ) ORDER BY created_at DESC
            )
            FROM (SELECT * FROM orders ORDER BY created_at DESC LIMIT 10) recent
        )
    ) INTO result;

    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check if all tables exist
SELECT
    EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'order_status_history') as status_history_exists,
    EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'order_notifications') as notifications_exists,
    EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'shipping_tracking') as shipping_exists,
    EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'customer_order_tracking') as customer_tracking_exists;

-- =====================================================
-- SAMPLE USAGE
-- =====================================================

-- Update order status (as admin)
-- SELECT update_order_status(
--     'order-uuid-here'::UUID,
--     'shipped',
--     'admin',
--     'Admin Name',
--     'Package shipped via FedEx',
--     'FT-20241023-123456',
--     'FedEx'
-- );

-- Get order tracking info
-- SELECT * FROM get_order_tracking('FT12345678');

-- Get customer orders
-- SELECT * FROM get_customer_orders('customer@example.com');

-- Get admin dashboard
-- SELECT * FROM get_admin_order_dashboard();

-- View order status history
-- SELECT o.order_number, osh.*
-- FROM order_status_history osh
-- JOIN orders o ON osh.order_id = o.id
-- ORDER BY osh.created_at DESC;

-- =====================================================
-- DONE! Your order tracking system is ready
-- =====================================================

COMMENT ON TABLE order_status_history IS 'Tracks all status changes for orders with timestamps and who made the change';
COMMENT ON TABLE order_notifications IS 'Email notifications for order updates sent to customers and admin';
COMMENT ON TABLE shipping_tracking IS 'Detailed shipping tracking events from carriers';
COMMENT ON TABLE customer_order_tracking IS 'Simplified view for customers to track their orders';
