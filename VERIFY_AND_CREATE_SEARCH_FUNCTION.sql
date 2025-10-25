-- ============================================
-- FORDIPS TECH - SEARCH FUNCTION VERIFICATION & SETUP
-- This script ensures the search_products function exists and is working
-- ============================================

-- 1. Check if search_products function exists
DO $$
DECLARE
    func_exists BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public'
        AND p.proname = 'search_products'
    ) INTO func_exists;

    IF func_exists THEN
        RAISE NOTICE '✓ search_products function exists';
    ELSE
        RAISE NOTICE '✗ search_products function does NOT exist - will create it';
    END IF;
END $$;

-- 2. Drop existing function if exists (to ensure clean state)
DROP FUNCTION IF EXISTS search_products(TEXT);

-- 3. Create the search_products function
CREATE OR REPLACE FUNCTION search_products(search_query TEXT)
RETURNS TABLE(
    id UUID,
    name TEXT,
    description TEXT,
    price DECIMAL,
    image_url TEXT,
    category_slug TEXT,
    badge TEXT,
    stock_quantity INTEGER,
    is_active BOOLEAN,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
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
        p.is_active,
        p.created_at,
        p.updated_at
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
        -- Prioritize exact matches
        CASE
            WHEN p.name ILIKE search_query THEN 1
            WHEN p.name ILIKE search_query || '%' THEN 2
            WHEN p.name ILIKE '%' || search_query THEN 3
            ELSE 4
        END,
        p.created_at DESC
    LIMIT 50;
END;
$$ LANGUAGE plpgsql STABLE;

-- 4. Grant execute permissions to anon and authenticated users
GRANT EXECUTE ON FUNCTION search_products(TEXT) TO anon, authenticated;

-- 5. Verify the function was created successfully
DO $$
DECLARE
    func_exists BOOLEAN;
    product_count INTEGER;
BEGIN
    -- Check if function exists
    SELECT EXISTS (
        SELECT 1
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public'
        AND p.proname = 'search_products'
    ) INTO func_exists;

    -- Check products count
    SELECT COUNT(*) INTO product_count FROM products;

    RAISE NOTICE '';
    RAISE NOTICE '════════════════════════════════════════════════════';
    RAISE NOTICE '           SEARCH FUNCTION VERIFICATION';
    RAISE NOTICE '════════════════════════════════════════════════════';
    RAISE NOTICE '';

    IF func_exists THEN
        RAISE NOTICE '✓ search_products function: CREATED';
    ELSE
        RAISE NOTICE '✗ search_products function: FAILED';
    END IF;

    RAISE NOTICE '✓ Total products in database: %', product_count;
    RAISE NOTICE '';
    RAISE NOTICE '════════════════════════════════════════════════════';
    RAISE NOTICE '';
END $$;

-- 6. Test the search function with sample queries
DO $$
DECLARE
    search_result_count INTEGER;
BEGIN
    RAISE NOTICE 'Testing search functionality...';
    RAISE NOTICE '';

    -- Test 1: Search for "iPhone"
    SELECT COUNT(*) INTO search_result_count
    FROM search_products('iPhone');
    RAISE NOTICE 'Test 1: Search "iPhone" returned % results', search_result_count;

    -- Test 2: Search for "Samsung"
    SELECT COUNT(*) INTO search_result_count
    FROM search_products('Samsung');
    RAISE NOTICE 'Test 2: Search "Samsung" returned % results', search_result_count;

    -- Test 3: Search for "Laptop"
    SELECT COUNT(*) INTO search_result_count
    FROM search_products('Laptop');
    RAISE NOTICE 'Test 3: Search "Laptop" returned % results', search_result_count;

    -- Test 4: Search for generic term
    SELECT COUNT(*) INTO search_result_count
    FROM search_products('new');
    RAISE NOTICE 'Test 4: Search "new" returned % results', search_result_count;

    RAISE NOTICE '';
    RAISE NOTICE 'All search tests completed!';
END $$;

-- 7. Display sample search results
SELECT
    name,
    category_slug,
    price,
    stock_quantity,
    badge
FROM search_products('phone')
LIMIT 5;

-- 8. Final completion message
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '════════════════════════════════════════════════════';
    RAISE NOTICE '         SEARCH FUNCTION SETUP COMPLETE!';
    RAISE NOTICE '════════════════════════════════════════════════════';
    RAISE NOTICE '';
    RAISE NOTICE 'You can now test search in the website:';
    RAISE NOTICE '1. Go to the homepage';
    RAISE NOTICE '2. Type a search query in the search bar';
    RAISE NOTICE '3. Results should appear in real-time';
    RAISE NOTICE '';
END $$;
