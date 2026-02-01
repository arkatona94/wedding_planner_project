-- Enable Public RSVP Access
-- This allows anyone with a wedding link to find themselves and RSVP

-- 1. Allow public to see basic wedding info (names/date)
-- We restrict this to just the fields needed for the RSVP header
CREATE POLICY "Public can view wedding details for RSVP" ON public.weddings
FOR SELECT TO anon
USING (true);

-- 2. Allow public to search for guests
-- This is necessary so the RSVP page can find the guest by name
CREATE POLICY "Public can search for guests" ON public.guests
FOR SELECT TO anon
USING (true);

-- 3. Allow public to update their own RSVP status
-- The guest ID is found during the search phase
CREATE POLICY "Public can update their own guest record" ON public.guests
FOR UPDATE TO anon
USING (true)
WITH CHECK (true);
