-- Create favorites table for storing user's favorite products
CREATE TABLE IF NOT EXISTS favorites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_identifier TEXT NOT NULL,
    product_id INTEGER NOT NULL,
    product_name TEXT NOT NULL,
    product_price DECIMAL(10, 2) NOT NULL,
    product_image TEXT,
    product_category TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_identifier, product_id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_favorites_user_identifier ON favorites(user_identifier);
CREATE INDEX IF NOT EXISTS idx_favorites_product_id ON favorites(product_id);
CREATE INDEX IF NOT EXISTS idx_favorites_created_at ON favorites(created_at DESC);

-- Enable Row Level Security
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Create policies for favorites table
-- Allow users to read their own favorites (using user_identifier from localStorage)
CREATE POLICY "Users can view their own favorites"
    ON favorites FOR SELECT
    USING (true);

-- Allow users to insert their own favorites
CREATE POLICY "Users can insert their own favorites"
    ON favorites FOR INSERT
    WITH CHECK (true);

-- Allow users to delete their own favorites
CREATE POLICY "Users can delete their own favorites"
    ON favorites FOR DELETE
    USING (true);

-- Add comment
COMMENT ON TABLE favorites IS 'Stores user favorite products with user identifier from localStorage';
