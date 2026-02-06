"""
Password Reset Flow Test
Tests the password reset request endpoint
"""

import os
import urllib.request
import urllib.error
import json
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("VITE_SUPABASE_URL")
ANON_KEY = os.getenv("VITE_SUPABASE_ANON_KEY")


def test_password_reset_request(email):
    """Test that password reset emails can be requested."""
    print("=" * 60)
    print("TEST: Password Reset Request")
    print("=" * 60)

    url = f"{SUPABASE_URL}/auth/v1/recover"

    headers = {"apikey": ANON_KEY, "Content-Type": "application/json"}

    data = json.dumps({"email": email}).encode()

    req = urllib.request.Request(url, data=data, headers=headers, method="POST")

    try:
        with urllib.request.urlopen(req, timeout=30) as response:
            if response.status == 200:
                print(f"✅ PASSED: Password reset email requested successfully")
                print(f"   Email: {email}")
                print(f"   (Email would be sent if user exists)")
                return True
    except urllib.error.HTTPError as e:
        # Supabase returns 200 even if user doesn't exist (security)
        if e.code in [200, 202]:
            print(f"✅ PASSED: Password reset endpoint working")
            return True
        else:
            body = e.read().decode()
            print(f"❌ FAILED: {body}")
            return False
    except Exception as e:
        print(f"❌ FAILED: {e}")
        return False


if __name__ == "__main__":
    # Test with a random email (won't actually send)
    test_password_reset_request("test.reset@example.com")
