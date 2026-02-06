"""Create the missing public_rsvp_submissions table via Supabase SQL."""

import os
import urllib.request
import json
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("VITE_SUPABASE_URL")
SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

# SQL to create the missing table
SQL = """
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

ALTER TABLE public.public_rsvp_submissions ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to submit RSVPs
CREATE POLICY IF NOT EXISTS "Anyone can submit RSVP" ON public.public_rsvp_submissions
FOR INSERT TO anon
WITH CHECK (true);

-- Allow wedding owners to view RSVP submissions
CREATE POLICY IF NOT EXISTS "Wedding owners can view RSVP submissions" ON public.public_rsvp_submissions
FOR SELECT USING (
    wedding_id IN (SELECT id FROM public.weddings WHERE user_id = auth.uid())
);
"""

print("Creating public_rsvp_submissions table...")
print(f"URL: {SUPABASE_URL}/rest/v1/rpc\n")

# Use the SQL RPC endpoint
url = f"{SUPABASE_URL}/rest/v1/rpc/exec_sql"
data = json.dumps({"query": SQL}).encode()

req = urllib.request.Request(
    url,
    data=data,
    headers={
        "apikey": SERVICE_KEY,
        "Authorization": f"Bearer {SERVICE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=minimal",
    },
    method="POST",
)

try:
    with urllib.request.urlopen(req, timeout=30) as response:
        print(f"✅ Table created successfully (status {response.status})")
except urllib.error.HTTPError as e:
    # exec_sql function might not exist, that's ok
    print(f"Note: RPC function not available ({e.code})")
    print("The table may need to be created via Supabase Dashboard SQL Editor.")
    print("\nPlease run this SQL in the Supabase Dashboard:")
    print("-" * 50)
    print(SQL)
except Exception as e:
    print(f"Error: {e}")

# Verify if it exists now
print("\nVerifying table exists...")
check_url = f"{SUPABASE_URL}/rest/v1/public_rsvp_submissions?select=*&limit=0"
check_req = urllib.request.Request(
    check_url, headers={"apikey": SERVICE_KEY, "Authorization": f"Bearer {SERVICE_KEY}"}
)
try:
    with urllib.request.urlopen(check_req, timeout=10) as response:
        if response.status == 200:
            print("✅ public_rsvp_submissions table verified!")
except urllib.error.HTTPError as e:
    if e.code == 404:
        print("❌ Table still not found - needs manual creation in Supabase Dashboard")
    else:
        print(f"❌ Error checking table ({e.code})")
