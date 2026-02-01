import os
import json
import sys
from datetime import datetime

def log_communication(guest_id, type, target):
    log_dir = os.path.join(os.getcwd(), '.tmp')
    if not os.path.exists(log_dir):
        os.makedirs(log_dir)
    
    log_file = os.path.join(log_dir, 'communication_logs.txt')
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    log_entry = f"[{timestamp}] SENT {type.upper()} to {target} (Guest ID: {guest_id})\n"
    
    with open(log_file, 'a') as f:
        f.write(log_entry)

def main():
    if len(sys.argv) < 2:
        print("Usage: python send_communication.py <json_payload>")
        return

    try:
        payload = json.loads(sys.argv[1])
        guests = payload.get('guests', [])
        comm_type = payload.get('type', 'reminder')
        
        for guest in guests:
            target = guest.get('email') if comm_type == 'saveTheDate' else guest.get('phone')
            if target:
                log_communication(guest.get('id'), comm_type, target)
                print(f"Processed: {guest.get('firstName')} {guest.get('lastName')}")
            else:
                print(f"Skipped (missing target): {guest.get('firstName')} {guest.get('lastName')}")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
