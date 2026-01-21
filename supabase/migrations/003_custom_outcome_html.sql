-- Add custom HTML field to conditions table for outcome page customization
ALTER TABLE conditions ADD COLUMN IF NOT EXISTS custom_html TEXT;

-- Add custom CSS field for additional styling
ALTER TABLE conditions ADD COLUMN IF NOT EXISTS custom_css TEXT;

-- Add fields for outcome page sections
ALTER TABLE conditions ADD COLUMN IF NOT EXISTS hero_image_url TEXT;
ALTER TABLE conditions ADD COLUMN IF NOT EXISTS testimonial_name VARCHAR(255);
ALTER TABLE conditions ADD COLUMN IF NOT EXISTS testimonial_quote TEXT;
ALTER TABLE conditions ADD COLUMN IF NOT EXISTS testimonial_image_url TEXT;
