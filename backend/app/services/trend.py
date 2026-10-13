from typing import List, Dict, Any
from app.models.models import Vital

def analyze_vital_trends(recent_vitals: List[Vital]) -> Dict[str, Any]:
    """
    Analyzes historical window of vitals (e.g. past 5-10 telemetry frames)
    to determine trajectory: STABLE, IMPROVING, or DETERIORATING.
    """
    if not recent_vitals or len(recent_vitals) < 2:
        return {
            "trend": "STABLE",
            "explanation": "Monitoring window insufficient for multi-point trend analysis.",
            "hr_delta": 0.0,
            "spo2_delta": 0.0
        }

    # Order vitals oldest to newest
    sorted_vitals = sorted(recent_vitals, key=lambda v: v.timestamp)
    first = sorted_vitals[0]
    last = sorted_vitals[-1]

    hr_delta = last.heart_rate - first.heart_rate
    spo2_delta = last.spo2 - first.spo2
    resp_delta = last.respiration_rate - first.respiration_rate

    deteriorating_signals = 0
    improving_signals = 0

    explanations = []

    # HR trend
    if hr_delta > 10:
        deteriorating_signals += 1
        explanations.append(f"Heart rate increased by {hr_delta:.0f} bpm over recent window.")
    elif hr_delta < -10:
        improving_signals += 1

    # SpO2 trend
    if spo2_delta < -2.0:
        deteriorating_signals += 2
        explanations.append(f"SpO2 has decreased continuously by {abs(spo2_delta):.1f}% over monitoring window.")
    elif spo2_delta > 2.0:
        improving_signals += 1

    # Respiration trend
    if resp_delta > 4:
        deteriorating_signals += 1
        explanations.append("Respiration rate showing progressive tachypnea trend.")

    if deteriorating_signals >= 2:
        trend_status = "DETERIORATING"
    elif improving_signals >= 2:
        trend_status = "IMPROVING"
    else:
        trend_status = "STABLE"

    if not explanations:
        explanations.append("Physiological parameters remain steady within normal baseline variance.")

    return {
        "trend": trend_status,
        "explanation": " ".join(explanations),
        "hr_delta": round(hr_delta, 1),
        "spo2_delta": round(spo2_delta, 1),
        "resp_delta": round(resp_delta, 1)
    }
