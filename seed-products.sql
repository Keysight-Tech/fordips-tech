-- ============================================
-- FORDIPS TECH - Products Seed Data (75 products)
-- Run this after supabase-migration.sql
-- ============================================

-- Get category IDs for reference
DO $$
DECLARE
    cat_iphone UUID;
    cat_samsung UUID;
    cat_laptop UUID;
    cat_desktop UUID;
    cat_tablet UUID;
    cat_smartwatch UUID;
    cat_starlink UUID;
BEGIN
    SELECT id INTO cat_iphone FROM categories WHERE slug = 'iphone';
    SELECT id INTO cat_samsung FROM categories WHERE slug = 'samsung';
    SELECT id INTO cat_laptop FROM categories WHERE slug = 'laptop';
    SELECT id INTO cat_desktop FROM categories WHERE slug = 'desktop';
    SELECT id INTO cat_tablet FROM categories WHERE slug = 'tablet';
    SELECT id INTO cat_smartwatch FROM categories WHERE slug = 'smartwatch';
    SELECT id INTO cat_starlink FROM categories WHERE slug = 'starlink';

-- Insert all products
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

    -- Desktops
    (cat_desktop, 'iMac 24" M3', 'desktop', 1299, 'Colorful design, 4.5K display', 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&q=80', 'NEW', 100, true),
    (cat_desktop, 'Mac Mini M2', 'desktop', 599, 'Small but mighty desktop', 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80', 'COMPACT', 100, true),
    (cat_desktop, 'Mac Mini M2 Pro', 'desktop', 1299, 'Pro performance in compact form', 'https://images.unsplash.com/photo-1593642532973-d31b6557fa68?w=800&q=80', NULL, 100, true),
    (cat_desktop, 'Mac Pro', 'desktop', 6999, 'Maximum expansion and performance', 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=800&q=80', 'ULTIMATE', 100, true),

    -- Tablets
    (cat_tablet, 'iPad 10th Gen', 'tablet', 449, 'Perfect for everyday tasks', 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&q=80', 'VALUE', 100, true),
    (cat_tablet, 'iPad Air 11"', 'tablet', 599, 'Powerful M1 chip, stunning display', 'https://images.unsplash.com/photo-1585790050230-5dd28404f5ba?w=800&q=80', NULL, 100, true),
    (cat_tablet, 'iPad Pro 11"', 'tablet', 799, 'M2 chip, ProMotion display', 'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800&q=80', 'PRO', 100, true),
    (cat_tablet, 'iPad Pro 12.9"', 'tablet', 1099, 'Liquid Retina XDR, ultimate iPad', 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&q=80', 'PRO', 100, true),
    (cat_tablet, 'iPad Mini', 'tablet', 499, 'Small size, big capabilities', 'https://images.unsplash.com/photo-1585790050230-5dd28404f5ba?w=800&q=80', 'COMPACT', 100, true),

    -- Smartwatches
    (cat_smartwatch, 'Apple Watch Series 1', 'smartwatch', 199, 'Entry-level fitness tracking', 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&q=80', NULL, 100, true),
    (cat_smartwatch, 'Apple Watch Series 2', 'smartwatch', 249, 'Water resistant, GPS', 'https://images.unsplash.com/photo-1551816230-ef5deaed4a26?w=800&q=80', NULL, 100, true),
    (cat_smartwatch, 'Apple Watch Series 3', 'smartwatch', 299, 'Cellular connectivity option', 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=800&q=80', NULL, 100, true),
    (cat_smartwatch, 'Apple Watch SE', 'smartwatch', 249, 'Essential features, great price', 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&q=80', 'VALUE', 100, true),
    (cat_smartwatch, 'Apple Watch Series 9', 'smartwatch', 399, 'Latest features, S9 chip', 'https://images.unsplash.com/photo-1551816230-ef5deaed4a26?w=800&q=80', 'NEW', 100, true),

    -- Samsung
    (cat_samsung, 'Samsung Galaxy S24 Ultra', 'samsung', 1199, 'Flagship power, S Pen included', 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&q=80', 'NEW', 100, true),
    (cat_samsung, 'Samsung Galaxy S24+', 'samsung', 999, 'Premium display, great cameras', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80', NULL, 100, true),
    (cat_samsung, 'Samsung Galaxy S24', 'samsung', 799, 'Compact flagship performance', 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=800&q=80', NULL, 100, true),
    (cat_samsung, 'Samsung Galaxy S23 FE', 'samsung', 599, 'Fan Edition, great value', 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&q=80', 'VALUE', 100, true),
    (cat_samsung, 'Samsung Galaxy Z Fold 5', 'samsung', 1799, 'Ultimate multitasking device', 'https://images.unsplash.com/photo-1591122947157-26bad3a117d2?w=800&q=80', 'FOLDABLE', 100, true),
    (cat_samsung, 'Samsung Galaxy Z Flip 5', 'samsung', 999, 'Compact flip phone design', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80', 'FOLDABLE', 100, true),
    (cat_samsung, 'Samsung Galaxy A54 5G', 'samsung', 449, 'Mid-range with great features', 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=800&q=80', 'POPULAR', 100, true),
    (cat_samsung, 'Samsung Galaxy A34 5G', 'samsung', 349, 'Affordable 5G smartphone', 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&q=80', NULL, 100, true),
    (cat_samsung, 'Samsung Galaxy Note 20 Ultra', 'samsung', 899, 'Premium Note with S Pen', 'https://images.unsplash.com/photo-1591122947157-26bad3a117d2?w=800&q=80', NULL, 100, true),

    -- Starlink
    (cat_starlink, 'Starlink Internet Kit', 'starlink', 599, 'Complete satellite internet system', 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&q=80', 'COMPLETE', 100, true),
    (cat_starlink, 'Starlink Router', 'starlink', 199, 'High-performance WiFi 6 router', 'https://images.unsplash.com/photo-1606904825846-647eb07f5be2?w=800&q=80', NULL, 100, true),
    (cat_starlink, 'Starlink Dish (Satellite Antenna)', 'starlink', 499, 'Phased array satellite dish', 'https://images.unsplash.com/photo-1614624532983-4ce03382d63d?w=800&q=80', NULL, 100, true),
    (cat_starlink, 'Starlink Accessories Kit', 'starlink', 149, 'Cables, mounts, power supplies', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80', NULL, 100, true),
    (cat_starlink, 'Starlink Ethernet Adapter', 'starlink', 49, 'Wired connection adapter', 'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=800&q=80', NULL, 100, true),
    (cat_starlink, 'Starlink Pole Mount', 'starlink', 99, 'Professional mounting solution', 'https://images.unsplash.com/photo-1621905252472-119e265d1b12?w=800&q=80', NULL, 100, true)
ON CONFLICT DO NOTHING;

    RAISE NOTICE '✅ Successfully inserted 75 products!';
END$$;

-- Display product count by category
SELECT
    c.name as category,
    COUNT(p.id) as product_count
FROM categories c
LEFT JOIN products p ON c.id = p.category_id
GROUP BY c.name
ORDER BY c.name;
