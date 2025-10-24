-- =====================================================
-- FORDIPS TECH - Reviews & Ratings System
-- Run this script in your Supabase SQL Editor
-- =====================================================

-- 1. CREATE REVIEWS TABLE
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id INTEGER NOT NULL,
    product_name TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CREATE INDEXES FOR BETTER PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_customer_email ON reviews(customer_email);

-- 3. ENABLE ROW LEVEL SECURITY
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- 4. CREATE RLS POLICIES
-- Allow public to read approved reviews
DROP POLICY IF EXISTS "Enable read access for approved reviews" ON reviews;
CREATE POLICY "Enable read access for approved reviews" ON reviews
    FOR SELECT USING (status = 'approved');

-- Allow public to insert reviews (they start as pending)
DROP POLICY IF EXISTS "Enable insert access for reviews" ON reviews;
CREATE POLICY "Enable insert access for reviews" ON reviews
    FOR INSERT WITH CHECK (true);

-- Allow update for all (for admin approval workflow)
DROP POLICY IF EXISTS "Enable update access for reviews" ON reviews;
CREATE POLICY "Enable update access for reviews" ON reviews
    FOR UPDATE USING (true);

-- 5. CREATE TRIGGER FOR UPDATED_AT
DROP TRIGGER IF EXISTS update_reviews_updated_at ON reviews;
CREATE TRIGGER update_reviews_updated_at
    BEFORE UPDATE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 6. CREATE FUNCTION TO GET AVERAGE RATING
CREATE OR REPLACE FUNCTION get_product_average_rating(p_product_id INTEGER)
RETURNS NUMERIC AS $$
BEGIN
    RETURN (
        SELECT ROUND(AVG(rating)::numeric, 1)
        FROM reviews
        WHERE product_id = p_product_id
        AND status = 'approved'
    );
END;
$$ LANGUAGE plpgsql;

-- 7. CREATE FUNCTION TO GET REVIEW COUNT
CREATE OR REPLACE FUNCTION get_product_review_count(p_product_id INTEGER)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)
        FROM reviews
        WHERE product_id = p_product_id
        AND status = 'approved'
    );
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

-- Approve a review
-- UPDATE reviews SET status = 'approved' WHERE id = 'review-uuid-here';

-- Reject a review
-- UPDATE reviews SET status = 'rejected' WHERE id = 'review-uuid-here';

-- View pending reviews (for admin moderation)
-- SELECT * FROM reviews WHERE status = 'pending' ORDER BY created_at DESC;

-- Get average rating for a product
-- SELECT get_product_average_rating(1); -- Replace 1 with product ID

-- Get review count for a product
-- SELECT get_product_review_count(1); -- Replace 1 with product ID

-- =====================================================
-- SAMPLE QUERIES
-- =====================================================

-- Insert a sample review (for testing)
-- INSERT INTO reviews (product_id, product_name, rating, review_text, customer_name, customer_email, status)
-- VALUES (1, 'iPhone 17 Pro Max', 5, 'Amazing phone! Love the camera quality.', 'John Doe', 'john@example.com', 'approved');

-- View all approved reviews for a product
-- SELECT * FROM reviews
-- WHERE product_id = 1
-- AND status = 'approved'
-- ORDER BY created_at DESC;

-- Get product ratings summary
-- SELECT
--     product_name,
--     COUNT(*) as total_reviews,
--     ROUND(AVG(rating)::numeric, 1) as average_rating,
--     COUNT(CASE WHEN rating = 5 THEN 1 END) as five_star,
--     COUNT(CASE WHEN rating = 4 THEN 1 END) as four_star,
--     COUNT(CASE WHEN rating = 3 THEN 1 END) as three_star,
--     COUNT(CASE WHEN rating = 2 THEN 1 END) as two_star,
--     COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star
-- FROM reviews
-- WHERE status = 'approved'
-- GROUP BY product_name;

-- =====================================================
-- VERIFICATION QUERIES (Run these after setup)
-- =====================================================

-- Check if table was created successfully
SELECT EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'reviews'
);

-- View table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'reviews'
ORDER BY ordinal_position;

-- Check indexes
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'reviews';

-- =====================================================
-- DONE! Your reviews system is ready
-- =====================================================

COMMENT ON TABLE reviews IS 'Customer reviews and ratings for products. Reviews start as pending and must be approved by admin.';
COMMENT ON COLUMN reviews.product_id IS 'References the product ID from the products list';
COMMENT ON COLUMN reviews.rating IS 'Star rating from 1 to 5';
COMMENT ON COLUMN reviews.status IS 'Review moderation status: pending, approved, or rejected';
