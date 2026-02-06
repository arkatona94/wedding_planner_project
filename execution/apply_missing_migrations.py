"""
Apply missing migrations to Supabase database.
These migrations add: public_rsvp_submissions, communication_logs, inspiration_boards, inspiration_images
"""
import pg8000
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

DB_PASSWORD = os.getenv("SUPABASE_DB_PASSWORD")
PROJECT_ID = "xcjelqmifskowxxdtqrh"
DB_HOST = f"db.{PROJECT_ID}.supabase.co"

# Migration 1: Communication Logs
MIGRATION_COMMUNICATION_LOGS = """
CREATE TABLE IF NOT EXISTS public.communication_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wedding_id UUID REFERENCES public.weddings(id) ON DELETE CASCADE NOT NULL,
    guest_id UUID REFERENCES public.guests(id) ON DELETE SET NULL,
    type TEXT NOT NULL,
    channel TEXT NOT NULL,
    recipient TEXT NOT NULL,
    subject TEXT,
    content TEXT,
    status TEXT DEFAULT 'pending',
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.communication_logs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'communication_logs' AND policyname = 'Users can see communication logs for their weddings') THEN
        CREATE POLICY "Users can see communication logs for their weddings" ON public.communication_logs
        FOR SELECT USING (
            wedding_id IN (SELECT id FROM public.weddings WHERE user_id = auth.uid())
        );
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'communication_logs' AND policyname = 'Users can insert communication logs') THEN
        CREATE POLICY "Users can insert communication logs" ON public.communication_logs
        FOR INSERT WITH CHECK (
            wedding_id IN (SELECT id FROM public.weddings WHERE user_id = auth.uid())
        );
    END IF;
END $$;
"""

# Migration 2: Inspiration Boards and Images
MIGRATION_INSPIRATION = """
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

CREATE TABLE IF NOT EXISTS public.inspiration_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    board_id UUID REFERENCES public.inspiration_boards(id) ON DELETE CASCADE NOT NULL,
    url TEXT NOT NULL,
    source TEXT,
    notes TEXT,
    tags TEXT[],
    added_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.inspiration_boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inspiration_images ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'inspiration_boards' AND policyname = 'Users can manage their own inspiration boards') THEN
        CREATE POLICY "Users can manage their own inspiration boards" ON public.inspiration_boards FOR ALL 
        USING (wedding_id IN (SELECT id FROM public.weddings WHERE user_id = auth.uid()));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'inspiration_images' AND policyname = 'Users can manage their own inspiration images') THEN
        CREATE POLICY "Users can manage their own inspiration images" ON public.inspiration_images FOR ALL 
        USING (board_id IN (SELECT id FROM public.inspiration_boards WHERE wedding_id IN (SELECT id FROM public.weddings WHERE user_id = auth.uid())));
    END IF;
END $$;

DROP TRIGGER IF EXISTS update_inspiration_boards_updated_at ON public.inspiration_boards;
CREATE TRIGGER update_inspiration_boards_updated_at BEFORE UPDATE ON public.inspiration_boards FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
"""

# Migration 3: Public RSVP Submissions
MIGRATION_PUBLIC_RSVP = """
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

DO $$
BEGIN
    -- Allow anonymous users to submit RSVPs
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'public_rsvp_submissions' AND policyname = 'Anyone can submit RSVP') THEN
        CREATE POLICY "Anyone can submit RSVP" ON public.public_rsvp_submissions
        FOR INSERT TO anon
        WITH CHECK (true);
    END IF;
    
    -- Allow wedding owners to view RSVP submissions
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'public_rsvp_submissions' AND policyname = 'Wedding owners can view RSVP submissions') THEN
        CREATE POLICY "Wedding owners can view RSVP submissions" ON public.public_rsvp_submissions
        FOR SELECT USING (
            wedding_id IN (SELECT id FROM public.weddings WHERE user_id = auth.uid())
        );
    END IF;
END $$;

-- Public RSVP access policies on existing tables
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'weddings' AND policyname = 'Public can view wedding details for RSVP') THEN
        CREATE POLICY "Public can view wedding details for RSVP" ON public.weddings
        FOR SELECT TO anon
        USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'guests' AND policyname = 'Public can search for guests') THEN
        CREATE POLICY "Public can search for guests" ON public.guests
        FOR SELECT TO anon
        USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'guests' AND policyname = 'Public can update their own guest record') THEN
        CREATE POLICY "Public can update their own guest record" ON public.guests
        FOR UPDATE TO anon
        USING (true)
        WITH CHECK (true);
    END IF;
END $$;
"""


def apply_migrations():
    """Apply all missing migrations."""
    print("=" * 60)
    print("Applying Missing Migrations to Supabase")
    print("=" * 60)
    
    if not DB_PASSWORD:
        print("❌ ERROR: SUPABASE_DB_PASSWORD not found in .env")
        return False
    
    try:
        print(f"\n📡 Connecting to {DB_HOST}...")
        conn = pg8000.connect(
            host=DB_HOST,
            port=5432,
            database="postgres",
            user="postgres",
            password=DB_PASSWORD,
            ssl_context=True
        )
        cursor = conn.cursor()
        print("✅ Connected to database")
        
        migrations = [
            ("communication_logs", MIGRATION_COMMUNICATION_LOGS),
            ("inspiration_boards_and_images", MIGRATION_INSPIRATION),
            ("public_rsvp_submissions", MIGRATION_PUBLIC_RSVP)
        ]
        
        for name, sql in migrations:
            print(f"\n📝 Applying migration: {name}...")
            try:
                cursor.execute(sql)
                conn.commit()
                print(f"   ✅ {name} - SUCCESS")
            except Exception as e:
                conn.rollback()
                print(f"   ⚠️ {name} - {str(e)[:100]}")
        
        # Verify tables exist
        print("\n" + "=" * 60)
        print("Verifying Tables Exist")
        print("=" * 60)
        
        tables_to_check = [
            "communication_logs",
            "inspiration_boards", 
            "inspiration_images",
            "public_rsvp_submissions"
        ]
        
        for table in tables_to_check:
            cursor.execute(f"""
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    AND table_name = '{table}'
                );
            """)
            exists = cursor.fetchone()[0]
            status = "✅" if exists else "❌"
            print(f"{status} {table}")
        
        cursor.close()
        conn.close()
        print("\n✅ Migration complete!")
        return True
        
    except Exception as e:
        print(f"\n❌ Connection error: {e}")
        return False


if __name__ == "__main__":
    apply_migrations()
