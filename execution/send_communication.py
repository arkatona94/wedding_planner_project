#!/usr/bin/env python3
"""
Send Communication Script
Handles sending emails and SMS messages to wedding guests with logging
"""

import os
import sys
from datetime import datetime
from dotenv import load_dotenv
from supabase import create_client, Client
from typing import List, Dict

# Load environment variables
load_dotenv()

# Supabase
SUPABASE_URL = os.getenv("VITE_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

# Email (Resend)
RESEND_API_KEY = os.getenv("RESEND_API_KEY")
RESEND_FROM_EMAIL = os.getenv("RESEND_FROM_EMAIL", "noreply@yourdomain.com")

# SMS (Twilio)
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_PHONE_NUMBER = os.getenv("TWILIO_PHONE_NUMBER")


def send_email(to_email: str, subject: str, body: str, wedding_id: str = None) -> Dict:
    """Send email using Resend"""

    try:
        import resend

        resend.api_key = RESEND_API_KEY

        # Send email
        result = resend.Emails.send(
            {
                "from": RESEND_FROM_EMAIL,
                "to": to_email,
                "subject": subject,
                "html": body,
            }
        )

        print(f"✅ Email sent to {to_email}")

        return {
            "success": True,
            "recipient": to_email,
            "message_id": result.get("id"),
            "type": "email",
        }

    except Exception as e:
        print(f"❌ Email failed to {to_email}: {e}")
        return {
            "success": False,
            "recipient": to_email,
            "error": str(e),
            "type": "email",
        }


def send_sms(to_phone: str, message: str, wedding_id: str = None) -> Dict:
    """Send SMS using Twilio"""

    try:
        from twilio.rest import Client

        client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

        # Send SMS
        result = client.messages.create(
            body=message, from_=TWILIO_PHONE_NUMBER, to=to_phone
        )

        print(f"✅ SMS sent to {to_phone}")

        return {
            "success": True,
            "recipient": to_phone,
            "message_id": result.sid,
            "type": "sms",
        }

    except Exception as e:
        print(f"❌ SMS failed to {to_phone}: {e}")
        return {"success": False, "recipient": to_phone, "error": str(e), "type": "sms"}


def log_communication(
    supabase: Client,
    wedding_id: str,
    recipient: str,
    comm_type: str,
    subject: str,
    message: str,
    status: str,
    message_id: str = None,
    error: str = None,
):
    """Log communication attempt to database"""

    try:
        supabase.table("communication_logs").insert(
            {
                "wedding_id": wedding_id,
                "type": comm_type,
                "recipient": recipient,
                "subject": subject,
                "message": message,
                "status": status,
                "message_id": message_id,
                "error_message": error,
                "sent_at": datetime.utcnow().isoformat(),
            }
        ).execute()

        print(f"   Logged to database")

    except Exception as e:
        print(f"   ⚠️  Failed to log communication: {e}")


def replace_variables(text: str, variables: Dict[str, str]) -> str:
    """Replace template variables like {{guest_name}} with actual values"""

    for key, value in variables.items():
        placeholder = f"{{{{{key}}}}}"
        text = text.replace(placeholder, str(value))

    return text


def send_bulk_communication(
    wedding_id: str,
    comm_type: str,
    recipients: List[Dict],
    subject: str = "",
    message: str = "",
    variables: Dict[str, str] = None,
):
    """
    Send communications to multiple recipients

    Args:
        wedding_id: UUID of wedding
        comm_type: 'email' or 'sms'
        recipients: List of dicts with 'email' or 'phone' and 'name'
        subject: Email subject (ignored for SMS)
        message: Message body (can include {{variables}})
        variables: Global variables to replace in all messages
    """

    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

    results = []

    for recipient in recipients:
        # Prepare recipient-specific variables
        recipient_vars = variables.copy() if variables else {}
        recipient_vars["guest_name"] = recipient.get("name", "Guest")

        # Replace variables in message
        personalized_message = replace_variables(message, recipient_vars)
        personalized_subject = (
            replace_variables(subject, recipient_vars) if subject else ""
        )

        # Send communication
        if comm_type == "email":
            result = send_email(
                to_email=recipient.get("email"),
                subject=personalized_subject,
                body=personalized_message,
                wedding_id=wedding_id,
            )
        elif comm_type == "sms":
            result = send_sms(
                to_phone=recipient.get("phone"),
                message=personalized_message,
                wedding_id=wedding_id,
            )
        else:
            print(f"❌ Invalid communication type: {comm_type}")
            continue

        # Log to database
        log_communication(
            supabase=supabase,
            wedding_id=wedding_id,
            recipient=recipient.get("email") or recipient.get("phone"),
            comm_type=comm_type,
            subject=personalized_subject,
            message=personalized_message,
            status="sent" if result["success"] else "failed",
            message_id=result.get("message_id"),
            error=result.get("error"),
        )

        results.append(result)

    # Summary
    successful = sum(1 for r in results if r["success"])
    failed = len(results) - successful

    print(f"\n📊 Summary: {successful} sent, {failed} failed")

    return results


def main():
    """Test function - send a test communication"""

    if len(sys.argv) < 4:
        print("Usage: python send_communication.py <type> <recipient> <message>")
        print("Examples:")
        print("  python send_communication.py email test@example.com 'Test message'")
        print("  python send_communication.py sms +1234567890 'Test SMS'")
        sys.exit(1)

    comm_type = sys.argv[1]
    recipient = sys.argv[2]
    message = sys.argv[3]

    if comm_type == "email":
        result = send_email(
            to_email=recipient,
            subject="Test from Wedding Planner",
            body=f"<p>{message}</p>",
        )
    elif comm_type == "sms":
        result = send_sms(to_phone=recipient, message=message)
    else:
        print(f"Invalid type: {comm_type}. Use 'email' or 'sms'")
        sys.exit(1)

    if result["success"]:
        print(f"\n✅ Success! Message ID: {result.get('message_id')}")
        sys.exit(0)
    else:
        print(f"\n❌ Failed: {result.get('error')}")
        sys.exit(1)


if __name__ == "__main__":
    main()
