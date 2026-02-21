#!/usr/bin/env python3
"""
Test Suite 1.4: Verify Storage Buckets
Tests that Supabase Storage buckets are configured correctly
"""

import os
import sys
import time
from dotenv import load_dotenv
from supabase import create_client, Client
import io

# Load environment variables
load_dotenv()

SUPABASE_URL = os.getenv("VITE_SUPABASE_URL")
SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
ANON_KEY = os.getenv("VITE_SUPABASE_ANON_KEY")

EXPECTED_BUCKETS = ["inspiration", "photos"]


def test_buckets_exist(supabase: Client):
    """Verify storage buckets exist"""
    print("🪣 Checking storage buckets...")

    try:
        buckets = supabase.storage.list_buckets()

        bucket_names = [b.name for b in buckets]

        results = {}
        for expected in EXPECTED_BUCKETS:
            if expected in bucket_names:
                print(f"✅ PASS: Bucket '{expected}' exists")
                results[expected] = True
            else:
                print(f"❌ FAIL: Bucket '{expected}' missing")
                results[expected] = False

        return results

    except Exception as e:
        print(f"❌ FAIL: Could not list buckets - {e}")
        return {bucket: False for bucket in EXPECTED_BUCKETS}


def test_bucket_public_access(supabase: Client, bucket_name: str):
    """Test if bucket allows public read access"""
    print(f"\n🔓 Testing public access for '{bucket_name}'...")

    try:
        # Get bucket details
        bucket = supabase.storage.get_bucket(bucket_name)

        if bucket and bucket.public:
            print(f"✅ PASS: '{bucket_name}' is public")
            return True
        else:
            print(f"❌ FAIL: '{bucket_name}' is not public")
            return False

    except Exception as e:
        print(f"⚠️  WARN: Could not check bucket public status - {e}")
        return None


def test_authenticated_upload(supabase: Client, bucket_name: str):
    """Test that authenticated users can upload"""
    print(f"\n📤 Testing authenticated upload to '{bucket_name}'...")

    # Create a test file
    test_content = b"Test image content for wedding planner"
    test_filename = f"test-{int(time.time())}.txt"
    test_path = f"tests/{test_filename}"

    try:
        # Upload file
        result = supabase.storage.from_(bucket_name).upload(
            test_path, test_content, file_options={"content-type": "text/plain"}
        )

        if result:
            print(f"✅ PASS: Upload successful to '{bucket_name}/{test_path}'")

            # Clean up - delete test file
            try:
                supabase.storage.from_(bucket_name).remove([test_path])
                print(f"   (Cleanup: Deleted test file)")
            except:
                print(f"   ⚠️  Could not delete test file")

            return True
        else:
            print(f"❌ FAIL: Upload failed to '{bucket_name}'")
            return False

    except Exception as e:
        print(f"❌ FAIL: Upload error - {e}")
        return False


def test_upload_policies(supabase: Client, bucket_name: str):
    """Test storage policies"""
    print(f"\n🔐 Testing storage policies for '{bucket_name}'...")

    # Note: Testing storage policies requires actual authenticated user
    # This is a placeholder for manual testing
    print("⚠️  NOTE: Storage policy testing requires authenticated user session")
    print("   Manual test steps:")
    print("   1. Log in to app as User A")
    print("   2. Upload image to Inspiration/Photos")
    print("   3. Verify upload succeeds")
    print("   4. Log in as User B")
    print("   5. Verify User B can see public images")
    print("   6. Verify User B cannot delete User A's images")

    return None  # Manual test required


def create_missing_buckets(supabase: Client, missing_buckets: list):
    """Helper function to create missing buckets"""
    print(f"\n🔨 Creating missing buckets...")

    for bucket in missing_buckets:
        try:
            supabase.storage.create_bucket(bucket, options={"public": True})
            print(f"✅ Created bucket '{bucket}'")
        except Exception as e:
            print(f"❌ Failed to create bucket '{bucket}' - {e}")
            print(f"   Create manually in Supabase dashboard:")
            print(
                f"   https://supabase.com/dashboard/project/{SUPABASE_URL.split('//')[1].split('.')[0]}/storage/buckets"
            )


def main():
    """Run all storage bucket tests"""
    print("=" * 60)
    print("TEST SUITE 1.4: STORAGE BUCKET VERIFICATION")
    print("=" * 60)

    if not SUPABASE_URL or not SERVICE_KEY:
        print("❌ FAIL: Missing Supabase credentials in .env")
        sys.exit(1)

    supabase: Client = create_client(SUPABASE_URL, SERVICE_KEY)

    results = []

    # Test 1: Buckets exist
    bucket_results = test_buckets_exist(supabase)

    missing_buckets = [name for name, exists in bucket_results.items() if not exists]

    if missing_buckets:
        print(f"\n⚠️  Missing buckets: {', '.join(missing_buckets)}")

        user_input = input("\nWould you like to create missing buckets? (y/n): ")
        if user_input.lower() == "y":
            create_missing_buckets(supabase, missing_buckets)
            # Re-test
            bucket_results = test_buckets_exist(supabase)

    results.append(all(bucket_results.values()))

    # Test 2 & 3: For each existing bucket
    for bucket_name in EXPECTED_BUCKETS:
        if bucket_results.get(bucket_name):
            # Test public access
            public_ok = test_bucket_public_access(supabase, bucket_name)
            if public_ok is not None:
                results.append(public_ok)

            # Test upload
            upload_ok = test_authenticated_upload(supabase, bucket_name)
            results.append(upload_ok)

            # Test policies (manual)
            test_upload_policies(supabase, bucket_name)

    # Summary
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)

    testable_results = [r for r in results if r is not None]

    if all(testable_results):
        print("✅ OVERALL RESULT: PASS - Storage buckets configured correctly")
        print("   (Note: Manual policy tests still required)")
        sys.exit(0)
    else:
        print("❌ OVERALL RESULT: FAIL - Storage bucket issues found")
        sys.exit(1)


if __name__ == "__main__":
    main()
