"""
Budget Calculator Script
Layer 3 Execution: Deterministic budget calculations
"""

from typing import Dict, List

BUDGET_ALLOCATION = {
    'Venue': 0.30, 'Catering': 0.25, 'Photography': 0.10, 'Videography': 0.05,
    'Music/DJ': 0.05, 'Flowers': 0.08, 'Attire': 0.05, 'Cake': 0.02,
    'Invitations': 0.02, 'Transportation': 0.02, 'Hair & Makeup': 0.02,
    'Decor': 0.02, 'Favors': 0.01, 'Officiant': 0.01
}

def calculate_recommended_budget(total_budget: float, guest_count: int = 100) -> Dict[str, float]:
    """Calculate recommended budget allocation per category."""
    recommendations = {}
    for category, pct in BUDGET_ALLOCATION.items():
        amount = total_budget * pct
        if category == 'Catering':
            amount = (amount / 100) * guest_count
        recommendations[category] = round(amount, 2)
    recommendations['Buffer'] = round(total_budget - sum(recommendations.values()), 2)
    return recommendations

def analyze_budget_health(total_budget: float, budget_items: List[Dict]) -> Dict:
    """Analyze current budget health."""
    total_actual = sum(item.get('actualCost', 0) for item in budget_items)
    total_paid = sum(item.get('paid', 0) for item in budget_items)

    if total_actual > total_budget:
        status = 'critical'
    elif total_actual > total_budget * 0.9:
        status = 'warning'
    else:
        status = 'healthy'

    return {
        'status': status,
        'total_budget': total_budget,
        'total_spent': total_actual,
        'total_paid': total_paid,
        'remaining': total_budget - total_actual,
        'unpaid': total_actual - total_paid
    }

if __name__ == "__main__":
    print("Budget Calculator - Layer 3 Execution")
    print("\nRecommended budget for $30,000:")
    for cat, amt in calculate_recommended_budget(30000).items():
        print(f"  {cat}: ${amt:,.2f}")
