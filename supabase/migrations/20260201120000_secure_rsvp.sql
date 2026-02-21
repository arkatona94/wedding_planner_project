-- Drop insecure policies
DROP POLICY IF EXISTS "Public can view wedding details for RSVP" ON public.weddings;
DROP POLICY IF EXISTS "Public can search guests for RSVP" ON public.guests;
DROP POLICY IF EXISTS "Public can update guest RSVP" ON public.guests;

-- Add secure RPC for wedding details
CREATE OR REPLACE FUNCTION get_wedding_for_rsvp(p_wedding_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSON;
BEGIN
  SELECT row_to_json(r) INTO v_result
  FROM (
    SELECT w.*, 
      (SELECT json_build_object('email', p.email, 'full_name', p.full_name) 
       FROM public.profiles p WHERE p.id = w.user_id) as profiles
    FROM public.weddings w
    WHERE w.id = p_wedding_id
  ) r;
  
  RETURN v_result;
END;
$$;

-- Add secure RPC for guest search
CREATE OR REPLACE FUNCTION search_guests_for_rsvp(p_wedding_id UUID, p_first_name TEXT, p_last_name TEXT)
RETURNS SETOF public.guests
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM public.guests
  WHERE wedding_id = p_wedding_id
    AND first_name ILIKE p_first_name
    AND last_name ILIKE p_last_name;
$$;

-- Add secure RPC for guest RSVP update
CREATE OR REPLACE FUNCTION update_guest_rsvp(
  p_guest_id UUID,
  p_status TEXT,
  p_meal TEXT,
  p_dietary TEXT[],
  p_plus_one_name TEXT,
  p_notes TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_guest public.guests%ROWTYPE;
BEGIN
  UPDATE public.guests
  SET
    rsvp_status = p_status,
    meal_choice = p_meal,
    dietary_restrictions = p_dietary,
    plus_one_name = p_plus_one_name,
    notes = p_notes,
    updated_at = NOW()
  WHERE id = p_guest_id
  RETURNING * INTO v_guest;
  
  RETURN row_to_json(v_guest);
END;
$$;
