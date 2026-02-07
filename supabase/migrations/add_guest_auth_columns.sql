-- Guest Self-Registration Migration
-- Adds columns for guest authentication and party members

-- Add invite_code column for guest registration links
ALTER TABLE public.guests ADD COLUMN IF NOT EXISTS invite_code TEXT UNIQUE;

-- Add user_id to link guest record to Supabase auth user
ALTER TABLE public.guests ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Add party_members JSONB array for companions/children
ALTER TABLE public.guests ADD COLUMN IF NOT EXISTS party_members JSONB DEFAULT '[]'::jsonb;

-- Add city and state columns to profiles table for location-based features
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS state TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS zip_code TEXT;

-- Create index on invite_code for faster lookups
CREATE INDEX IF NOT EXISTS idx_guests_invite_code ON public.guests(invite_code);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_guests_user_id ON public.guests(user_id);

-- RLS Policy: Allow guests to view and update their own record via user_id
CREATE POLICY "Guests can manage their own record via user_id" 
ON public.guests FOR ALL 
USING (user_id = auth.uid());

-- RLS Policy: Allow public read of guest by invite_code (for registration lookup)
-- Note: This is a SELECT-only policy for unauthenticated guest registration
CREATE POLICY "Public can lookup guests by invite_code"
ON public.guests FOR SELECT
USING (invite_code IS NOT NULL);
