from app.utils.keywords import SCAM_KEYWORDS
from app.utils.patterns import URL_PATTERN, OTP_PATTERN, MONEY_PATTERN

def analyze_message(message: str):
    text = message.lower()
    score = 0
    reasons = []

    # Keyword analysis
    for keyword, weight in SCAM_KEYWORDS.items():
        if keyword in text:
            score += weight
            reasons.append(f"Suspicious keyword detected: '{keyword}'")

    # URL detection
    if URL_PATTERN.search(text):
        score += 25
        reasons.append("Contains suspicious link")

    # OTP detection
    if OTP_PATTERN.search(text):
        score += 20
        reasons.append("Contains OTP-like number")

    # Money detection
    if MONEY_PATTERN.search(text):
        score += 20
        reasons.append("Mentions money/payment")

    # Risk classification
    if score >= 70:
        risk = "High Risk Scam"
    elif score >= 35:
        risk = "Suspicious"
    else:
        risk = "Safe"

    advice = []
    if risk != "Safe":
        advice = [
            "Do not click unknown links",
            "Never share OTP or passwords",
            "Verify with official sources"
        ]

    return {
        "risk_level": risk,
        "scam_score": min(score, 100),
        "reasons": reasons,
        "advice": advice
    }