-- Create the public_rsvp_submissions table
-- Run this SQL in Supabase Dashboard: https://supabase.com/dashboard/project/xcjelqmifskowxxdtqrh/sql/new

CREATE TABLE IF NOT EXISTS public.public_rsvp_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wedding_id UUID REFERENCES public.weddings(id) ON DELETE CASCADE NOT NULL,
    guest_id UUID REFERENCES public.guests(id) ON DELETE SET NULL,
    guest_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    rsvp_status TEXT NOT NULL,
    meal_choice TEXT,
    dietary_restrictions TEXT[],
    plus_one_name TEXT,
    message TEXT,
    submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.public_rsvp_submissions ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to submit RSVPs
CREATE POLICY "Anyone can submit RSVP" ON public.public_rsvp_submissions
FOR INSERT TO anon
WITH CHECK (true);

-- Allow wedding owners to view RSVP submissions
CREATE POLICY "Wedding owners can view RSVP submissions" ON public.public_rsvp_submissions
FOR SELECT USING (
    wedding_id IN (SELECT id FROM public.weddings WHERE user_id = auth.uid())
);
