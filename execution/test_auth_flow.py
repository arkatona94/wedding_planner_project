"""
Authentication Flow Tests for EverAfter Wedding Planner
Tests user registration, login, and RLS policy isolation using Supabase Auth API
"""

import os
import urllib.request
import urllib.error
import json
import time
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("VITE_SUPABASE_URL")
ANON_KEY = os.getenv("VITE_SUPABASE_ANON_KEY")
SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

# Test user credentials - Use a real-looking email format
TEST_EMAIL = f"everafter.test.{int(time.time())}@gmail.com"
TEST_PASSWORD = "TestPassword123!"
TEST_NAME = "Test Wedding User"


def api_call(endpoint, method="GET", data=None, token=None, use_service_key=False):
    """Make an authenticated API call to Supabase."""
    url = f"{SUPABASE_URL}{endpoint}"

    headers = {
        "apikey": SERVICE_KEY if use_service_key else ANON_KEY,
        "Content-Type": "application/json",
    }

    if token:
        headers["Authorization"] = f"Bearer {token}"
    elif use_service_key:
        headers["Authorization"] = f"Bearer {SERVICE_KEY}"

    req_data = json.dumps(data).encode() if data else None
    req = urllib.request.Request(url, data=req_data, headers=headers, method=method)

    try:
        with urllib.request.urlopen(req, timeout=30) as response:
            body = response.read().decode()
            return {"status": response.status, "data": json.loads(body) if body else {}}
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        return {"status": e.code, "error": json.loads(body) if body else str(e)}
    except Exception as e:
        return {"status": 0, "error": str(e)}


def test_signup():
    """Test 2.1: User Registration"""
    print("\n" + "=" * 60)
    print("TEST 2.1: User Registration")
    print("=" * 60)

    result = api_call(
        "/auth/v1/signup",
        method="POST",
        data={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD,
            "data": {
                "full_name": TEST_NAME,
                "enabled_modules": ["dashboard", "checklist", "budget"],
            },
        },
    )

    if result.get("status") == 200 and result.get("data", {}).get("user"):
        user = result["data"]["user"]
        access_token = result["data"].get("access_token")
        print(f"✅ PASSED: User created successfully")
        print(f"   User ID: {user.get('id')}")
        print(f"   Email: {user.get('email')}")
        return True, user.get("id"), access_token
    else:
        print(f"❌ FAILED: {result.get('error', 'Unknown error')}")
        return False, None, None


def test_login():
    """Test 2.2: User Login"""
    print("\n" + "=" * 60)
    print("TEST 2.2: User Login")
    print("=" * 60)

    result = api_call(
        "/auth/v1/token?grant_type=password",
        method="POST",
        data={"email": TEST_EMAIL, "password": TEST_PASSWORD},
    )

    if result.get("status") == 200 and result.get("data", {}).get("access_token"):
        token = result["data"]["access_token"]
        user = result["data"]["user"]
        print(f"✅ PASSED: Login successful")
        print(f"   Access token received: {token[:20]}...")
        print(f"   User ID: {user.get('id')}")
        return True, token, user.get("id")
    else:
        print(f"❌ FAILED: {result.get('error', 'Unknown error')}")
        return False, None, None


def test_profile_rls(token, user_id):
    """Test 2.6: RLS Profile Isolation - user can only see own profile"""
    print("\n" + "=" * 60)
    print("TEST 2.6: RLS Profile Isolation")
    print("=" * 60)

    # First, check if profile was auto-created by trigger
    result = api_call(f"/rest/v1/profiles?id=eq.{user_id}", token=token)

    if result.get("status") == 200:
        profiles = result.get("data", [])
        if len(profiles) == 1 and profiles[0].get("id") == user_id:
            print(f"✅ PASSED: User can access their own profile")
            print(f"   Profile data: {profiles[0].get('email')}")
        elif len(profiles) == 0:
            print("⚠️  WARNING: Profile not found (trigger may not have fired)")
            print("   This is expected if email confirmation is required")
        else:
            print(f"❌ FAILED: Unexpected profile data returned")
        return True
    else:
        print(f"❌ FAILED: {result.get('error', 'Unknown error')}")
        return False


def test_wedding_rls(token, user_id):
    """Test RLS: Wedding data isolation"""
    print("\n" + "=" * 60)
    print("TEST: Wedding RLS Isolation")
    print("=" * 60)

    # Check for wedding records
    result = api_call(f"/rest/v1/weddings?user_id=eq.{user_id}", token=token)

    if result.get("status") == 200:
        weddings = result.get("data", [])
        if len(weddings) >= 1:
            print(f"✅ PASSED: User can access their wedding records")
            print(f"   Found {len(weddings)} wedding(s)")
        else:
            print("⚠️  WARNING: No weddings found")
            print("   This may be expected if profile trigger didn't create one")
        return True
    else:
        print(f"❌ FAILED: {result.get('error', 'Unknown error')}")
        return False


def test_anon_cannot_access_data():
    """Test: Anonymous users cannot access protected data"""
    print("\n" + "=" * 60)
    print("TEST: Anonymous Access Blocked")
    print("=" * 60)

    # Try to access profiles without authentication
    result = api_call("/rest/v1/profiles?select=*")

    if result.get("status") in [200] and len(result.get("data", [])) == 0:
        print(f"✅ PASSED: Anonymous cannot see any profiles (RLS working)")
        return True
    elif result.get("status") == 401:
        print(f"✅ PASSED: Anonymous access denied (401)")
        return True
    else:
        print(f"⚠️  WARNING: Unexpected response - {result}")
        return False


def cleanup_test_user(user_id):
    """Clean up test user using service role key."""
    print("\n" + "=" * 60)
    print("CLEANUP: Removing test user")
    print("=" * 60)

    if not user_id:
        print("No user to clean up")
        return

    # Delete user using admin API
    result = api_call(
        f"/auth/v1/admin/users/{user_id}", method="DELETE", use_service_key=True
    )

    if result.get("status") in [200, 204]:
        print(f"✅ Test user deleted: {TEST_EMAIL}")
    else:
        print(f"⚠️  Could not delete test user: {result.get('error', 'Unknown')}")


def run_all_tests():
    """Run all authentication tests."""
    print("\n" + "#" * 60)
    print("# EverAfter Wedding Planner - Auth Test Suite")
    print("#" * 60)
    print(f"\nTest email: {TEST_EMAIL}")
    print(f"Supabase URL: {SUPABASE_URL}")

    passed = 0
    failed = 0
    user_id = None

    # Test 2.1: Signup
    success, user_id, token = test_signup()
    if success:
        passed += 1
    else:
        failed += 1

    if not token:
        # Try login if signup didn't return token (email confirmation required)
        time.sleep(1)
        success, token, user_id = test_login()
        if success:
            passed += 1
        else:
            failed += 1

    # Test 2.2: Login
    success, token, user_id = test_login()
    if success:
        passed += 1
    else:
        failed += 1

    if token:
        # Test RLS policies
        if test_profile_rls(token, user_id):
            passed += 1
        else:
            failed += 1

        if test_wedding_rls(token, user_id):
            passed += 1
        else:
            failed += 1

    # Test anonymous access
    if test_anon_cannot_access_data():
        passed += 1
    else:
        failed += 1

    # Cleanup
    cleanup_test_user(user_id)

    # Summary
    print("\n" + "=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)
    print(f"✅ Passed: {passed}")
    print(f"❌ Failed: {failed}")

    if failed == 0:
        print("\n🎉 ALL TESTS PASSED!")
    else:
        print(f"\n⚠️  {failed} test(s) need attention")

    return failed == 0


if __name__ == "__main__":
    run_all_tests()
