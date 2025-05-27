-- Migration: Add image_url and created_by columns to menus table
-- Date: 2024-01-01
-- Description: Add optional image_url field and created_by field to track government that created the menu

-- Add image_url column
ALTER TABLE menus 
ADD COLUMN image_url TEXT;

-- Add created_by column to track which government created the menu
ALTER TABLE menus 
ADD COLUMN created_by UUID REFERENCES governments(id) ON DELETE SET NULL;

-- Add description column if it doesn't exist (in case it's missing)
ALTER TABLE menus 
ADD COLUMN IF NOT EXISTS description TEXT;

-- Add comments to the columns
COMMENT ON COLUMN menus.image_url IS 'URL to the menu image (optional)';
COMMENT ON COLUMN menus.created_by IS 'Government ID that created this menu';
COMMENT ON COLUMN menus.description IS 'Menu description (optional)'; 