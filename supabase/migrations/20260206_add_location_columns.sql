-- Add Location Columns to Profiles
-- Migration: 20260206_add_location_columns.sql
-- Purpose: Store city, state, and ZIP code for location-based vendor search

-- Add location columns to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS state TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS zip_code TEXT;

-- Also add location to weddings table for venue-specific location
ALTER TABLE public.weddings ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE public.weddings ADD COLUMN IF NOT EXISTS state TEXT;

-- Update the handle_new_user trigger to include location data
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, city, state, zip_code, app_settings)
  VALUES (
    NEW.id, 
    NEW.email, 
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'city',
    NEW.raw_user_meta_data->>'state',
    NEW.raw_user_meta_data->>'zip_code',
    jsonb_build_object(
        'enabledModules', COALESCE(NEW.raw_user_meta_data->'enabled_modules', '["dashboard", "checklist", "budget"]'::jsonb),
        'darkMode', false
    )
  );
  
  -- Create a default wedding for the new user with location
  INSERT INTO public.weddings (user_id, partner1_name, partner2_name, city, state)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data->>'full_name', 
    'Partner',
    NEW.raw_user_meta_data->>'city',
    NEW.raw_user_meta_data->>'state'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
