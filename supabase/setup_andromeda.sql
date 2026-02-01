
-- EverAfter Wedding Planner - Andromeda Setup Script
-- Paste this into your Supabase SQL Editor (https://supabase.com/dashboard/project/xcjelqmifskowxxdtqrh/sql)

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    app_settings JSONB DEFAULT '{"enabledModules": ["dashboard", "checklist", "budget"], "darkMode": false}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Weddings Table
CREATE TABLE IF NOT EXISTS public.weddings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    partner1_name TEXT,
    partner2_name TEXT,
    wedding_date DATE,
    total_budget NUMERIC DEFAULT 0,
    estimated_guests INTEGER DEFAULT 0,
    venue_name TEXT,
    venue_address TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Checklist Items
CREATE TABLE IF NOT EXISTS public.checklist_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wedding_id UUID REFERENCES public.weddings(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    due_date DATE,
    completed BOOLEAN DEFAULT FALSE,
    priority TEXT DEFAULT 'medium',
    assigned_to TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Budget Items
CREATE TABLE IF NOT EXISTS public.budget_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wedding_id UUID REFERENCES public.weddings(id) ON DELETE CASCADE NOT NULL,
    category TEXT,
    name TEXT NOT NULL,
    estimated_cost NUMERIC DEFAULT 0,
    actual_cost NUMERIC DEFAULT 0,
    paid_amount NUMERIC DEFAULT 0,
    due_date DATE,
    notes TEXT,
    vendor_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Guests
CREATE TABLE IF NOT EXISTS public.guests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wedding_id UUID REFERENCES public.weddings(id) ON DELETE CASCADE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    rsvp_status TEXT DEFAULT 'pending',
    meal_choice TEXT,
    dietary_restrictions TEXT[],
    plus_one BOOLEAN DEFAULT FALSE,
    plus_one_name TEXT,
    "group" TEXT,
    table_assignment UUID,
    is_bride_side BOOLEAN DEFAULT FALSE,
    is_groom_side BOOLEAN DEFAULT FALSE,
    address JSONB DEFAULT '{}'::jsonb,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Vendors
CREATE TABLE IF NOT EXISTS public.vendors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wedding_id UUID REFERENCES public.weddings(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    category TEXT,
    contact_person TEXT,
    email TEXT,
    phone TEXT,
    price NUMERIC DEFAULT 0,
    deposit_paid BOOLEAN DEFAULT FALSE,
    contracted BOOLEAN DEFAULT FALSE,
    rating INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Timeline Events
CREATE TABLE IF NOT EXISTS public.timeline_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wedding_id UUID REFERENCES public.weddings(id) ON DELETE CASCADE NOT NULL,
    time TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    location TEXT,
    day_type TEXT DEFAULT 'Wedding Day',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Seating Tables
CREATE TABLE IF NOT EXISTS public.seating_tables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wedding_id UUID REFERENCES public.weddings(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    capacity INTEGER DEFAULT 8,
    shape TEXT DEFAULT 'round',
    x NUMERIC NOT NULL,
    y NUMERIC NOT NULL,
    width NUMERIC,
    height NUMERIC,
    rotation NUMERIC DEFAULT 0,
    side TEXT DEFAULT 'general',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Room Elements (Decor)
CREATE TABLE IF NOT EXISTS public.room_elements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wedding_id UUID REFERENCES public.weddings(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL,
    label TEXT,
    icon TEXT,
    x NUMERIC NOT NULL,
    y NUMERIC NOT NULL,
    width NUMERIC NOT NULL,
    height NUMERIC NOT NULL,
    color TEXT,
    rotation NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Photos
CREATE TABLE IF NOT EXISTS public.photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wedding_id UUID REFERENCES public.weddings(id) ON DELETE CASCADE NOT NULL,
    url TEXT NOT NULL,
    caption TEXT,
    category TEXT,
    is_favorite BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seating_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_elements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;

-- 12. RLS Policies
CREATE POLICY "Users can manage their own profile" ON public.profiles FOR ALL USING (id = auth.uid());
CREATE POLICY "Users can manage their own wedding" ON public.weddings FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can manage checklist_items" ON public.checklist_items FOR ALL 
USING (wedding_id IN (SELECT id FROM public.weddings WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage budget_items" ON public.budget_items FOR ALL 
USING (wedding_id IN (SELECT id FROM public.weddings WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage guests" ON public.guests FOR ALL 
USING (wedding_id IN (SELECT id FROM public.weddings WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage vendors" ON public.vendors FOR ALL 
USING (wedding_id IN (SELECT id FROM public.weddings WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage timeline_events" ON public.timeline_events FOR ALL 
USING (wedding_id IN (SELECT id FROM public.weddings WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage seating_tables" ON public.seating_tables FOR ALL 
USING (wedding_id IN (SELECT id FROM public.weddings WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage room_elements" ON public.room_elements FOR ALL 
USING (wedding_id IN (SELECT id FROM public.weddings WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage photos" ON public.photos FOR ALL 
USING (wedding_id IN (SELECT id FROM public.weddings WHERE user_id = auth.uid()));

-- 13. Registration Triggers
-- Automatically create a profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, app_settings)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name', '{"enabledModules": ["dashboard", "checklist", "budget"], "darkMode": false}'::jsonb);
  
  -- Create initial wedding record
  INSERT INTO public.weddings (user_id, partner1_name, partner2_name, total_budget, estimated_guests)
  VALUES (NEW.id, 'Partner 1', 'Partner 2', 30000, 100);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 14. Updated_at Triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_weddings_updated_at BEFORE UPDATE ON public.weddings FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
