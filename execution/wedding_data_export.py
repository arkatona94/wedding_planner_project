"""
Wedding Data Export Script
Layer 3 Execution: Deterministic data export operations
"""

import json
import csv
from datetime import datetime
from typing import Dict, List

def export_guests_to_csv(guests: List[Dict], output_path: str) -> str:
    """Export guest list to CSV format."""
    headers = ['First Name', 'Last Name', 'Email', 'Phone', 'RSVP Status',
               'Meal Choice', 'Dietary Restrictions', 'Plus One', 'Group', 'Table']

    with open(output_path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(headers)
        for guest in guests:
            writer.writerow([
                guest.get('firstName', ''), guest.get('lastName', ''),
                guest.get('email', ''), guest.get('phone', ''),
                guest.get('rsvpStatus', ''), guest.get('mealChoice', ''),
                '; '.join(guest.get('dietaryRestrictions', [])),
                'Yes' if guest.get('plusOne') else 'No',
                guest.get('group', ''), guest.get('tableAssignment', '')
            ])
    return f"Exported {len(guests)} guests to {output_path}"

def export_budget_to_csv(budget_items: List[Dict], output_path: str) -> str:
    """Export budget items to CSV format."""
    headers = ['Category', 'Vendor', 'Estimated', 'Actual', 'Paid', 'Due Date']

    with open(output_path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(headers)
        for item in budget_items:
            writer.writerow([
                item.get('category', ''), item.get('vendor', ''),
                item.get('estimatedCost', 0), item.get('actualCost', 0),
                item.get('paid', 0), item.get('dueDate', '')
            ])
    return f"Exported {len(budget_items)} items to {output_path}"

def export_full_backup(data: Dict, output_path: str) -> str:
    """Export complete wedding data as JSON backup."""
    data['exportedAt'] = datetime.now().isoformat()
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)
    return f"Backup exported to {output_path}"

if __name__ == "__main__":
    print("Wedding Data Export Script - Layer 3 Execution")
