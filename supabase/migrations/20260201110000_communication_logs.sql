-- Communication Logs Table
CREATE TABLE IF NOT EXISTS public.communication_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wedding_id UUID REFERENCES public.weddings(id) ON DELETE CASCADE NOT NULL,
    guest_id UUID REFERENCES public.guests(id) ON DELETE SET NULL,
    type TEXT NOT NULL, -- 'save_the_date', 'reminder', 'rsvp_notification', etc.
    channel TEXT NOT NULL, -- 'email', 'sms'
    recipient TEXT NOT NULL,
    subject TEXT,
    content TEXT,
    status TEXT DEFAULT 'pending', -- 'pending', 'sent', 'failed'
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.communication_logs ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can see communication logs for their weddings" ON public.communication_logs
FOR SELECT USING (
    wedding_id IN (SELECT id FROM public.weddings WHERE user_id = auth.uid())
);

CREATE POLICY "Users can insert communication logs" ON public.communication_logs
FOR INSERT WITH CHECK (
    wedding_id IN (SELECT id FROM public.weddings WHERE user_id = auth.uid())
);
