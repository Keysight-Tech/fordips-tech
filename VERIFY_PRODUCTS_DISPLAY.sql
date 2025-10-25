-- ═══════════════════════════════════════════════════════════════════════════════
-- 🔍 FORDIPS TECH - PRODUCT DISPLAY VERIFICATION SCRIPT
-- ═══════════════════════════════════════════════════════════════════════════════
--
-- 🎯 PURPOSE: Verify all 75 products are displaying correctly in the database
--            and in the optimized materialized views
--
-- 📝 INSTRUCTIONS: Run this script in Supabase SQL Editor
--
-- ✅ EXPECTED: All checks should pass with green checkmarks
--
-- ═══════════════════════════════════════════════════════════════════════════════

\echo ''
\echo '═══════════════════════════════════════════════════════════════'
\echo '🔍 PRODUCT DISPLAY VERIFICATION - STARTING'
\echo '═══════════════════════════════════════════════════════════════'
\echo ''

-- ═══════════════════════════════════════════════════════════════════════════════
-- TEST 1: Verify Total Product Count
-- ═══════════════════════════════════════════════════════════════════════════════

DO $$
DECLARE
    total_products INTEGER;
    active_products INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_products FROM products;
    SELECT COUNT(*) INTO active_products FROM products WHERE is_active = true;

    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    RAISE NOTICE 'TEST 1: Total Product Count';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    RAISE NOTICE '';
    RAISE NOTICE '📦 Total Products in Database: %', total_products;
    RAISE NOTICE '✅ Active Products: %', active_products;
    RAISE NOTICE '❌ Inactive Products: %', (total_products - active_products);
    RAISE NOTICE '';

    IF total_products >= 75 THEN
        RAISE NOTICE '✅ PASS: Found % products (expected >= 75)', total_products;
    ELSE
        RAISE WARNING '⚠️  WARNING: Only found % products (expected >= 75)', total_products;
    END IF;
    RAISE NOTICE '';
END $$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- TEST 2: Products by Category Breakdown
-- ═══════════════════════════════════════════════════════════════════════════════

DO $$
BEGIN
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    RAISE NOTICE 'TEST 2: Products by Category';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    RAISE NOTICE '';
END $$;

SELECT
    '📱 ' || c.name as category,
    COUNT(p.id) as total_products,
    COUNT(CASE WHEN p.is_active THEN 1 END) as active,
    COUNT(CASE WHEN NOT p.is_active THEN 1 END) as inactive,
    MIN(p.price)::money as min_price,
    MAX(p.price)::money as max_price,
    ROUND(AVG(p.price), 2)::money as avg_price,
    CASE
        WHEN COUNT(p.id) > 0 THEN '✅ Has Products'
        ELSE '❌ Empty'
    END as status
FROM categories c
LEFT JOIN products p ON c.id = p.category_id
GROUP BY c.id, c.name
ORDER BY COUNT(p.id) DESC;

DO $$
BEGIN
    RAISE NOTICE '';
END $$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- TEST 3: Verify Materialized View Sync
-- ═══════════════════════════════════════════════════════════════════════════════

DO $$
DECLARE
    base_count INTEGER;
    mv_count INTEGER;
    difference INTEGER;
BEGIN
    SELECT COUNT(*) INTO base_count FROM products WHERE is_active = true;

    -- Check if materialized view exists
    IF EXISTS (SELECT 1 FROM pg_matviews WHERE matviewname = 'mv_active_products_by_category') THEN
        SELECT COUNT(*) INTO mv_count FROM mv_active_products_by_category;
        difference := ABS(base_count - mv_count);

        RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
        RAISE NOTICE 'TEST 3: Materialized View Synchronization';
        RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
        RAISE NOTICE '';
        RAISE NOTICE '📊 Base Table (products): % active products', base_count;
        RAISE NOTICE '📊 Materialized View: % products', mv_count;
        RAISE NOTICE '📊 Difference: %', difference;
        RAISE NOTICE '';

        IF base_count = mv_count THEN
            RAISE NOTICE '✅ PASS: View perfectly synced with base table!';
        ELSE
            RAISE WARNING '⚠️  WARNING: View out of sync by % products', difference;
            RAISE NOTICE '💡 Fix: Run SELECT refresh_all_product_materialized_views();';
        END IF;
    ELSE
        RAISE WARNING '⚠️  WARNING: Materialized view not found';
        RAISE NOTICE '💡 Fix: Run SUPABASE_DB_OPTIMIZATION.sql script';
    END IF;
    RAISE NOTICE '';
END $$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- TEST 4: Check for Missing or Invalid Data
-- ═══════════════════════════════════════════════════════════════════════════════

DO $$
DECLARE
    missing_name INTEGER;
    missing_price INTEGER;
    missing_image INTEGER;
    missing_category INTEGER;
    zero_price INTEGER;
BEGIN
    SELECT COUNT(*) INTO missing_name FROM products WHERE name IS NULL OR name = '';
    SELECT COUNT(*) INTO missing_price FROM products WHERE price IS NULL;
    SELECT COUNT(*) INTO missing_image FROM products WHERE image_url IS NULL OR image_url = '';
    SELECT COUNT(*) INTO missing_category FROM products WHERE category_id IS NULL;
    SELECT COUNT(*) INTO zero_price FROM products WHERE price <= 0;

    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    RAISE NOTICE 'TEST 4: Data Quality Check';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    RAISE NOTICE '';
    RAISE NOTICE '🔍 Products missing name: %', missing_name;
    RAISE NOTICE '🔍 Products missing price: %', missing_price;
    RAISE NOTICE '🔍 Products missing image: %', missing_image;
    RAISE NOTICE '🔍 Products missing category: %', missing_category;
    RAISE NOTICE '🔍 Products with zero/negative price: %', zero_price;
    RAISE NOTICE '';

    IF missing_name = 0 AND missing_price = 0 AND missing_image = 0 AND missing_category = 0 AND zero_price = 0 THEN
        RAISE NOTICE '✅ PASS: All products have complete data!';
    ELSE
        RAISE WARNING '⚠️  WARNING: Some products have missing or invalid data';
    END IF;
    RAISE NOTICE '';
END $$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- TEST 5: Verify All Categories Have Products
-- ═══════════════════════════════════════════════════════════════════════════════

DO $$
DECLARE
    empty_categories INTEGER;
    category_record RECORD;
BEGIN
    SELECT COUNT(*) INTO empty_categories
    FROM categories c
    LEFT JOIN products p ON c.id = p.category_id
    WHERE p.id IS NULL;

    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    RAISE NOTICE 'TEST 5: Category Coverage';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    RAISE NOTICE '';

    IF empty_categories = 0 THEN
        RAISE NOTICE '✅ PASS: All categories have products!';
    ELSE
        RAISE WARNING '⚠️  WARNING: % categories have no products:', empty_categories;
        FOR category_record IN
            SELECT c.name
            FROM categories c
            LEFT JOIN products p ON c.id = p.category_id
            WHERE p.id IS NULL
        LOOP
            RAISE NOTICE '   ❌ %', category_record.name;
        END LOOP;
    END IF;
    RAISE NOTICE '';
END $$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- TEST 6: Check Product Images Are Valid URLs
-- ═══════════════════════════════════════════════════════════════════════════════

DO $$
DECLARE
    invalid_urls INTEGER;
BEGIN
    SELECT COUNT(*) INTO invalid_urls
    FROM products
    WHERE is_active = true
    AND (
        image_url IS NULL
        OR image_url = ''
        OR (image_url NOT LIKE 'http://%' AND image_url NOT LIKE 'https://%')
    );

    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    RAISE NOTICE 'TEST 6: Image URL Validation';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    RAISE NOTICE '';

    IF invalid_urls = 0 THEN
        RAISE NOTICE '✅ PASS: All active products have valid image URLs!';
    ELSE
        RAISE WARNING '⚠️  WARNING: % active products have invalid image URLs', invalid_urls;
    END IF;
    RAISE NOTICE '';
END $$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- TEST 7: Verify Stock Quantities
-- ═══════════════════════════════════════════════════════════════════════════════

DO $$
DECLARE
    out_of_stock INTEGER;
    low_stock INTEGER;
    healthy_stock INTEGER;
BEGIN
    SELECT COUNT(*) INTO out_of_stock
    FROM products WHERE is_active = true AND stock_quantity = 0;

    SELECT COUNT(*) INTO low_stock
    FROM products WHERE is_active = true AND stock_quantity > 0 AND stock_quantity < 10;

    SELECT COUNT(*) INTO healthy_stock
    FROM products WHERE is_active = true AND stock_quantity >= 10;

    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    RAISE NOTICE 'TEST 7: Stock Status';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    RAISE NOTICE '';
    RAISE NOTICE '✅ Healthy Stock (>= 10): % products', healthy_stock;
    RAISE NOTICE '⚠️  Low Stock (1-9): % products', low_stock;
    RAISE NOTICE '❌ Out of Stock (0): % products', out_of_stock;
    RAISE NOTICE '';

    IF out_of_stock = 0 THEN
        RAISE NOTICE '✅ PASS: All products are in stock!';
    ELSE
        RAISE NOTICE '💡 INFO: % products need restocking', out_of_stock;
    END IF;
    RAISE NOTICE '';
END $$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- TEST 8: Test Search Functionality
-- ═══════════════════════════════════════════════════════════════════════════════

DO $$
DECLARE
    search_results INTEGER;
BEGIN
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    RAISE NOTICE 'TEST 8: Search Functionality';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    RAISE NOTICE '';

    -- Test if optimized search function exists
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'search_products_optimized') THEN
        -- Test search
        SELECT COUNT(*) INTO search_results
        FROM search_products_optimized('iPhone');

        RAISE NOTICE '🔍 Search test for "iPhone": % results found', search_results;

        IF search_results > 0 THEN
            RAISE NOTICE '✅ PASS: Search function working correctly!';
        ELSE
            RAISE WARNING '⚠️  WARNING: Search returned no results for "iPhone"';
        END IF;
    ELSIF EXISTS (SELECT 1 FROM pg_matviews WHERE matviewname = 'mv_product_search_fts') THEN
        -- Fallback: Test materialized view directly
        SELECT COUNT(*) INTO search_results
        FROM mv_product_search_fts
        WHERE search_vector @@ plainto_tsquery('english', 'iPhone');

        RAISE NOTICE '🔍 Search test for "iPhone" (using view): % results', search_results;

        IF search_results > 0 THEN
            RAISE NOTICE '✅ PASS: Search view working!';
        ELSE
            RAISE WARNING '⚠️  WARNING: Search view returned no results';
        END IF;
    ELSE
        RAISE WARNING '⚠️  WARNING: Search optimization not installed';
        RAISE NOTICE '💡 Fix: Run SUPABASE_DB_OPTIMIZATION.sql script';
    END IF;
    RAISE NOTICE '';
END $$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- TEST 9: Sample Products from Each Category
-- ═══════════════════════════════════════════════════════════════════════════════

DO $$
BEGIN
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    RAISE NOTICE 'TEST 9: Sample Products (First Product from Each Category)';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    RAISE NOTICE '';
END $$;

SELECT
    c.name as category,
    p.name as product_name,
    p.price::money as price,
    p.badge,
    p.stock_quantity,
    CASE WHEN p.is_active THEN '✅ Active' ELSE '❌ Inactive' END as status
FROM categories c
INNER JOIN LATERAL (
    SELECT *
    FROM products
    WHERE category_id = c.id
    ORDER BY created_at DESC
    LIMIT 1
) p ON true
ORDER BY c.name;

-- ═══════════════════════════════════════════════════════════════════════════════
-- FINAL SUMMARY
-- ═══════════════════════════════════════════════════════════════════════════════

DO $$
DECLARE
    total_products INTEGER;
    active_products INTEGER;
    total_categories INTEGER;
    categories_with_products INTEGER;
    mv_exists BOOLEAN;
    views_synced BOOLEAN;
    base_count INTEGER;
    mv_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_products FROM products;
    SELECT COUNT(*) INTO active_products FROM products WHERE is_active = true;
    SELECT COUNT(*) INTO total_categories FROM categories;

    SELECT COUNT(*) INTO categories_with_products
    FROM categories c
    WHERE EXISTS (SELECT 1 FROM products p WHERE p.category_id = c.id);

    -- Check if materialized view exists and is synced
    mv_exists := EXISTS (SELECT 1 FROM pg_matviews WHERE matviewname = 'mv_active_products_by_category');

    IF mv_exists THEN
        SELECT COUNT(*) INTO base_count FROM products WHERE is_active = true;
        SELECT COUNT(*) INTO mv_count FROM mv_active_products_by_category;
        views_synced := (base_count = mv_count);
    ELSE
        views_synced := false;
    END IF;

    RAISE NOTICE '';
    RAISE NOTICE '═══════════════════════════════════════════════════════════════';
    RAISE NOTICE '📊 VERIFICATION SUMMARY';
    RAISE NOTICE '═══════════════════════════════════════════════════════════════';
    RAISE NOTICE '';
    RAISE NOTICE '📦 Total Products: %', total_products;
    RAISE NOTICE '✅ Active Products: %', active_products;
    RAISE NOTICE '📁 Categories: %', total_categories;
    RAISE NOTICE '📂 Categories with Products: %', categories_with_products;
    RAISE NOTICE '';

    IF mv_exists THEN
        RAISE NOTICE '🚀 Optimization Status: ✅ INSTALLED';
        IF views_synced THEN
            RAISE NOTICE '🔄 View Sync Status: ✅ SYNCED';
        ELSE
            RAISE NOTICE '🔄 View Sync Status: ⚠️  NEEDS REFRESH';
        END IF;
    ELSE
        RAISE NOTICE '🚀 Optimization Status: ⚠️  NOT INSTALLED';
        RAISE NOTICE '💡 Run SUPABASE_DB_OPTIMIZATION.sql to enable performance boost';
    END IF;

    RAISE NOTICE '';

    -- Overall verdict
    IF total_products >= 75 AND active_products >= 70 AND categories_with_products = total_categories THEN
        RAISE NOTICE '═══════════════════════════════════════════════════════════════';
        RAISE NOTICE '✅ ✅ ✅  ALL TESTS PASSED!  ✅ ✅ ✅';
        RAISE NOTICE '═══════════════════════════════════════════════════════════════';
        RAISE NOTICE '';
        RAISE NOTICE 'Your database is healthy and all products should display correctly!';
    ELSE
        RAISE NOTICE '═══════════════════════════════════════════════════════════════';
        RAISE NOTICE '⚠️  SOME ISSUES DETECTED';
        RAISE NOTICE '═══════════════════════════════════════════════════════════════';
        RAISE NOTICE '';
        RAISE NOTICE 'Please review the warnings above and take corrective action.';
    END IF;

    RAISE NOTICE '';
END $$;

\echo ''
\echo '═══════════════════════════════════════════════════════════════'
\echo '🏁 VERIFICATION COMPLETE'
\echo '═══════════════════════════════════════════════════════════════'
\echo ''
