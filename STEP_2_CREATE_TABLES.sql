/**
 * STEP 2: CREATE TABLES
 * Run this AFTER Step 1 cleanup
 * Creates the notifications and help_me_pay_requests tables
 */

-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================
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

-- Create indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- ============================================
-- HELP ME PAY REQUESTS TABLE
-- ============================================
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

-- Create indexes
CREATE INDEX idx_help_me_pay_requester ON help_me_pay_requests(requester_user_id);
CREATE INDEX idx_help_me_pay_status ON help_me_pay_requests(payment_status);
CREATE INDEX idx_help_me_pay_created ON help_me_pay_requests(created_at DESC);

-- Enable RLS
ALTER TABLE help_me_pay_requests ENABLE ROW LEVEL SECURITY;

-- ============================================
-- UPDATE ORDERS TABLE (if it exists)
-- ============================================
DO $$
BEGIN
    -- Check if orders table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'orders') THEN
        -- Add currency columns if they don't exist
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

        RAISE NOTICE '✅ Orders table updated with new columns';
    ELSE
        RAISE NOTICE '⚠️  Orders table does not exist - skipping';
    END IF;
END $$;

-- ============================================
-- VERIFICATION
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '✅ TABLES CREATED SUCCESSFULLY!';
    RAISE NOTICE '📊 Created: notifications, help_me_pay_requests';
    RAISE NOTICE '▶️  You can now run STEP 3: CREATE FUNCTIONS AND POLICIES';
END $$;

-- Show created tables
SELECT 'notifications' as table_name, COUNT(*) as column_count
FROM information_schema.columns
WHERE table_name = 'notifications'
UNION ALL
SELECT 'help_me_pay_requests', COUNT(*)
FROM information_schema.columns
WHERE table_name = 'help_me_pay_requests';
