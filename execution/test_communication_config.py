#!/usr/bin/env python3
"""
Test Suite 3.1 & 3.2: Email and SMS Configuration Testing
Tests communication provider setup for Resend (email) and Twilio (SMS)
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Email configuration (Resend)
RESEND_API_KEY = os.getenv("RESEND_API_KEY")
RESEND_FROM_EMAIL = os.getenv("RESEND_FROM_EMAIL", "noreply@yourdomain.com")

# SMS configuration (Twilio)
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_PHONE_NUMBER = os.getenv("TWILIO_PHONE_NUMBER")


def test_resend_config():
    """Test Resend email configuration"""
    print("=" * 60)
    print("TEST: Resend Email Configuration")
    print("=" * 60)

    # Check if API key exists
    if not RESEND_API_KEY:
        print("❌ FAIL: RESEND_API_KEY not found in .env")
        print("\n📝 Setup Instructions:")
        print("   1. Sign up at https://resend.com")
        print("   2. Get your API key from dashboard")
        print("   3. Add to .env: RESEND_API_KEY=re_xxxxx")
        print("   4. Add sending email: RESEND_FROM_EMAIL=noreply@yourdomain.com")
        return False

    print(f"✅ PASS: RESEND_API_KEY found")
    print(f"   From Email: {RESEND_FROM_EMAIL}")

    # Try to import and test Resend
    try:
        import resend

        resend.api_key = RESEND_API_KEY

        print("\n🔌 Testing Resend API connection...")

        # Note: We don't want to send actual test email in automated tests
        # Just verify we can import and set API key
        print("✅ PASS: Resend library loaded successfully")
        print("   (Actual email sending test requires manual execution)")

        return True

    except ImportError:
        print("❌ FAIL: resend library not installed")
        print("\n📝 Installation:")
        print("   pip install resend")
        return False

    except Exception as e:
        print(f"❌ FAIL: Resend configuration error - {e}")
        return False


def test_twilio_config():
    """Test Twilio SMS configuration"""
    print("\n" + "=" * 60)
    print("TEST: Twilio SMS Configuration")
    print("=" * 60)

    # Check if credentials exist
    missing = []
    if not TWILIO_ACCOUNT_SID:
        missing.append("TWILIO_ACCOUNT_SID")
    if not TWILIO_AUTH_TOKEN:
        missing.append("TWILIO_AUTH_TOKEN")
    if not TWILIO_PHONE_NUMBER:
        missing.append("TWILIO_PHONE_NUMBER")

    if missing:
        print(f"❌ FAIL: Missing Twilio credentials: {', '.join(missing)}")
        print("\n📝 Setup Instructions:")
        print("   1. Sign up at https://www.twilio.com")
        print("   2. Get your Account SID and Auth Token from console")
        print("   3. Buy a phone number or use trial number")
        print("   4. Add to .env:")
        print("      TWILIO_ACCOUNT_SID=ACxxxxx")
        print("      TWILIO_AUTH_TOKEN=your_auth_token")
        print("      TWILIO_PHONE_NUMBER=+1234567890")
        return False

    print(f"✅ PASS: All Twilio credentials found")
    print(f"   Account SID: {TWILIO_ACCOUNT_SID[:10]}...")
    print(f"   From Number: {TWILIO_PHONE_NUMBER}")

    # Try to import and test Twilio
    try:
        from twilio.rest import Client

        client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

        print("\n🔌 Testing Twilio API connection...")

        # Verify account by fetching account details
        account = client.api.accounts(TWILIO_ACCOUNT_SID).fetch()

        print(f"✅ PASS: Connected to Twilio account")
        print(f"   Account Status: {account.status}")
        print(f"   Account Name: {account.friendly_name}")

        # Verify phone number
        try:
            phone_number = client.incoming_phone_numbers.list(
                phone_number=TWILIO_PHONE_NUMBER
            )

            if phone_number:
                print(f"✅ PASS: Phone number {TWILIO_PHONE_NUMBER} verified")
            else:
                print(
                    f"⚠️  WARN: Phone number {TWILIO_PHONE_NUMBER} not found in account"
                )
                print("   Make sure you own this number in Twilio")

        except Exception as e:
            print(f"⚠️  WARN: Could not verify phone number - {e}")

        return True

    except ImportError:
        print("❌ FAIL: twilio library not installed")
        print("\n📝 Installation:")
        print("   pip install twilio")
        return False

    except Exception as e:
        print(f"❌ FAIL: Twilio configuration error - {e}")
        print("   Check your Account SID and Auth Token")
        return False


def print_test_email_instructions():
    """Print instructions for manual email test"""
    print("\n" + "=" * 60)
    print("MANUAL TEST: Send Test Email")
    print("=" * 60)
    print(
        """
To send a test email manually, run:

    python execution/send_test_email.py

Or use this Python code:

    import resend
    resend.api_key = "YOUR_API_KEY"
    
    resend.Emails.send({
        "from": "noreply@yourdomain.com",
        "to": "your-email@example.com",
        "subject": "Test Email from Wedding Planner",
        "html": "<h1>Test Successful!</h1><p>Email system working.</p>"
    })
    """
    )


def print_test_sms_instructions():
    """Print instructions for manual SMS test"""
    print("\n" + "=" * 60)
    print("MANUAL TEST: Send Test SMS")
    print("=" * 60)
    print(
        """
To send a test SMS manually, run:

    python execution/send_test_sms.py

Or use this Python code:

    from twilio.rest import Client
    
    client = Client("ACCOUNT_SID", "AUTH_TOKEN")
    
    message = client.messages.create(
        body="Test SMS from Wedding Planner App",
        from_="+1234567890",  # Your Twilio number
        to="+1234567890"      # Your verified number
    )
    
    print(f"Message sent: {message.sid}")
    """
    )


def main():
    """Run all communication configuration tests"""
    print("\n")
    print("=" * 60)
    print("TEST SUITES 3.1 & 3.2: COMMUNICATION PROVIDER SETUP")
    print("=" * 60)
    print()

    results = []

    # Test Email
    email_ok = test_resend_config()
    results.append(email_ok)

    # Test SMS
    sms_ok = test_twilio_config()
    results.append(sms_ok)

    # Print manual test instructions
    if email_ok:
        print_test_email_instructions()

    if sms_ok:
        print_test_sms_instructions()

    # Summary
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)

    if all(results):
        print("✅ OVERALL RESULT: PASS - Email & SMS configured")
        print("\n📋 Next Steps:")
        print("   1. Run manual email test")
        print("   2. Run manual SMS test")
        print("   3. Verify delivery")
        print("   4. Proceed to integration testing")
        sys.exit(0)
    else:
        print("❌ OVERALL RESULT: FAIL - Configuration incomplete")
        print("\n📋 Action Required:")
        if not email_ok:
            print("   - Set up Resend (email provider)")
        if not sms_ok:
            print("   - Set up Twilio (SMS provider)")
        sys.exit(1)


if __name__ == "__main__":
    main()
