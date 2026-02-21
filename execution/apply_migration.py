import psycopg2
import sys

# Connect to Supabase postgres directly using the password from .env
url = "postgresql://postgres:JiqxeUzyuR4LjBbe@db.xcjelqmifskowxxdtqrh.supabase.co:5432/postgres"

try:
    print("Connecting to database...")
    conn = psycopg2.connect(url)
    conn.autocommit = True
    cur = conn.cursor()

    print("Reading migration file...")
    with open("supabase/migrations/20260201120000_secure_rsvp.sql", "r") as f:
        sql = f.read()

    print("Executing SQL...")
    cur.execute(sql)
    print("✅ Migration applied successfully!")

    cur.close()
    conn.close()
except Exception as e:
    print(f"❌ Error applying migration: {e}")
    sys.exit(1)
