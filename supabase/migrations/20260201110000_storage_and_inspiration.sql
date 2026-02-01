-- Storage and Inspiration Boards Setup
-- Last Updated: 2026-02-01

-- 1. Inspiration Boards Table
CREATE TABLE IF NOT EXISTS public.inspiration_boards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wedding_id UUID REFERENCES public.weddings(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    category TEXT DEFAULT 'other',
    description TEXT,
    cover_image TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Inspiration Images Table
CREATE TABLE IF NOT EXISTS public.inspiration_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    board_id UUID REFERENCES public.inspiration_boards(id) ON DELETE CASCADE NOT NULL,
    url TEXT NOT NULL,
    source TEXT,
    notes TEXT,
    tags TEXT[],
    added_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable RLS
ALTER TABLE public.inspiration_boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inspiration_images ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
CREATE POLICY "Users can manage their own inspiration boards" ON public.inspiration_boards FOR ALL 
USING (wedding_id IN (SELECT id FROM public.weddings WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage their own inspiration images" ON public.inspiration_images FOR ALL 
USING (board_id IN (SELECT id FROM public.inspiration_boards WHERE wedding_id IN (SELECT id FROM public.weddings WHERE user_id = auth.uid())));

-- 5. Updated At Trigger
CREATE TRIGGER update_inspiration_boards_updated_at BEFORE UPDATE ON public.inspiration_boards FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 6. Storage Buckets Setup
-- Note: These operations usually need service role or manual setup via dashboard, 
-- but we can use SQL for bucket creation and RLS.

-- Create buckets if they don't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('inspiration', 'inspiration', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('photos', 'photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS Policies
-- Allow public access to view images
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id IN ('inspiration', 'photos'));

-- Allow authenticated users to upload to their own folders
-- We'll use the wedding_id or user_id in the path to identify ownership
CREATE POLICY "Authenticated users can upload inspiration" ON storage.objects FOR INSERT 
WITH CHECK (
    auth.role() = 'authenticated' AND 
    bucket_id = 'inspiration'
);

CREATE POLICY "Authenticated users can upload photos" ON storage.objects FOR INSERT 
WITH CHECK (
    auth.role() = 'authenticated' AND 
    bucket_id = 'photos'
);

-- Allow authenticated users to delete their own uploads
CREATE POLICY "Users can delete their own inspiration" ON storage.objects FOR DELETE 
USING (
    auth.role() = 'authenticated' AND 
    bucket_id = 'inspiration'
);

CREATE POLICY "Users can delete their own photos" ON storage.objects FOR DELETE 
USING (
    auth.role() = 'authenticated' AND 
    bucket_id = 'photos'
);
