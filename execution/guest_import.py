"""
Guest Import Script
Layer 3 Execution: Deterministic guest import operations
"""

import csv
from typing import Dict, List
from uuid import uuid4

def parse_csv_guests(file_path: str) -> List[Dict]:
    """Parse guests from a CSV file."""
    guests = []
    with open(file_path, 'r', encoding='utf-8-sig') as f:
        reader = csv.DictReader(f)
        for row in reader:
            headers = {k.lower().replace(' ', ''): k for k in row.keys()}
            guest = {
                'id': str(uuid4()),
                'firstName': row.get(headers.get('firstname', ''), '').strip(),
                'lastName': row.get(headers.get('lastname', ''), '').strip(),
                'email': row.get(headers.get('email', ''), '').strip(),
                'phone': row.get(headers.get('phone', ''), '').strip(),
                'rsvpStatus': 'pending',
                'mealChoice': '',
                'dietaryRestrictions': [],
                'plusOne': False,
                'plusOneName': '',
                'tableAssignment': None,
                'group': row.get(headers.get('group', ''), '').strip(),
                'notes': '',
                'address': {'street': '', 'city': '', 'state': '', 'zipCode': '', 'country': 'USA'}
            }
            if guest['firstName'] or guest['lastName']:
                guests.append(guest)
    return guests

def validate_guests(guests: List[Dict]) -> Dict:
    """Validate imported guests."""
    valid, invalid = [], []
    for guest in guests:
        if guest.get('firstName') and guest.get('lastName'):
            valid.append(guest)
        else:
            invalid.append({'guest': guest, 'reason': 'Missing name'})
    return {'valid': valid, 'invalid': invalid}

if __name__ == "__main__":
    print("Guest Import Script - Layer 3 Execution")
