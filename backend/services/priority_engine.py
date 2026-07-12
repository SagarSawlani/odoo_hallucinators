# services/priority_engine.py

def calculate_priority(criticality: str, acquisition_cost: float, blocks_work: bool) -> tuple[str, list[str]]:
    score = 0
    reasons = []

    criticality_points = {"Low": 0, "Medium": 1, "High": 2, "Critical": 3}
    c_points = criticality_points.get(criticality, 0)
    score += c_points
    if criticality in ("High", "Critical"):
        reasons.append(f"{criticality} criticality asset")

    if acquisition_cost >= 100000:
        score += 2
        reasons.append("High-value asset (₹1L+)")
    elif acquisition_cost >= 25000:
        score += 1
        reasons.append("Moderate-value asset (₹25K+)")

    if blocks_work:
        score += 2
        reasons.append("Employee work blocked")

    if score >= 6:
        priority = "Critical"
    elif score >= 4:
        priority = "High"
    elif score >= 2:
        priority = "Medium"
    else:
        priority = "Low"

    # Floor rule: blocking work can never be scored below High, regardless of point total
    priority_rank = {"Low": 0, "Medium": 1, "High": 2, "Critical": 3}
    if blocks_work and priority_rank[priority] < priority_rank["High"]:
        priority = "High"
        if "Employee work blocked" not in reasons:
            reasons.append("Employee work blocked")
        reasons.append("Escalated to High: work-blocking issues are never rated below High")

    if not reasons:
        reasons.append("No significant risk factors identified")

    return priority, reasons