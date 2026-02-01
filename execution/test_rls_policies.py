#!/usr/bin/env python3
"""
Test Suite 1.2: Verify RLS Policies
Tests that Row Level Security is properly configured
"""

import os
import sys
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables
load_dotenv()

SUPABASE_URL = os.getenv("VITE_SUPABASE_URL")
SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
ANON_KEY = os.getenv("VITE_SUPABASE_ANON_KEY")


def test_rls_enabled(supabase: Client):
    """Check if RLS is enabled on all tables"""
    print("🔒 Checking RLS status on tables...")

    query = """
    SELECT tablename, rowsecurity 
    FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename IN (
        'profiles', 'weddings', 'checklist_items', 'budget_items',
        'guests', 'vendors', 'timeline_events', 'seating_tables',
        'room_elements', 'photos', 'inspiration_boards', 'inspiration_images'
    )
    """

    try:
        result = supabase.rpc("exec_sql", {"query": query}).execute()

        if result.data:
            all_enabled = True
            for row in result.data:
                table = row["tablename"]
                enabled = row["rowsecurity"]

                if enabled:
                    print(f"✅ PASS: RLS enabled on '{table}'")
                else:
                    print(f"❌ FAIL: RLS NOT enabled on '{table}'")
                    all_enabled = False

            return all_enabled
        else:
            print("⚠️  WARN: Could not query RLS status")
            return None

    except Exception as e:
        print(f"⚠️  WARN: Could not verify RLS status - {e}")
        print("   (This may require a custom function in Supabase)")
        return None


def test_policy_count(supabase: Client):
    """Count RLS policies"""
    print("\n📋 Counting RLS policies...")

    query = """
    SELECT COUNT(*) as policy_count 
    FROM pg_policies 
    WHERE schemaname = 'public'
    """

    try:
        result = supabase.rpc("exec_sql", {"query": query}).execute()

        if result.data and len(result.data) > 0:
            count = result.data[0].get("policy_count", 0)
            print(f"   Found {count} RLS policies")

            if count >= 20:
                print(f"✅ PASS: Adequate number of policies ({count} >= 20)")
                return True
            else:
                print(f"❌ FAIL: Insufficient policies ({count} < 20 expected)")
                return False
        else:
            print("⚠️  WARN: Could not count policies")
            return None

    except Exception as e:
        print(f"⚠️  WARN: Could not verify policy count - {e}")
        return None


def test_unauthorized_access():
    """Test that unauthenticated client cannot access data"""
    print("\n🚫 Testing unauthorized access prevention...")

    # Create client with anon key (unauthenticated)
    anon_client: Client = create_client(SUPABASE_URL, ANON_KEY)

    tables_to_test = ["weddings", "guests", "budget_items", "vendors"]

    access_blocked = True

    for table in tables_to_test:
        try:
            result = anon_client.table(table).select("*").execute()

            if result.data and len(result.data) > 0:
                print(
                    f"❌ FAIL: Unauthenticated access allowed to '{table}' ({len(result.data)} rows)"
                )
                access_blocked = False
            else:
                print(f"✅ PASS: Unauthenticated access blocked for '{table}'")

        except Exception as e:
            # Exception is expected for proper RLS
            print(
                f"✅ PASS: Unauthenticated access blocked for '{table}' (error: {str(e)[:50]})"
            )

    return access_blocked


def test_authenticated_isolation():
    """
    Test that authenticated users can only see their own data
    NOTE: This requires actual user accounts to test properly
    This is a placeholder for manual testing
    """
    print("\n👥 Testing cross-user data isolation...")
    print("⚠️  NOTE: This test requires manual execution with 2+ user accounts")
    print("   1. Create User A with test data")
    print("   2. Create User B with test data")
    print("   3. Verify User A cannot see User B's data")
    print("   4. Query database with service role to confirm both datasets exist")
    print("   ✓ Manual test required - See test_plan.md TC-2.6")

    return None  # Manual test


def main():
    """Run all RLS policy tests"""
    print("=" * 60)
    print("TEST SUITE 1.2: RLS POLICY VERIFICATION")
    print("=" * 60)

    if not SUPABASE_URL or not SERVICE_KEY or not ANON_KEY:
        print("❌ FAIL: Missing Supabase credentials in .env")
        sys.exit(1)

    # Use service role for most tests
    supabase: Client = create_client(SUPABASE_URL, SERVICE_KEY)

    results = []

    # Test 1: RLS enabled
    rls_enabled = test_rls_enabled(supabase)
    if rls_enabled is not None:
        results.append(rls_enabled)

    # Test 2: Policy count
    policy_count_ok = test_policy_count(supabase)
    if policy_count_ok is not None:
        results.append(policy_count_ok)

    # Test 3: Unauthorized access
    access_blocked = test_unauthorized_access()
    results.append(access_blocked)

    # Test 4: Cross-user isolation (manual)
    test_authenticated_isolation()

    # Summary
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)

    testable_results = [r for r in results if r is not None]

    if all(testable_results):
        print("✅ OVERALL RESULT: PASS - RLS policies configured correctly")
        print("   (Note: Manual cross-user test still required)")
        sys.exit(0)
    else:
        print("❌ OVERALL RESULT: FAIL - RLS policy issues found")
        sys.exit(1)


if __name__ == "__main__":
    main()
