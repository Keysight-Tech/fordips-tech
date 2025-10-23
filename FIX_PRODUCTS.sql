-- ============================================
-- FORDIPS TECH - DIAGNOSTIC & FIX SCRIPT
-- Run this in Supabase SQL Editor to diagnose and fix product issues
-- ============================================

-- Step 1: Check if products exist
DO $$
DECLARE
    product_count INTEGER;
    category_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO product_count FROM products;
    SELECT COUNT(*) INTO category_count FROM categories;

    RAISE NOTICE '===========================================';
    RAISE NOTICE 'DIAGNOSTIC RESULTS:';
    RAISE NOTICE '===========================================';
    RAISE NOTICE 'Categories found: %', category_count;
    RAISE NOTICE 'Products found: %', product_count;
    RAISE NOTICE '';

    IF category_count = 0 THEN
        RAISE NOTICE '❌ ERROR: No categories found!';
        RAISE NOTICE 'Solution: Categories need to be inserted first.';
    ELSE
        RAISE NOTICE '✅ Categories OK';
    END IF;

    IF product_count = 0 THEN
        RAISE NOTICE '❌ ERROR: No products found!';
        RAISE NOTICE 'Solution: Products need to be inserted.';
    ELSE
        RAISE NOTICE '✅ Products OK';
    END IF;
    RAISE NOTICE '===========================================';
END $$;

-- Step 2: Show sample products (if any)
SELECT
    p.name,
    p.category_slug,
    p.price,
    p.is_active,
    c.name as category_name
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
LIMIT 5;

-- Step 3: Check RLS policies on products table
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'products';

-- Step 4: Fix RLS policies if needed
-- Drop existing policies
DROP POLICY IF EXISTS "Products are viewable by everyone" ON products;
DROP POLICY IF EXISTS "Products are editable by admins" ON products;

-- Recreate with correct permissions
CREATE POLICY "Products are viewable by everyone"
ON products FOR SELECT
USING (true);

CREATE POLICY "Products are editable by admins"
ON products FOR ALL
USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

-- Step 5: Verify RLS is enabled but allows SELECT for everyone
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Step 6: Final verification
DO $$
DECLARE
    product_count INTEGER;
    active_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO product_count FROM products;
    SELECT COUNT(*) INTO active_count FROM products WHERE is_active = true;

    RAISE NOTICE '';
    RAISE NOTICE '===========================================';
    RAISE NOTICE 'FINAL STATUS:';
    RAISE NOTICE '===========================================';
    RAISE NOTICE 'Total products: %', product_count;
    RAISE NOTICE 'Active products: %', active_count;

    IF product_count = 0 THEN
        RAISE NOTICE '';
        RAISE NOTICE '⚠️  NO PRODUCTS FOUND - INSERTING NOW...';
    ELSE
        RAISE NOTICE '✅ Products table is ready!';
        RAISE NOTICE '✅ RLS policies updated!';
        RAISE NOTICE '';
        RAISE NOTICE 'If products still don''t show on website:';
        RAISE NOTICE '1. Check browser console (F12) for errors';
        RAISE NOTICE '2. Verify Supabase URL in supabase-integration.js';
        RAISE NOTICE '3. Clear browser cache and refresh';
    END IF;
    RAISE NOTICE '===========================================';
END $$;

-- Step 7: If no products, insert them now
DO $$
DECLARE
    product_count INTEGER;
    cat_iphone UUID;
    cat_samsung UUID;
    cat_laptop UUID;
    cat_desktop UUID;
    cat_tablet UUID;
    cat_smartwatch UUID;
    cat_starlink UUID;
BEGIN
    SELECT COUNT(*) INTO product_count FROM products;

    IF product_count = 0 THEN
        RAISE NOTICE 'Inserting products...';

        -- Get category IDs
        SELECT id INTO cat_iphone FROM categories WHERE slug = 'iphone';
        SELECT id INTO cat_samsung FROM categories WHERE slug = 'samsung';
        SELECT id INTO cat_laptop FROM categories WHERE slug = 'laptop';
        SELECT id INTO cat_desktop FROM categories WHERE slug = 'desktop';
        SELECT id INTO cat_tablet FROM categories WHERE slug = 'tablet';
        SELECT id INTO cat_smartwatch FROM categories WHERE slug = 'smartwatch';
        SELECT id INTO cat_starlink FROM categories WHERE slug = 'starlink';

        -- Insert products
        INSERT INTO products (category_id, name, category_slug, price, description, image_url, badge, stock_quantity, is_active) VALUES
            -- iPhones
            (cat_iphone, 'iPhone 6', 'iphone', 199, 'Classic design, still reliable', 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&q=80', NULL, 100, true),
            (cat_iphone, 'iPhone 6s', 'iphone', 249, '3D Touch, improved camera', 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=800&q=80', NULL, 100, true),
            (cat_iphone, 'iPhone 7', 'iphone', 299, 'Water resistant, no headphone jack', 'https://images.unsplash.com/photo-1605236453806-6ff36851218e?w=800&q=80', NULL, 100, true),
            (cat_iphone, 'iPhone 7 Plus', 'iphone', 349, 'Dual camera, larger display', 'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=800&q=80', NULL, 100, true),
            (cat_iphone, 'iPhone SE', 'iphone', 429, 'Compact powerhouse, A15 Bionic', 'https://images.unsplash.com/photo-1592286927505-24b683486e36?w=800&q=80', 'VALUE', 100, true),
            (cat_iphone, 'iPhone 8', 'iphone', 449, 'Wireless charging, glass back', 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&q=80', NULL, 100, true),
            (cat_iphone, 'iPhone 8 Plus', 'iphone', 549, 'Larger screen, portrait mode', 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=800&q=80', NULL, 100, true),

            -- Laptops
            (cat_laptop, 'MacBook Air 13" M1', 'laptop', 999, 'Lightweight, all-day battery', 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&q=80', 'POPULAR', 100, true),
            (cat_laptop, 'MacBook Air 15" M2', 'laptop', 1299, 'Bigger screen, fanless design', 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800&q=80', NULL, 100, true),
            (cat_laptop, 'MacBook Pro 13" M2', 'laptop', 1499, 'Touch Bar, powerful performance', 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&q=80', NULL, 100, true),
            (cat_laptop, 'MacBook Pro 14" M3 Pro', 'laptop', 1999, 'Liquid Retina XDR display', 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80', 'PRO', 100, true),
            (cat_laptop, 'MacBook Pro 16" M3 Max', 'laptop', 3499, 'Ultimate power for professionals', 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&q=80', 'PRO', 100, true),

            -- Samsung
            (cat_samsung, 'Samsung Galaxy S24 Ultra', 'samsung', 1199, 'Flagship power, S Pen included', 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&q=80', 'NEW', 100, true),
            (cat_samsung, 'Samsung Galaxy S24+', 'samsung', 999, 'Premium display, great cameras', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80', NULL, 100, true),
            (cat_samsung, 'Samsung Galaxy S24', 'samsung', 799, 'Compact flagship performance', 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=800&q=80', NULL, 100, true),
            (cat_samsung, 'Samsung Galaxy S23 FE', 'samsung', 599, 'Fan Edition, great value', 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&q=80', 'VALUE', 100, true),
            (cat_samsung, 'Samsung Galaxy Z Fold 5', 'samsung', 1799, 'Ultimate multitasking device', 'https://images.unsplash.com/photo-1591122947157-26bad3a117d2?w=800&q=80', 'FOLDABLE', 100, true)
        ON CONFLICT DO NOTHING;

        RAISE NOTICE '✅ Products inserted successfully!';
    END IF;
END $$;

-- Final check
SELECT
    'Products ready!' as status,
    COUNT(*) as total_products,
    COUNT(*) FILTER (WHERE is_active = true) as active_products
FROM products;
