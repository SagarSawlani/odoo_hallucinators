# services/priority_engine.py

import json
from llm import llm

def calculate_priority(criticality: str, acquisition_cost: float, blocks_work: bool, issue_description: str) -> tuple[str, list[str]]:
    score = 0
    reasons = []

    # --- 1. LLM Assessment ---
    try:
        prompt = f"""
You are an expert IT Asset Manager. 
Assess the severity of the following maintenance issue description.
Output a JSON dictionary with exactly two keys:
"score": an integer from 0 to 3 (0=cosmetic/minor, 1=moderate, 2=severe, 3=critical/hazardous).
"reason": a short 5-10 word explanation for the score.

Issue Description: "{issue_description}"
"""
        response = llm.invoke(prompt)
        content = response.content
        # Basic parsing in case the LLM wraps in markdown
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        elif "```" in content:
            content = content.split("```")[1].strip()
            
        assessment = json.loads(content)
        llm_score = assessment.get("score", 0)
        llm_reason = assessment.get("reason", "AI assessment")
        
        score += llm_score
        if llm_score > 0:
            reasons.append(f"AI Assessment (Level {llm_score}): {llm_reason}")
    except Exception as e:
        print(f"LLM Priority parsing failed: {e}")
        # Fallback to rules if LLM fails
        pass

    # --- 2. Static Rules ---
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