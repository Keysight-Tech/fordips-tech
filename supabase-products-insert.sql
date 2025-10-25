-- =====================================================
-- FORDIPS TECH - Product Catalog SQL Insert Script
-- Run this script in Supabase SQL Editor
-- =====================================================

-- Insert Products into the products table
INSERT INTO products (name, price, category, description, image_url, stock, featured, rating) VALUES

-- ===== SMARTPHONES =====
('iPhone 17 Pro Max', 1299.99, 'Smartphones', 'The most advanced iPhone ever. Featuring titanium design, A18 Pro chip, and revolutionary camera system with 5x optical zoom.', 'https://loutcbvftzojsioahtdw.supabase.co/storage/v1/object/public/images/17%20promax.webp', 50, true, 4.9),

('iPhone 17 Pro Max Silver', 1299.99, 'Smartphones', 'Elegance redefined in titanium silver. The ultimate iPhone with cutting-edge performance and stunning design.', 'https://loutcbvftzojsioahtdw.supabase.co/storage/v1/object/public/images/silver-hero-17pm.webp', 45, true, 4.9),

('iPhone 15 Pro', 999.99, 'Smartphones', 'Titanium design meets powerful A17 Pro chip. ProMotion display with Always-On. Advanced camera system with 3x optical zoom.', 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&q=95', 60, true, 4.8),

('Samsung Galaxy S24 Ultra', 1199.99, 'Smartphones', 'Galaxy AI is here. 200MP camera, S Pen included, titanium frame, and the most powerful Galaxy phone ever made.', 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&q=95', 40, true, 4.7),

('Google Pixel 8 Pro', 899.99, 'Smartphones', 'Google AI at its best. Exceptional camera with Magic Eraser, Temperature sensor, and pure Android experience.', 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&q=95', 35, false, 4.6),

('OnePlus 12', 799.99, 'Smartphones', 'Never Settle. Snapdragon 8 Gen 3, Hasselblad camera, 100W fast charging. Flagship killer at an amazing price.', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=95', 30, false, 4.5),

-- ===== LAPTOPS & COMPUTERS =====
('MacBook Pro M3 16"', 2499.99, 'Laptops', 'Mind-blowing. Head-turning. Pro performance. M3 Max chip with up to 40-core GPU. Up to 22 hours battery life.', 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=95', 25, true, 4.9),

('MacBook Air M3 15"', 1499.99, 'Laptops', 'Impressively big. Impossibly thin. The worlds best 15-inch laptop with M3 chip and all-day battery life.', 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&q=95', 40, true, 4.8),

('Dell XPS 15', 1899.99, 'Laptops', 'Ultra-performance laptop. Intel Core i9, NVIDIA RTX 4070, stunning OLED display. Perfect for creators and developers.', 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&q=95', 20, false, 4.7),

('Microsoft Surface Laptop Studio 2', 1999.99, 'Laptops', 'The most powerful Surface laptop. Pull forward into Stage mode. Intel Core i7, RTX 4050, dynamic woven hinge.', 'https://images.unsplash.com/photo-1587614382346-4ec70e388b28?w=800&q=95', 15, false, 4.6),

('Lenovo ThinkPad X1 Carbon Gen 11', 1699.99, 'Laptops', 'Business laptop perfected. Ultra-lightweight carbon fiber, 13th Gen Intel, military-grade durability.', 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&q=95', 30, false, 4.7),

('ASUS ROG Zephyrus G16', 2299.99, 'Laptops', 'Gaming powerhouse. RTX 4080, Intel Core i9, ROG Nebula Display. Slim design, massive performance.', 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&q=95', 18, false, 4.8),

-- ===== TABLETS =====
('iPad Pro 13" M4', 1299.99, 'Tablets', 'The ultimate iPad experience. M4 chip, Ultra Retina XDR display, works with Apple Pencil Pro and Magic Keyboard.', 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&q=95', 35, true, 4.9),

('iPad Air 11" M2', 599.99, 'Tablets', 'Serious performance in a light design. M2 chip, Liquid Retina display, works with Magic Keyboard and Apple Pencil.', 'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800&q=95', 50, false, 4.7),

('Samsung Galaxy Tab S9 Ultra', 1199.99, 'Tablets', 'Epic entertainment. 14.6" Dynamic AMOLED display, S Pen included, DeX mode for desktop productivity.', 'https://images.unsplash.com/photo-1567581935884-3349723552ca?w=800&q=95', 25, false, 4.6),

-- ===== CAMERAS & PHOTOGRAPHY =====
('Canon EOS R5', 3899.99, 'Cameras', 'Professional mirrorless camera. 45MP sensor, 8K video, In-Body Image Stabilization. The ultimate creative tool.', 'https://loutcbvftzojsioahtdw.supabase.co/storage/v1/object/public/images/canon.jpg', 12, true, 4.9),

('Sony A7 IV', 2499.99, 'Cameras', 'Hybrid excellence. 33MP sensor, 4K 60p video, advanced autofocus. Perfect for photo and video creators.', 'https://images.unsplash.com/photo-1606980707375-681c324b2e03?w=800&q=95', 15, true, 4.8),

('Nikon Z8', 3999.99, 'Cameras', 'Flagship performance. 45.7MP stacked sensor, 8K video, blackout-free shooting at 20fps. Professional powerhouse.', 'https://images.unsplash.com/photo-1606991806838-eaa7a8e3f0d2?w=800&q=95', 10, false, 4.9),

('DJI Mavic 3 Pro', 2199.99, 'Cameras', 'Flagship imaging drone. Triple-camera system with Hasselblad, 43-min flight time, omnidirectional obstacle sensing.', 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=800&q=95', 20, true, 4.7),

('GoPro HERO 12 Black', 399.99, 'Cameras', 'Action camera perfected. 5.3K video, HyperSmooth 6.0 stabilization, waterproof to 33ft. Capture anything.', 'https://images.unsplash.com/photo-1585396135542-a61c2b3c6619?w=800&q=95', 40, false, 4.6),

-- ===== SMARTWATCHES & WEARABLES =====
('Apple Watch Series 9', 399.99, 'Wearables', 'Advanced health and fitness tracking. S9 chip, double tap gesture, always-on Retina display. Stay connected.', 'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=800&q=95', 60, true, 4.8),

('Apple Watch Ultra 2', 799.99, 'Wearables', 'The most rugged and capable Apple Watch. 49mm titanium case, Action button, 100m water resistance, precision GPS.', 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&q=95', 30, true, 4.9),

('Samsung Galaxy Watch 6 Classic', 349.99, 'Wearables', 'Premium smartwatch with rotating bezel. Comprehensive health tracking, Wear OS, sapphire crystal display.', 'https://images.unsplash.com/photo-1557438159-51eec7a6c9e8?w=800&q=95', 45, false, 4.5),

('Garmin Fenix 7X Sapphire Solar', 899.99, 'Wearables', 'Ultimate multisport GPS watch. Solar charging, topographic maps, advanced training metrics. Built for adventure.', 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&q=95', 22, false, 4.7),

-- ===== HEADPHONES & AUDIO =====
('AirPods Pro 2nd Gen', 249.99, 'Audio', 'Intelligent noise cancellation. Adaptive transparency. Personalized spatial audio. Up to 6 hours listening time.', 'https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=800&q=95', 100, true, 4.8),

('AirPods Max', 549.99, 'Audio', 'Computational audio. Breathtaking sound. Active Noise Cancellation. 20 hours of listening time.', 'https://images.unsplash.com/photo-1625298230755-0695832f38f8?w=800&q=95', 35, true, 4.7),

('Sony WH-1000XM5', 399.99, 'Audio', 'Industry-leading noise cancellation. Premium sound quality with LDAC. 30-hour battery life. Ultimate comfort.', 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800&q=95', 50, true, 4.8),

('Bose QuietComfort Ultra', 429.99, 'Audio', 'World-class noise cancellation. Spatial audio. CustomTune technology. Luxurious comfort for all-day wear.', 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&q=95', 40, false, 4.6),

('Beats Studio Pro', 349.99, 'Audio', 'Lossless audio via USB-C. Personalized spatial audio. Premium active noise cancelling. 40 hours battery life.', 'https://images.unsplash.com/photo-1577174881658-0f30157f72c4?w=800&q=95', 45, false, 4.5),

-- ===== INTERNET & CONNECTIVITY =====
('Starlink Standard Kit', 599.99, 'Internet', 'High-speed, low-latency internet anywhere on Earth. 50-200 Mbps download speeds. Easy self-installation.', 'https://loutcbvftzojsioahtdw.supabase.co/storage/v1/object/public/images/starlink.png', 25, true, 4.7),

('Starlink Business Kit', 2500.00, 'Internet', 'Priority network access. 150-500 Mbps speeds. 24/7 support. Perfect for businesses and high-demand users.', 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&q=95', 10, false, 4.8),

('UniFi Dream Machine Pro', 379.99, 'Networking', 'All-in-one enterprise networking. Router, switch, security gateway. Manage everything from UniFi console.', 'https://images.unsplash.com/photo-1606904825846-647eb07f5be2?w=800&q=95', 30, false, 4.6),

-- ===== GAMING CONSOLES =====
('PlayStation 5', 499.99, 'Gaming', 'Next-gen gaming console. Ultra-high-speed SSD, ray tracing, 4K gaming up to 120fps. Stunning immersion.', 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800&q=95', 35, true, 4.8),

('Xbox Series X', 499.99, 'Gaming', 'The fastest, most powerful Xbox ever. 4K gaming at 120fps, quick resume, Game Pass ultimate experience.', 'https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=800&q=95', 40, true, 4.7),

('Nintendo Switch OLED', 349.99, 'Gaming', 'Play at home or on the go. Vibrant 7-inch OLED screen, enhanced audio, 64GB internal storage.', 'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=800&q=95', 55, false, 4.6),

-- ===== MONITORS & DISPLAYS =====
('Apple Studio Display', 1599.99, 'Monitors', '27-inch 5K Retina display. 600 nits brightness, P3 wide color, True Tone. Built-in camera and speakers.', 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=95', 20, false, 4.7),

('LG UltraGear 27" 4K Gaming Monitor', 799.99, 'Monitors', '144Hz refresh rate, 1ms response time, NVIDIA G-SYNC compatible. HDR 400, stunning visuals.', 'https://images.unsplash.com/photo-1585792180666-f7347c490ee2?w=800&q=95', 28, false, 4.6),

('Samsung Odyssey G9', 1399.99, 'Monitors', '49-inch super ultra-wide curved gaming monitor. 240Hz, QLED, 1000R curvature. Ultimate immersion.', 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&q=95', 15, false, 4.8),

-- ===== SMART HOME =====
('HomePod', 299.99, 'Smart Home', 'Immersive high-fidelity audio. Siri intelligence. Works seamlessly with Apple devices. Room-filling sound.', 'https://images.unsplash.com/photo-1543512214-318c7553f230?w=800&q=95', 50, false, 4.5),

('Amazon Echo Studio', 199.99, 'Smart Home', 'High-fidelity smart speaker. Spatial audio processing, Alexa built-in, works with smart home devices.', 'https://images.unsplash.com/photo-1518444065439-e933c06ce9cd?w=800&q=95', 60, false, 4.4),

('Google Nest Hub Max', 229.99, 'Smart Home', '10-inch smart display. Video calling, smart home control, Google Assistant. Entertainment hub.', 'https://images.unsplash.com/photo-1558089687-f282ffcbc126?w=800&q=95', 45, false, 4.5),

-- ===== ACCESSORIES =====
('Magic Keyboard for iPad Pro', 349.99, 'Accessories', 'Amazing typing experience. Trackpad precision. Floating design. Backlit keys. USB-C pass-through charging.', 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=95', 40, false, 4.6),

('Apple Pencil Pro', 129.99, 'Accessories', 'Pixel-perfect precision. Tilt and pressure sensitivity. Double-tap to switch tools. Wireless charging and pairing.', 'https://images.unsplash.com/photo-1611532736579-6b16e2b50449?w=800&q=95', 80, false, 4.7),

('Logitech MX Master 3S', 99.99, 'Accessories', 'Ultimate productivity mouse. MagSpeed scroll wheel, 8K DPI sensor, multi-device connectivity. Ergonomic design.', 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&q=95', 70, false, 4.7),

('Anker 747 PowerBank', 149.99, 'Accessories', '25,600mAh capacity. 140W USB-C output. Charge MacBook Pro to 50% in 30 minutes. Smart display.', 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=800&q=95', 50, false, 4.6),

('SanDisk Extreme Pro 2TB SSD', 299.99, 'Accessories', 'Portable storage powerhouse. 2000MB/s read speeds. Rugged, water and dust resistant. USB-C connectivity.', 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800&q=95', 35, false, 4.7);

-- =====================================================
-- VERIFICATION QUERY
-- Run this after inserting to verify products were added
-- =====================================================
-- SELECT COUNT(*) as total_products FROM products;
-- SELECT category, COUNT(*) as count FROM products GROUP BY category ORDER BY count DESC;
