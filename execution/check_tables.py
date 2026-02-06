"""Check database tables via Supabase REST API."""

import os
import urllib.request
import json
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("VITE_SUPABASE_URL")
SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SERVICE_KEY:
    print("Missing SUPABASE_URL or SERVICE_KEY in .env")
    exit(1)

tables_to_check = [
    "profiles",
    "weddings",
    "checklist_items",
    "budget_items",
    "guests",
    "vendors",
    "timeline_events",
    "seating_tables",
    "room_elements",
    "photos",
    "inspiration_boards",
    "inspiration_images",
    "communication_logs",
    "public_rsvp_submissions",
]

print("Checking tables via Supabase REST API...")
print(f"URL: {SUPABASE_URL}\n")

passed = 0
failed = 0

for table in tables_to_check:
    url = f"{SUPABASE_URL}/rest/v1/{table}?select=*&limit=0"
    req = urllib.request.Request(
        url, headers={"apikey": SERVICE_KEY, "Authorization": f"Bearer {SERVICE_KEY}"}
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as response:
            if response.status == 200:
                print(f"✅ {table:30s} : EXISTS")
                passed += 1
            else:
                print(f"❌ {table:30s} : FAILED (status {response.status})")
                failed += 1
    except urllib.error.HTTPError as e:
        if e.code == 404:
            print(f"❌ {table:30s} : NOT FOUND")
        else:
            print(f"❌ {table:30s} : ERROR ({e.code})")
        failed += 1
    except Exception as e:
        print(f"❌ {table:30s} : ERROR ({str(e)[:50]})")
        failed += 1

print(f"\n{'='*50}")
print(f"RESULT: {passed}/{len(tables_to_check)} tables accessible")
if failed == 0:
    print("✅ ALL TABLES VERIFIED")
else:
    print(f"❌ {failed} TABLES MISSING OR INACCESSIBLE")
