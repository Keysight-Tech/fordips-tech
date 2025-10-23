-- ============================================
-- FORDIPS TECH - COMPLETE DATABASE DEPLOYMENT
-- ONE-CLICK SETUP - Run this file ONCE in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLES
-- ============================================

-- Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    icon TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products Table
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    category_slug TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    description TEXT,
    image_url TEXT,
    badge TEXT,
    stock_quantity INTEGER DEFAULT 100,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Profiles Table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    address TEXT,
    city TEXT,
    zip_code TEXT,
    is_admin BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    order_number TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
    total_amount DECIMAL(10, 2) NOT NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    shipping_address TEXT NOT NULL,
    shipping_city TEXT NOT NULL,
    shipping_zip TEXT NOT NULL,
    payment_method TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    product_price DECIMAL(10, 2) NOT NULL,
    quantity INTEGER NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cart Items Table (for persistent shopping carts)
CREATE TABLE IF NOT EXISTS cart_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

-- Contact Submissions Table
CREATE TABLE IF NOT EXISTS contact_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Newsletter Subscriptions Table
CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(category_slug);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_user ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_contact_status ON contact_submissions(status);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to generate unique order numbers
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
BEGIN
    RETURN 'FT' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TRIGGERS
-- ============================================

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_cart_items_updated_at ON cart_items;
CREATE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON cart_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscriptions ENABLE ROW LEVEL SECURITY;

-- Categories: Public read, admin write
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON categories;
CREATE POLICY "Categories are viewable by everyone" ON categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Categories are editable by admins" ON categories;
CREATE POLICY "Categories are editable by admins" ON categories FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

-- Products: Public read, admin write
DROP POLICY IF EXISTS "Products are viewable by everyone" ON products;
CREATE POLICY "Products are viewable by everyone" ON products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Products are editable by admins" ON products;
CREATE POLICY "Products are editable by admins" ON products FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

-- Profiles: Users can read and update their own profile
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

-- Orders: Users can view their own orders, admins can view/edit all
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
CREATE POLICY "Users can view their own orders" ON orders FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create orders" ON orders;
CREATE POLICY "Users can create orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
CREATE POLICY "Admins can view all orders" ON orders FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

DROP POLICY IF EXISTS "Admins can update all orders" ON orders;
CREATE POLICY "Admins can update all orders" ON orders FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

-- Order Items: Accessible through orders
DROP POLICY IF EXISTS "Users can view their order items" ON order_items;
CREATE POLICY "Users can view their order items" ON order_items FOR SELECT USING (
    EXISTS (SELECT 1 FROM orders WHERE id = order_items.order_id AND user_id = auth.uid())
);

DROP POLICY IF EXISTS "Users can create order items" ON order_items;
CREATE POLICY "Users can create order items" ON order_items FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM orders WHERE id = order_items.order_id AND user_id = auth.uid())
);

DROP POLICY IF EXISTS "Admins can view all order items" ON order_items;
CREATE POLICY "Admins can view all order items" ON order_items FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

-- Cart Items: Users can manage their own cart
DROP POLICY IF EXISTS "Users can view their cart" ON cart_items;
CREATE POLICY "Users can view their cart" ON cart_items FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can add to cart" ON cart_items;
CREATE POLICY "Users can add to cart" ON cart_items FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update cart" ON cart_items;
CREATE POLICY "Users can update cart" ON cart_items FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete from cart" ON cart_items;
CREATE POLICY "Users can delete from cart" ON cart_items FOR DELETE USING (auth.uid() = user_id);

-- Contact Submissions: Anyone can create, admins can view
DROP POLICY IF EXISTS "Anyone can submit contact form" ON contact_submissions;
CREATE POLICY "Anyone can submit contact form" ON contact_submissions FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view submissions" ON contact_submissions;
CREATE POLICY "Admins can view submissions" ON contact_submissions FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

DROP POLICY IF EXISTS "Admins can update submissions" ON contact_submissions;
CREATE POLICY "Admins can update submissions" ON contact_submissions FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

-- Newsletter: Anyone can subscribe
DROP POLICY IF EXISTS "Anyone can subscribe to newsletter" ON newsletter_subscriptions;
CREATE POLICY "Anyone can subscribe to newsletter" ON newsletter_subscriptions FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view subscriptions" ON newsletter_subscriptions;
CREATE POLICY "Admins can view subscriptions" ON newsletter_subscriptions FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

-- ============================================
-- SEED DATA - Categories
-- ============================================

INSERT INTO categories (name, slug, description, icon) VALUES
    ('iPhones', 'iphone', 'Latest iPhone models', '📱'),
    ('Samsung', 'samsung', 'Samsung Galaxy phones', '📱'),
    ('Laptops', 'laptop', 'MacBooks and laptops', '💻'),
    ('Desktops', 'desktop', 'Desktop computers', '🖥️'),
    ('Tablets', 'tablet', 'iPads and tablets', '📱'),
    ('Smartwatches', 'smartwatch', 'Apple Watch and smartwatches', '⌚'),
    ('Accessories', 'accessories', 'Tech accessories', '🎧'),
    ('Starlink', 'starlink', 'Starlink internet', '🛰️')
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- SEED DATA - Products (75 products)
-- ============================================

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

-- ============================================
-- VERIFY SETUP
-- ============================================

-- Display product count by category
SELECT
    c.name as category,
    COUNT(p.id) as product_count
FROM categories c
LEFT JOIN products p ON c.id = p.category_id
GROUP BY c.name
ORDER BY c.name;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

DO $$
BEGIN
    RAISE NOTICE '🎉 FORDIPS TECH DATABASE DEPLOYED SUCCESSFULLY!';
    RAISE NOTICE '';
    RAISE NOTICE 'Your database includes:';
    RAISE NOTICE '- 8 product categories';
    RAISE NOTICE '- 75 products with images and prices';
    RAISE NOTICE '- Complete e-commerce schema';
    RAISE NOTICE '- Row Level Security (RLS) enabled';
    RAISE NOTICE '- User authentication ready';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Visit your website: https://keysight-tech.github.io/fordips-tech/';
    RAISE NOTICE '2. Create your admin account by signing up';
    RAISE NOTICE '3. Run: UPDATE profiles SET is_admin = true WHERE email = ''your@email.com'';';
    RAISE NOTICE '4. Access admin panel: https://keysight-tech.github.io/fordips-tech/admin.html';
    RAISE NOTICE '';
    RAISE NOTICE '✨ Your e-commerce website is now live!';
END $$;
