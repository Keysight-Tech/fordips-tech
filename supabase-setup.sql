-- =====================================================
-- FORDIPS TECH - Supabase Database Setup
-- Run this script in your Supabase SQL Editor
-- =====================================================

-- 1. CREATE ORDERS TABLE
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT,
    shipping_address TEXT NOT NULL,
    city TEXT NOT NULL,
    zip_code TEXT NOT NULL,
    payment_method TEXT NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CREATE ORDER_ITEMS TABLE
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_name TEXT NOT NULL,
    product_image TEXT,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    variant_color TEXT,
    variant_storage TEXT,
    variant_size TEXT,
    subtotal DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CREATE NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    recipient_email TEXT NOT NULL,
    recipient_type TEXT NOT NULL CHECK (recipient_type IN ('customer', 'admin')),
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'pending'))
);

-- 4. CREATE INDEXES FOR BETTER PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_notifications_order_id ON notifications(order_id);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_email ON notifications(recipient_email);

-- 5. ENABLE ROW LEVEL SECURITY
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 6. CREATE RLS POLICIES
-- Allow public read and insert for orders (adjust based on your security needs)
DROP POLICY IF EXISTS "Enable read access for all users" ON orders;
CREATE POLICY "Enable read access for all users" ON orders
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert access for all users" ON orders;
CREATE POLICY "Enable insert access for all users" ON orders
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update access for all users" ON orders;
CREATE POLICY "Enable update access for all users" ON orders
    FOR UPDATE USING (true);

-- Policies for order_items
DROP POLICY IF EXISTS "Enable read access for order items" ON order_items;
CREATE POLICY "Enable read access for order items" ON order_items
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert access for order items" ON order_items;
CREATE POLICY "Enable insert access for order items" ON order_items
    FOR INSERT WITH CHECK (true);

-- Policies for notifications
DROP POLICY IF EXISTS "Enable read access for notifications" ON notifications;
CREATE POLICY "Enable read access for notifications" ON notifications
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert access for notifications" ON notifications;
CREATE POLICY "Enable insert access for notifications" ON notifications
    FOR INSERT WITH CHECK (true);

-- 7. CREATE FUNCTION TO UPDATE updated_at TIMESTAMP
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. CREATE TRIGGER FOR ORDERS TABLE
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- INSTRUCTIONS:
-- 1. Go to your Supabase Dashboard (https://app.supabase.com)
-- 2. Select your project
-- 3. Go to SQL Editor
-- 4. Create a new query
-- 5. Copy and paste this entire script
-- 6. Click "Run" to execute
-- =====================================================

-- OPTIONAL: Insert sample admin notification email
-- UPDATE THIS WITH YOUR ACTUAL ADMIN EMAIL
-- You can query notifications table to see all order notifications
COMMENT ON TABLE notifications IS 'Stores notification records for customer and admin emails';

-- =====================================================
-- VERIFICATION QUERIES (Run these after setup)
-- =====================================================

-- Check if tables were created successfully
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('orders', 'order_items', 'notifications');

-- View table structures
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'orders'
ORDER BY ordinal_position;

-- =====================================================
-- DONE! Your database is ready for e-commerce orders
-- =====================================================
