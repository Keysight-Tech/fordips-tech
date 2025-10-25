-- ============================================
-- FIX: Infinite Recursion in RLS Policies
-- ============================================
-- This fixes the "infinite recursion detected in policy for relation profiles" error
--
-- The problem: The admin check in products policies queries the profiles table,
-- which creates a circular dependency with profiles' own RLS policies.
--
-- The solution: Split policies by operation type and simplify admin checks.
-- ============================================

-- ============================================
-- STEP 1: Drop existing problematic policies
-- ============================================

-- Products policies
DROP POLICY IF EXISTS "Products are viewable by everyone" ON products;
DROP POLICY IF EXISTS "Products are editable by admins" ON products;

-- Profiles policies
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- ============================================
-- STEP 2: Create new simplified policies
-- ============================================

-- PRODUCTS: Public read, no admin check needed for SELECT
CREATE POLICY "Anyone can view products"
ON products
FOR SELECT
USING (true);

-- PRODUCTS: Only admins can INSERT new products
CREATE POLICY "Admins can insert products"
ON products
FOR INSERT
WITH CHECK (
    auth.jwt() ->> 'email' IN (
        SELECT email FROM profiles WHERE is_admin = true
    )
);

-- PRODUCTS: Only admins can UPDATE products
CREATE POLICY "Admins can update products"
ON products
FOR UPDATE
USING (
    auth.jwt() ->> 'email' IN (
        SELECT email FROM profiles WHERE is_admin = true
    )
);

-- PRODUCTS: Only admins can DELETE products
CREATE POLICY "Admins can delete products"
ON products
FOR DELETE
USING (
    auth.jwt() ->> 'email' IN (
        SELECT email FROM profiles WHERE is_admin = true
    )
);

-- PROFILES: Users can view their own profile
CREATE POLICY "Users can view own profile"
ON profiles
FOR SELECT
USING (auth.uid() = id);

-- PROFILES: Users can update their own profile
CREATE POLICY "Users can update own profile"
ON profiles
FOR UPDATE
USING (auth.uid() = id);

-- PROFILES: Admins can view all profiles (using email check to avoid recursion)
CREATE POLICY "Admins view all profiles"
ON profiles
FOR SELECT
USING (
    auth.jwt() ->> 'email' IN (
        SELECT email FROM profiles WHERE email = auth.jwt() ->> 'email' AND is_admin = true
    )
);

-- ============================================
-- VERIFICATION QUERY
-- ============================================
-- Run this to verify the fix worked:
-- SELECT * FROM products WHERE is_active = true ORDER BY created_at DESC LIMIT 5;
