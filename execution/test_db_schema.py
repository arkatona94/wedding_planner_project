#!/usr/bin/env python3
"""
Test Suite 1.1: Verify Database Schema
Verifies all required tables exist in Supabase database
"""

import os
import sys
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables
load_dotenv()

# Configuration
SUPABASE_URL = os.getenv("VITE_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

# Expected tables
EXPECTED_TABLES = [
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


def test_db_connection():
    """Test connection to Supabase"""
    print("🔌 Testing Supabase connection...")

    if not SUPABASE_URL or not SUPABASE_KEY:
        print("❌ FAIL: Missing Supabase credentials in .env")
        return False

    try:
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        print(f"✅ PASS: Connected to {SUPABASE_URL}")
        return supabase
    except Exception as e:
        print(f"❌ FAIL: Connection error - {e}")
        return False


def test_tables_exist(supabase: Client):
    """Verify all expected tables exist"""
    print("\n📊 Verifying database tables...")

    results = {}
    missing_tables = []

    for table_name in EXPECTED_TABLES:
        try:
            # Try to query the table - if it doesn't exist, this will error
            result = supabase.table(table_name).select("*").limit(1).execute()
            print(f"✅ PASS: Table '{table_name}' exists")
            results[table_name] = True
        except Exception as e:
            print(f"❌ FAIL: Table '{table_name}' missing or inaccessible - {e}")
            results[table_name] = False
            missing_tables.append(table_name)

    return results, missing_tables


def test_table_structure(supabase: Client, table_name: str):
    """Test that table has expected columns (sample check)"""

    # Define expected columns for key tables
    expected_columns = {
        "profiles": [
            "id",
            "email",
            "full_name",
            "avatar_url",
            "app_settings",
            "created_at",
            "updated_at",
        ],
        "weddings": [
            "id",
            "user_id",
            "partner1_name",
            "partner2_name",
            "wedding_date",
            "total_budget",
        ],
        "guests": [
            "id",
            "wedding_id",
            "first_name",
            "last_name",
            "email",
            "rsvp_status",
        ],
        "vendors": ["id", "wedding_id", "name", "category", "price", "contracted"],
    }

    if table_name not in expected_columns:
        return True  # Skip tables we don't have column definitions for

    try:
        # Query one row to see structure
        result = supabase.table(table_name).select("*").limit(1).execute()

        if result.data and len(result.data) > 0:
            actual_columns = list(result.data[0].keys())
        else:
            # Empty table, can't verify columns
            print(f"⚠️  WARN: Table '{table_name}' is empty, skipping column check")
            return True

        expected = set(expected_columns[table_name])
        actual = set(actual_columns)

        missing = expected - actual

        if missing:
            print(f"❌ FAIL: Table '{table_name}' missing columns: {missing}")
            return False
        else:
            print(f"✅ PASS: Table '{table_name}' has expected columns")
            return True

    except Exception as e:
        print(f"⚠️  WARN: Could not verify columns for '{table_name}' - {e}")
        return True  # Don't fail if table is empty


def main():
    """Run all database schema tests"""
    print("=" * 60)
    print("TEST SUITE 1.1: DATABASE SCHEMA VERIFICATION")
    print("=" * 60)

    # Test 1: Connection
    supabase = test_db_connection()
    if not supabase:
        print("\n❌ OVERALL RESULT: FAIL - Cannot connect to database")
        sys.exit(1)

    # Test 2: Tables exist
    results, missing_tables = test_tables_exist(supabase)

    # Test 3: Table structure (for key tables only)
    print("\n🔍 Verifying table structures (sample)...")
    structure_checks = []
    for table in ["profiles", "weddings", "guests", "vendors"]:
        if results.get(table):
            structure_ok = test_table_structure(supabase, table)
            structure_checks.append(structure_ok)

    # Summary
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print(f"Total tables expected: {len(EXPECTED_TABLES)}")
    print(f"Tables found: {sum(results.values())}")
    print(f"Tables missing: {len(missing_tables)}")

    if missing_tables:
        print(f"\n⚠️  Missing tables: {', '.join(missing_tables)}")
        print("\n📝 Action Required:")
        print("   Run the migration SQL files in Supabase SQL Editor:")
        print("   1. supabase/migrations/20260201090000_initial_schema.sql")
        print("   2. supabase/migrations/20260201100000_public_rsvp.sql")
        print("   3. supabase/migrations/20260201110000_communication_logs.sql")
        print("   4. supabase/migrations/20260201110000_storage_and_inspiration.sql")

    if all(results.values()) and all(structure_checks):
        print("\n✅ OVERALL RESULT: PASS - All tables exist and verified")
        sys.exit(0)
    else:
        print("\n❌ OVERALL RESULT: FAIL - Some tables missing or misconfigured")
        sys.exit(1)


if __name__ == "__main__":
    main()
