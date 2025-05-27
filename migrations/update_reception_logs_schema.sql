-- Migration: Update reception_logs to reference school_menu_allocation instead of menu_id
-- Date: 2024-01-01
-- Description: Change reception_logs to track meal distribution per allocation rather than per menu

-- First, drop the existing foreign key constraint on menu_id (if it exists)
ALTER TABLE reception_logs 
DROP CONSTRAINT IF EXISTS reception_logs_menu_id_fkey;

-- Drop the menu_id column
ALTER TABLE reception_logs 
DROP COLUMN IF EXISTS menu_id;

-- Add the new school_menu_allocation_id column
ALTER TABLE reception_logs 
ADD COLUMN school_menu_allocation_id UUID NOT NULL REFERENCES school_menu_allocations(id) ON DELETE CASCADE;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_reception_logs_allocation_id 
ON reception_logs(school_menu_allocation_id);

-- Add index for user_id + allocation_id combination (to prevent duplicate claims)
CREATE UNIQUE INDEX IF NOT EXISTS idx_reception_logs_user_allocation 
ON reception_logs(user_id, school_menu_allocation_id);

-- Add comment to the new column
COMMENT ON COLUMN reception_logs.school_menu_allocation_id IS 'Reference to the specific menu allocation that was claimed'; 