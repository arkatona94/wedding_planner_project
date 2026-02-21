-- Migration to add default checklist tasks and auto-populate them for new users

-- 1. Ensure checklist_items has notes column
ALTER TABLE public.checklist_items ADD COLUMN IF NOT EXISTS notes TEXT;

-- 2. Create Default Checklist Tasks Table
CREATE TABLE IF NOT EXISTS public.default_checklist_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    category TEXT DEFAULT 'other',
    priority TEXT DEFAULT 'medium',
    months_out INTEGER, -- Number of months before the wedding
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Populate Default Tasks
INSERT INTO public.default_checklist_tasks (title, category, priority, months_out) VALUES
-- 12+ Months Before
('Determine total budget', 'other', 'high', 12),
('Draft guest list', 'other', 'high', 12),
('Book ceremony venue', 'venue', 'high', 12),
('Book reception venue', 'venue', 'high', 12),
('Hire wedding planner', 'other', 'medium', 12),
('Start wedding folder/binder', 'other', 'low', 12),
('Research wedding insurance', 'legal', 'medium', 12),
('Select wedding date', 'venue', 'high', 12),

-- 10-11 Months Before
('Hire photographer', 'photography', 'high', 11),
('Hire videographer', 'photography', 'medium', 11),
('Book officiant', 'legal', 'high', 11),
('Start shopping for wedding dress', 'attire', 'high', 11),
('Choose wedding party', 'other', 'medium', 11),
('Create wedding website', 'other', 'low', 10),
('Block hotel rooms for guests', 'accommodations', 'medium', 10),
('Take engagement photos', 'photography', 'medium', 10),

-- 8-9 Months Before
('Buy wedding dress', 'attire', 'high', 9),
('Send save-the-dates', 'invitations', 'high', 9),
('Book florist', 'flowers', 'medium', 9),
('Book musicians/DJ', 'music', 'medium', 9),
('Book caterer (if not included)', 'catering', 'high', 9),
('Research honeymoon destinations', 'other', 'low', 8),

-- 6-7 Months Before
('Order wedding invitations', 'invitations', 'medium', 7),
('Book transportation', 'transportation', 'medium', 6),
('Purchase wedding rings', 'attire', 'high', 6),
('Select bridesmaid dresses', 'attire', 'medium', 6),
('Schedule makeup trial', 'other', 'medium', 6),
('Plan rehearsal dinner', 'other', 'medium', 6),
('Meet with officiant to plan ceremony', 'legal', 'medium', 6),
('Order cake', 'catering', 'medium', 6),

-- 4-5 Months Before
('Book honeymoon', 'other', 'high', 5),
('Groom''s attire shopping', 'attire', 'medium', 5),
('Finalize guest list', 'invitations', 'high', 4),
('Book rehearsal dinner venue', 'venue', 'medium', 4),
('Order favors', 'other', 'low', 4),
('Finalize menu with caterer', 'catering', 'high', 4),

-- 3 Months Before
('Mail wedding invitations', 'invitations', 'high', 3),
('Finalize flowers', 'flowers', 'medium', 3),
('Order wedding timeline/programs', 'other', 'low', 3),
('Purchase undergarments and accessories', 'attire', 'medium', 3),
('Finalize readers and readings', 'legal', 'medium', 3),

-- 2 Months Before
('Write vows', 'other', 'high', 2),
('Apply for marriage license', 'legal', 'high', 2),
('Final dress fitting', 'attire', 'high', 2),
('Send song list to DJ/Band', 'music', 'medium', 2),
('Buy gifts for wedding party', 'other', 'low', 2),
('Create seating chart', 'other', 'medium', 2),
('Confirm all vendors', 'other', 'high', 2),

-- 1 Month Before
('Final headcount to caterer', 'catering', 'high', 1),
('Pick up wedding rings', 'attire', 'high', 1),
('Break in wedding shoes', 'attire', 'low', 1),
('Assign seating', 'other', 'medium', 1),
('Pack for honeymoon', 'other', 'medium', 1),
('Pay vendor balances', 'other', 'high', 1),

-- 1 Week Before
('Delegate wedding day tasks', 'other', 'medium', 0),
('Pack emergency kit', 'other', 'low', 0),
('Get manicure/pedicure', 'other', 'low', 0),
('Rehearse ceremony', 'other', 'high', 0);

-- Enable RLS on new table
ALTER TABLE public.default_checklist_tasks ENABLE ROW LEVEL SECURITY;
-- Allow everyone to read default tasks (needed for the trigger/functions)
CREATE POLICY "Everyone can read default tasks" ON public.default_checklist_tasks FOR SELECT USING (true);


-- 4. Update handle_new_user Function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_wedding_id UUID;
  wedding_date DATE;
BEGIN
  -- Create Profile
  INSERT INTO public.profiles (id, email, full_name, app_settings)
  VALUES (
    NEW.id, 
    NEW.email, 
    NEW.raw_user_meta_data->>'full_name', 
    jsonb_build_object(
        'enabledModules', COALESCE(NEW.raw_user_meta_data->'enabled_modules', '["dashboard", "checklist", "budget"]'::jsonb),
        'darkMode', false
    )
  );
  
  -- Create a default wedding for the new user
  INSERT INTO public.weddings (user_id, partner1_name, partner2_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', 'Partner')
  RETURNING id, wedding_date INTO new_wedding_id, wedding_date;
  
  -- Insert Default Checklist Items
  INSERT INTO public.checklist_items (wedding_id, title, category, priority, due_date)
  SELECT 
    new_wedding_id,
    title,
    category,
    priority,
    CASE 
        WHEN wedding_date IS NOT NULL THEN (wedding_date - (months_out || ' months')::interval)::date
        ELSE NULL
    END
  FROM public.default_checklist_tasks;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
