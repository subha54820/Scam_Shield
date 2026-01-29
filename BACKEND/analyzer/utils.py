import re

# Odia Scam Keywords Database
ODIA_SCAM_KEYWORDS = {
    "urgency": {
        "words": ["ତାଡି", "ଜରୁରି", "ତୁରନ୍ତ", "ଶୀଘ୍ର", "ବର୍ତ୍ତମାନ", "ଶେଷ ସুଯୋଗ", "ଶେଷ ଚେତାବନୀ", "୨୪ ଘଣ୍ଟାରେ"],
        "weight": 5,
        "category_name": "Urgency Tactics (Odia)"
    },
    "odia_banking": {
        "words": ["ବ୍ୟାଙ୍କ", "ଖାତା ବନ୍ଦ", "ଆଧାର", "ଯାଞ୍ଚ", "ୟୁପିଆଇ", "ଡେବିଟ", "କ୍ରେଡିଟ", "ପେମେଣ୍ଟ"],
        "weight": 8,
        "category_name": "Banking/Finance (Odia)"
    },
    "odia_otp": {
        "words": ["ଓଟିପି", "ପାସୱାର୍ଡ", "ପିନ", "ସିଭିଭି", "ଲଗଇନ", "ସଂଖ୍ୟା", "ଚେତାବନୀ ସଂକେତ"],
        "weight": 10,
        "category_name": "OTP/Credential (Odia)"
    },
    "odia_money": {
        "words": ["ଟଙ୍କା", "ରୁପି", "ଦେଣ", "ଖର୍ଚ", "ନଗଦ ଫେରିଣ", "ପୁରସ୍କାର", "ବୋନସ"],
        "weight": 6,
        "category_name": "Money/Payment (Odia)"
    },
    "odia_lottery": {
        "words": ["ଭାଗ୍ୟ", "ଲଟରୀ", "ଜିତିଲ", "ପୁରସ୍କାର", "ସମୃଦ୍ଧି", "ମୁକ୍ତ", "ଉପହାର"],
        "weight": 8,
        "category_name": "Lottery/Prize (Odia)"
    },
}

# Hindi (Devanagari) Scam Keywords
HINDI_SCAM_KEYWORDS = {
    "urgency": {
        "words": ["जल्दी", "तुरंत", "अभी", "आखिरी मौका", "24 घंटे", "तत्काल", "अंतिम"],
        "weight": 5,
        "category_name": "Urgency Tactics (Hindi)"
    },
    "hindi_banking": {
        "words": ["बैंक", "खाता बंद", "आधार", "यूपीआई", "डेबिट", "क्रेडिट", "भुगतान", "लॉगिन", "वेरिफाई"],
        "weight": 8,
        "category_name": "Banking/Finance (Hindi)"
    },
    "hindi_otp": {
        "words": ["ओटीपी", "पासवर्ड", "पिन", "सीवीवी", "वेरिफिकेशन", "कोड", "लॉगिन विवरण"],
        "weight": 10,
        "category_name": "OTP/Credential (Hindi)"
    },
    "hindi_money": {
        "words": ["रुपया", "पैसा", "शुल्क", "रिफंड", "कैशबैक", "बैंक विवरण", "भुगतान करें"],
        "weight": 6,
        "category_name": "Money/Payment (Hindi)"
    },
    "hindi_lottery": {
        "words": ["बधाई", "जीत", "लॉटरी", "इनाम", "पुरस्कार", "लकी ड्रॉ", "मुफ्त उपहार"],
        "weight": 8,
        "category_name": "Lottery/Prize (Hindi)"
    },
}

# Comprehensive keyword database with WEIGHTED scores (English)
SCAM_KEYWORDS = {
    "urgency": {
        "words": ["urgent", "immediately", "act now", "act fast", "last chance", "limited time", "within 24 hours", "final warning", "expires", "asap", "reply asap"],
        "weight": 5,
        "category_name": "Urgency Tactics"
    },
    "banking": {
        "words": ["bank", "account will be blocked", "account blocked", "account suspended", "account compromised", "compromised",
                 "kyc update", "verify kyc", "upi", "debit card", "credit card", "net banking", "payment failed", "pending transaction"],
        "weight": 8,
        "category_name": "Banking/Finance Alert"
    },
    "otp_credentials": {
        "words": ["otp", "one time password", "verification code", "pin", "password", "cvv", "atm pin", "login details"],
        "weight": 10,  # Critical - credential theft
        "category_name": "OTP/Credential Request"
    },
    "phishing_actions": {
        "words": ["click here", "verify now", "login now", "update now", "secure link", "confirm details", "reset password", "clicking the link", "link below", "click this link"],
        "weight": 7,
        "category_name": "Phishing Action"
    },
    "money_triggers": {
        "words": ["₹", "rupees", "payment", "processing fee", "service charge", "refund", "cashback", "reward amount", "bank details", "deal", "payment information"],
        "weight": 6,
        "category_name": "Money/Payment Request"
    },
    "lottery_prize": {
        "words": ["congratulations", "you have won", "lottery", "lucky draw", "prize", "winner", "free gift", "bonus"],
        "weight": 8,  # Very high - too good to be true
        "category_name": "Lottery/Prize Scam"
    },
    "job_scams": {
        "words": ["work from home", "earn daily", "no investment", "easy income", "registration fee", "part-time job", "remote job", "processing fee", "secure your position"],
        "weight": 7,
        "category_name": "Job Scam"
    },
    "government_legal": {
        "words": ["income tax", "tax refund", "irs", "pan card", "aadhaar", "government notice", "police case", "legal action", "court notice"],
        "weight": 8,
        "category_name": "Government/Legal Threat"
    },
    "delivery_scams": {
        "words": ["package not delivered", "address incomplete", "delivery failed", "update address", "customs charge", "order delayed", "delayed"],
        "weight": 6,
        "category_name": "Delivery/Logistics Scam"
    },
    "social_media_tech": {
        "words": ["account hacked", "unusual login", "security alert", "facebook support", "instagram team", "verify account"],
        "weight": 7,  # High - account compromise fear
        "category_name": "Social Media/Tech Threat"
    }
}

# Scam type detection logic
SCAM_TYPES = {
    "otp_scam": {
        "keywords": ["otp", "verification code", "password", "cvv", "pin"],
        "patterns": ["otp", "code", "verify", "confirm"],
        "description": "OTP/Credential Theft Scam"
    },
    "banking_scam": {
        "keywords": ["bank", "account suspended", "account blocked", "kyc", "upi", "net banking"],
        "patterns": ["bank", "account", "suspended", "blocked"],
        "description": "Banking/Account Scam"
    },
    "phishing": {
        "keywords": ["click here", "verify now", "login now", "secure link", "update now"],
        "patterns": ["click", "link", "verify", "login"],
        "description": "Phishing Attack"
    },
    "lottery_scam": {
        "keywords": ["congratulations", "won", "lottery", "prize", "winner", "bonus"],
        "patterns": ["won", "congratulations", "prize", "lottery"],
        "description": "Lottery/Prize Scam"
    },
    "job_scam": {
        "keywords": ["work from home", "earn daily", "no investment", "easy income", "registration fee"],
        "patterns": ["work from home", "earn", "income", "job"],
        "description": "Job/Work From Home Scam"
    },
    "government_scam": {
        "keywords": ["income tax", "tax refund", "irs", "government", "aadhaar", "pan card", "legal action", "police"],
        "patterns": ["government", "tax", "police", "legal", "irs", "refund"],
        "description": "Government/Tax Impersonation Scam"
    },
    "delivery_scam": {
        "keywords": ["package", "delivery failed", "address incomplete", "customs charge"],
        "patterns": ["package", "delivery", "address"],
        "description": "Delivery/Logistics Scam"
    },
    "account_security_scam": {
        "keywords": ["account hacked", "unusual login", "security alert", "verify account"],
        "patterns": ["hacked", "unusual", "security", "verify"],
        "description": "Account Compromise Scam"
    }
}

def detect_scam_type(text, detected_categories):
    """Detect which type of scam this message represents"""
    text_lower = text.lower()
    scam_type_scores = {}
    
    for scam_type, details in SCAM_TYPES.items():
        score = 0
        for keyword in details["keywords"]:
            if keyword in text_lower:
                score += 2
        for pattern in details["patterns"]:
            if pattern in text_lower:
                score += 1
        scam_type_scores[scam_type] = score
    
    # Return the top matched scam type
    if max(scam_type_scores.values()) > 0:
        top_scam = max(scam_type_scores, key=scam_type_scores.get)
        return top_scam, SCAM_TYPES[top_scam]["description"]
    
    return None, "Suspicious Message"

def generate_explanation(text, detected_keywords, scam_type, scam_type_desc):
    """Generate user-friendly explanation of why message is flagged"""
    text_lower = text.lower()
    explanations = []
    
    # Build explanation based on detected keywords
    if any(word in text_lower for word in SCAM_KEYWORDS["otp_credentials"]["words"]):
        explanations.append("🔐 Asking for sensitive credentials (OTP, password, CVV)")
    
    if any(word in text_lower for word in SCAM_KEYWORDS["urgency"]["words"]):
        explanations.append("⏱️ Using urgency tactics to rush your decision")
    
    if any(word in text_lower for word in SCAM_KEYWORDS["banking"]["words"]):
        explanations.append("🏦 Impersonating your bank or threatening account suspension")
    
    if any(word in text_lower for word in SCAM_KEYWORDS["money_triggers"]["words"]):
        explanations.append("💰 Asking for money or payment")
    
    if any(word in text_lower for word in SCAM_KEYWORDS["lottery_prize"]["words"]):
        explanations.append("🎰 Claiming you won a prize or lottery (too good to be true)")
    
    if any(word in text_lower for word in SCAM_KEYWORDS["job_scams"]["words"]):
        explanations.append("💼 Promising easy money or work-from-home jobs")
    
    if any(word in text_lower for word in SCAM_KEYWORDS["government_legal"]["words"]):
        explanations.append("⚖️ Impersonating government agencies or threatening legal action")
    
    if any(word in text_lower for word in SCAM_KEYWORDS["delivery_scams"]["words"]):
        explanations.append("📦 Fake delivery notification with suspicious requests")
    
    if any(word in text_lower for word in SCAM_KEYWORDS["phishing_actions"]["words"]):
        explanations.append("🔗 Encouraging you to click a suspicious link")
    
    if any(word in text_lower for word in SCAM_KEYWORDS["social_media_tech"]["words"]):
        explanations.append("🔒 Claiming your account is compromised")
    
    # Check for URLs
    if re.search(r'https?://\S+', text):
        explanations.append("⚠️ Contains suspicious links or shortened URLs")
    
    # Check for excessive urgency signals
    if text.count('!') >= 3 or sum(1 for c in text if c.isupper()) > len(text) * 0.3:
        explanations.append("😠 Using excessive capitalization and punctuation (pressure tactic)")
    
    return explanations

def generate_safety_tips(scam_type):
    """Generate scam-specific safety tips"""
    tips_by_type = {
        "otp_scam": [
            "✅ Never share OTP, password, or CVV with anyone",
            "✅ Banks never ask for OTP via messages",
            "✅ Always verify caller identity independently",
            "✅ Report to your bank immediately"
        ],
        "banking_scam": [
            "✅ Your bank will never ask to verify accounts via messages",
            "✅ Visit your bank's official website directly, don't click links",
            "✅ Your account suspension notices come via official channels",
            "✅ Contact your bank using the number on their website"
        ],
        "phishing": [
            "✅ Don't click links from unknown sources",
            "✅ Hover over links to see the real URL before clicking",
            "✅ Use official apps and websites directly",
            "✅ Report phishing attempts to the institution"
        ],
        "lottery_scam": [
            "✅ You can't win a lottery you didn't enter",
            "✅ Legitimate lotteries don't ask for fees upfront",
            "✅ Never send money to claim a prize",
            "✅ Check lottery results on official websites only"
        ],
        "job_scam": [
            "✅ Real jobs don't require upfront registration fees",
            "✅ Legitimate employers won't ask for personal banking info",
            "✅ Research companies on verified job portals",
            "✅ Be wary of 'too good to be true' income promises"
        ],
        "government_scam": [
            "✅ Government doesn't threaten via messages",
            "✅ Visit official government websites directly",
            "✅ Call official numbers from government websites",
            "✅ Real notices arrive via registered mail or portal"
        ],
        "delivery_scam": [
            "✅ Check tracking on the official courier website",
            "✅ Call the courier company directly",
            "✅ Never pay unexpected customs charges upfront",
            "✅ Report suspicious delivery messages"
        ],
        "account_security_scam": [
            "✅ Don't verify your account via sent links",
            "✅ Go to the official app/website directly",
            "✅ Change password only on official platform",
            "✅ Enable 2FA for extra security"
        ]
    }
    
    return tips_by_type.get(scam_type, [
        "✅ Don't share personal information",
        "✅ Don't click suspicious links",
        "✅ Don't send money to unknown persons",
        "✅ Report to relevant authorities"
    ])

def detect_language(text):
    """Detect if text is in Odia, Hindi (Devanagari), or English"""
    alpha_chars = [c for c in text if c.isalpha()]
    total_chars = len(alpha_chars)
    if total_chars == 0:
        return "english"
    odia_count = sum(1 for c in alpha_chars if '\u0B00' <= c <= '\u0B7F')
    devanagari_count = sum(1 for c in alpha_chars if '\u0900' <= c <= '\u097F')
    if odia_count / total_chars > 0.3:
        return "odia"
    if devanagari_count / total_chars > 0.3:
        return "hindi"
    return "english"

def analyze_odia_message(text):
    """Analyze message in Odia language"""
    score = 0
    detected_keywords = []
    detected_categories = []
    
    # Check for Odia keywords
    for category, details in ODIA_SCAM_KEYWORDS.items():
        category_score = 0
        for keyword in details["words"]:
            if keyword in text:
                score += details["weight"]
                category_score += details["weight"]
                if keyword not in detected_keywords:
                    detected_keywords.append(keyword)
        
        if category_score > 0:
            detected_categories.append(details["category_name"])
    
    # Also check for English keywords (commonly mixed in Odia messages)
    text_lower = text.lower()
    for category, details in SCAM_KEYWORDS.items():
        category_score = 0
        for keyword in details["words"]:
            if keyword in text_lower:
                score += details["weight"]
                category_score += details["weight"]
                if keyword not in detected_keywords:
                    detected_keywords.append(keyword)
        
        if category_score > 0 and details["category_name"] not in detected_categories:
            detected_categories.append(details["category_name"])
    
    # Check for URLs
    urls = re.findall(r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+', text)
    if urls:
        score += 5
        detected_keywords.append("suspicious_link")
    
    # Normalize score to 0-100
    normalized_score = min(100, max(0, (score / 50) * 100))
    
    # Determine risk level
    if normalized_score >= 60:
        risk_level = "High Risk Scam"
    elif normalized_score >= 30:
        risk_level = "Suspicious"
    else:
        risk_level = "Safe"
    
    # Generate Odia explanation
    odia_reasons = []
    if any(keyword in text for keyword in ODIA_SCAM_KEYWORDS["odia_otp"]["words"]):
        odia_reasons.append("ଓଟିପି, ପାସୱାର୍ଡ ଅଥବା ସଂବେଦନଶୀଳ ସୂଚନା ଚାହିଁଲା")
    
    if any(keyword in text for keyword in ODIA_SCAM_KEYWORDS["urgency"]["words"]):
        odia_reasons.append("ଶୀଘ୍ର ସିଦ୍ଧାନ୍ତ ନେବାକୁ ଚାପ ଦିଆଗଲା")
    
    if any(keyword in text for keyword in ODIA_SCAM_KEYWORDS["odia_money"]["words"]):
        odia_reasons.append("ଟଙ୍କା ବା ପେମେଣ୍ଟ ଚାହିଁଲା")
    
    if any(keyword in text for keyword in ODIA_SCAM_KEYWORDS["odia_lottery"]["words"]):
        odia_reasons.append("ଲଟରୀ ବା ପୁରସ୍କାର ଜିତିଥିବା ଦାବି")
    
    if urls:
        odia_reasons.append("ଅଜ୍ଞାତ ବା ସଂକ୍ଷିପ୍ତ ଲିଙ୍କ ଥିବା")
    
    # English explanation
    english_reasons = []
    if any(keyword in text_lower for keyword in ["otp", "password", "pin"]):
        english_reasons.append("Asking for sensitive information like OTP or password")
    
    if any(keyword in text_lower for keyword in ["urgent", "immediately", "now"]):
        english_reasons.append("Creating urgency to pressure you")
    
    if urls:
        english_reasons.append("Contains suspicious or unknown links")
    
    if not odia_reasons:
        odia_reasons = ["ଏହି ବାର୍ତ୍ତା ସୁରକ୍ଷିତ ମନେ ହୁଏ"]
    
    if not english_reasons:
        english_reasons = ["This message appears to be safe"]
    
    return {
        "risk_level": risk_level,
        "scam_score": int(normalized_score),
        "detected_keywords": detected_keywords,
        "detected_categories": list(set(detected_categories)),
        "odia_reasons": odia_reasons,
        "english_reasons": english_reasons,
        "language": "odia"
    }


def analyze_hindi_message(text):
    """Analyze message in Hindi (Devanagari) language"""
    score = 0
    detected_keywords = []
    detected_categories = []
    text_lower = text.lower() if text else ""

    for category, details in HINDI_SCAM_KEYWORDS.items():
        category_score = 0
        for keyword in details["words"]:
            if keyword in text or keyword.lower() in text_lower:
                score += details["weight"]
                category_score += details["weight"]
                if keyword not in detected_keywords:
                    detected_keywords.append(keyword)
        if category_score > 0:
            detected_categories.append(details["category_name"])

    text_lower_en = text_lower
    for category, details in SCAM_KEYWORDS.items():
        category_score = 0
        for keyword in details["words"]:
            if keyword in text_lower_en:
                score += details["weight"]
                category_score += details["weight"]
                if keyword not in detected_keywords:
                    detected_keywords.append(keyword)
        if category_score > 0 and details["category_name"] not in detected_categories:
            detected_categories.append(details["category_name"])

    urls = re.findall(r'https?://[^\s<>"\']+', text or "")
    if urls:
        score += 8
        detected_keywords.append("suspicious_link")
        suspicious_tlds = (".tk", ".xyz", ".ml", ".ga", ".cf", ".gq", ".work", ".top")
        for u in urls:
            if any(tld in u.lower() for tld in suspicious_tlds):
                score += 15
                break

    if "suspicious_link" in detected_keywords and len(detected_categories) >= 2:
        score += 24

    normalized_score = min(100, max(0, score))
    has_link_plus = "suspicious_link" in detected_keywords and len(detected_categories) >= 2
    has_three = len(detected_categories) >= 3
    if normalized_score >= 50 or (has_link_plus and normalized_score >= 35) or (has_three and normalized_score >= 30):
        risk_level = "High Risk Scam"
    elif normalized_score >= 25:
        risk_level = "Suspicious"
    else:
        risk_level = "Safe"

    hindi_reasons = []
    if any(kw in text for kw in HINDI_SCAM_KEYWORDS["hindi_otp"]["words"]):
        hindi_reasons.append("ओटीपी, पासवर्ड या संवेदनशील जानकारी मांगी जा रही है")
    if any(kw in text for kw in HINDI_SCAM_KEYWORDS["urgency"]["words"]):
        hindi_reasons.append("जल्दी निर्णय लेने के लिए दबाव बनाया जा रहा है")
    if any(kw in text for kw in HINDI_SCAM_KEYWORDS["hindi_money"]["words"]):
        hindi_reasons.append("पैसे या भुगतान की मांग")
    if any(kw in text for kw in HINDI_SCAM_KEYWORDS["hindi_lottery"]["words"]):
        hindi_reasons.append("लॉटरी या इनाम जीतने का दावा")
    if urls:
        hindi_reasons.append("संदिग्ध या अज्ञात लिंक शामिल है")
    if not hindi_reasons:
        hindi_reasons = ["यह संदेश सुरक्षित लगता है"]

    english_reasons = []
    if any(kw in text_lower_en for kw in ["otp", "password", "pin"]):
        english_reasons.append("Asking for sensitive information like OTP or password")
    if any(kw in text_lower_en for kw in ["urgent", "immediately", "now"]):
        english_reasons.append("Creating urgency to pressure you")
    if urls:
        english_reasons.append("Contains suspicious or unknown links")
    if not english_reasons:
        english_reasons = ["This message appears to be safe"]

    return {
        "risk_level": risk_level,
        "scam_score": int(normalized_score),
        "detected_keywords": detected_keywords,
        "detected_categories": list(set(detected_categories)),
        "hindi_reasons": hindi_reasons,
        "english_reasons": english_reasons,
        "language": "hindi"
    }


def analyze_message(text):
    """Main analysis function with multilingual support"""
    
    # Detect language
    language = detect_language(text)
    
    # Route to appropriate analyzer
    if language == "odia":
        result = analyze_odia_message(text)
        # Add scam type detection for Odia
        result["scam_type"] = "Multilingual Scam (Odia detected)"
        result["explanation_for_user"] = "⚠️ ଏହି ବାର୍ତ୍ତା ସନ୍ଦେହଜନକ | This message appears suspicious based on Odia content analysis."
        result["detailed_reasons"] = result["odia_reasons"]
        result["safety_tips"] = [
            "ଆଧାର ଓ ୟୁପିଆଇ ବିବରଣୀ କଦାପି କାହାକୁ ଦିଅ ନାହିଁ | Never share Aadhaar or UPI details",
            "ଅଜ୍ଞାତ ଲିଙ୍କରେ କ୍ଲିକ କରିବେ ନାହିଁ | Do not click unknown links",
            "ବ୍ୟାଙ୍କ କେବେବି ମେସେଜ୍ ଦେଇ ବ୍ୟକ୍ତିଗତ ସୂଚନା ମାଗେ ନାହିଁ | Banks never ask for personal info via messages"
        ]
        return result

    if language == "hindi":
        result = analyze_hindi_message(text)
        result["scam_type"] = "Multilingual Scam (Hindi detected)"
        result["explanation_for_user"] = "⚠️ यह संदेश संदिग्ध है | This message appears suspicious based on Hindi content analysis."
        result["detailed_reasons"] = result.get("hindi_reasons", result.get("english_reasons", []))
        result["safety_tips"] = [
            "आधार, यूपीआई या पासवर्ड कभी साझा न करें | Never share Aadhaar, UPI or password",
            "अज्ञात लिंक पर क्लिक न करें | Do not click unknown links",
            "बैंक संदेश से व्यक्तिगत जानकारी नहीं मांगते | Banks never ask for personal info via messages"
        ]
        return result

    # Default English analyzer (existing logic)
    """Main analysis function with weighted scoring"""
    score = 0
    detected_keywords = []
    detected_categories = []
    
    text_lower = text.lower()
    
    # Phase 1: Keyword detection with weighted scoring
    for category, details in SCAM_KEYWORDS.items():
        category_score = 0
        for keyword in details["words"]:
            if keyword in text_lower:
                score += details["weight"]
                category_score += details["weight"]
                if keyword not in detected_keywords:
                    detected_keywords.append(keyword)
        
        if category_score > 0:
            detected_categories.append(details["category_name"])
    
    # Phase 2: URL detection and external link scoring
    urls = re.findall(r'https?://[^\s<>"\']+', text)
    if urls:
        score += 8
        detected_keywords.append("suspicious_link")
        suspicious_tlds = (".tk", ".xyz", ".ml", ".ga", ".cf", ".gq", ".work", ".top")
        for u in urls:
            u_lower = u.lower()
            if any(tld in u_lower for tld in suspicious_tlds):
                score += 15
                if "suspicious_tld_in_link" not in detected_keywords:
                    detected_keywords.append("suspicious_tld_in_link")
                break
    
    # Phase 3: Urgency signals (excessive caps, punctuation)
    capitals = sum(1 for c in text if c.isupper())
    if capitals > len(text) * 0.3:
        score += 5
        detected_keywords.append("excessive_capitalization")
    
    exclamations = text.count('!')
    if exclamations >= 3:
        score += 4
        detected_keywords.append("excessive_punctuation")

    if "suspicious_link" in detected_keywords and len(detected_categories) >= 2:
        score += 24
        detected_keywords.append("link_plus_multiple_red_flags")

    if not urls and ("payment" in text_lower or "payment information" in text_lower) and ("link" in text_lower or "click" in text_lower):
        score += 6
        detected_keywords.append("payment_and_link_mentioned")

    category_names = [c for c in detected_categories]
    if "Lottery/Prize Scam" in category_names and "Money/Payment Request" in category_names and "Urgency Tactics" in category_names:
        score += 12
        detected_keywords.append("lottery_money_urgency_combo")

    # Phase 4: Determine scam type
    scam_type, scam_type_desc = detect_scam_type(text, detected_categories)
    
    # Phase 5: Generate explanation and tips
    explanations = generate_explanation(text, detected_keywords, scam_type, scam_type_desc)
    safety_tips = generate_safety_tips(scam_type) if scam_type else []
    
    # Phase 6: Normalize score and determine risk level
    normalized_score = min(score, 100)
    has_link_plus_categories = "suspicious_link" in detected_keywords and len(detected_categories) >= 2
    has_three_categories_with_link = len(detected_categories) >= 3 and "suspicious_link" in detected_keywords
    strong_scam_combo = "lottery_money_urgency_combo" in detected_keywords

    if normalized_score >= 50 or (has_link_plus_categories and normalized_score >= 35) or (has_three_categories_with_link and normalized_score >= 30) or strong_scam_combo:
        risk_level = "High Risk Scam"
    elif normalized_score >= 25:
        risk_level = "Suspicious"
    else:
        risk_level = "Safe"
    
    # Build user-friendly explanation
    if normalized_score >= 30:
        user_explanation = f"⚠️ THIS MESSAGE IS A {scam_type_desc.upper()}\n\n"
        user_explanation += "Why it's suspicious:\n"
        for idx, exp in enumerate(explanations[:4], 1):
            user_explanation += f"{idx}. {exp}\n"
        if len(explanations) > 4:
            user_explanation += f"\n...and {len(explanations)-4} more red flags"
    else:
        user_explanation = "✅ This message appears to be safe. No major scam indicators detected."
    
    return {
        "risk_level": risk_level,
        "scam_score": normalized_score,
        "detected_keywords": list(set(detected_keywords)),
        "scam_type": scam_type_desc,
        "explanation_for_user": user_explanation,
        "detailed_reasons": explanations,
        "safety_tips": safety_tips,
        "detected_categories": list(set(detected_categories))
    }

def send_scam_report_email(scam_report):
    """
    Send scam report to ScamShield team via Gmail
    """
    from django.core.mail import send_mail
    from django.conf import settings
    from html import escape

    def safe(s):
        return escape(str(s)) if s is not None else ""

    try:
        timestamp = scam_report.submitted_at.strftime("%Y-%m-%d %H:%M:%S") if scam_report.submitted_at else ""
        r_id = safe(scam_report.report_id)
        s_type = safe(scam_report.scam_type)
        plat = safe(scam_report.platform)
        content = safe(scam_report.scam_content)
        r_name = safe(scam_report.reporter_name)
        r_email = safe(scam_report.reporter_email) or "Not provided"
        r_mobile = safe(scam_report.reporter_mobile) or "Not provided"

        email_html = f"""
        <html>
            <body style="font-family: Arial, sans-serif; color: #333;">
                <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px;">
                    <h2 style="color: #d32f2f; margin-top: 0;">New Scam Report Received | ScamShield</h2>
                    
                    <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #1976d2; border-bottom: 2px solid #1976d2; padding-bottom: 10px;">Report Details</h3>
                        
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 10px; font-weight: bold; width: 30%;">Report ID:</td>
                                <td style="padding: 10px; color: #1976d2; font-family: monospace; background-color: #f0f0f0;">{r_id}</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px; font-weight: bold;">Date & Time:</td>
                                <td style="padding: 10px;">{timestamp}</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px; font-weight: bold;">Scam Type:</td>
                                <td style="padding: 10px;"><strong>{s_type}</strong></td>
                            </tr>
                            <tr>
                                <td style="padding: 10px; font-weight: bold;">Platform:</td>
                                <td style="padding: 10px;"><strong>{plat}</strong></td>
                            </tr>
                        </table>
                    </div>
                    
                    <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #1976d2; border-bottom: 2px solid #1976d2; padding-bottom: 10px;">Scam Content</h3>
                        <p style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #d32f2f; word-wrap: break-word;">{content}</p>
                    </div>
                    
                    <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #1976d2; border-bottom: 2px solid #1976d2; padding-bottom: 10px;">Reporter Information</h3>
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 10px; font-weight: bold; width: 30%;">Name:</td>
                                <td style="padding: 10px;">{r_name}</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px; font-weight: bold;">Email:</td>
                                <td style="padding: 10px;">{r_email}</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px; font-weight: bold;">Mobile:</td>
                                <td style="padding: 10px;">{r_mobile}</td>
                            </tr>
                        </table>
                    </div>
                    
                    <div style="background-color: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #1565c0; margin-top: 0;">Action Required</h3>
                        <p>Please review and classify this scam report in the admin dashboard.</p>
                        <ul>
                            <li>Verify the authenticity of the report</li>
                            <li>Add to scam database if legitimate</li>
                            <li>Update threat patterns if applicable</li>
                            <li>Contact reporter if more details needed</li>
                        </ul>
                    </div>
                    
                    <div style="text-align: center; margin-top: 30px; color: #999; font-size: 12px;">
                        <p>This is an automated email from ScamShield Report System</p>
                        <p>Report ID: {r_id}</p>
                    </div>
                </div>
            </body>
        </html>
        """
        
        # Create plain text version
        email_text = f"""
New Scam Report Submitted

Report ID: {scam_report.report_id}
Date & Time: {timestamp}

Scam Type: {scam_report.scam_type}
Platform: {scam_report.platform}

Message / Link:
{scam_report.scam_content}

Reporter Details:
Name: {scam_report.reporter_name}
Email: {scam_report.reporter_email or 'Not provided'}
Mobile: {scam_report.reporter_mobile or 'Not provided'}

Action:
Please review and classify this scam.
        """
        
        recipient_emails = getattr(settings, 'SCAMSHIELD_REPORT_EMAILS', ['reports@scamshield.com'])
        from_email = getattr(settings, 'EMAIL_HOST_USER', None) or settings.DEFAULT_FROM_EMAIL
        try:
            send_mail(
                subject=f'New Scam Report | ScamShield [{scam_report.report_id}]',
                message=email_text,
                from_email=from_email,
                recipient_list=recipient_emails,
                html_message=email_html,
                fail_silently=False,
            )
            print(f"✅ Email sent successfully for Report ID: {scam_report.report_id}")
            print(f"   Recipients: {', '.join(recipient_emails)}")
            return True
            
        except Exception as e:
            error_msg = str(e)
            print(f"❌ ERROR: Failed to send email for Report ID: {scam_report.report_id}")
            print(f"   Error: {error_msg}")
            
            # Log specific SMTP errors
            if 'SMTPAuthenticationError' in str(type(e).__name__):
                print("   Issue: Gmail authentication failed")
                print("   Solution: Check EMAIL_PASS environment variable (App Password)")
            elif 'SMTPNotSupportedError' in str(type(e).__name__):
                print("   Issue: TLS not supported")
                print("   Solution: Ensure EMAIL_USE_TLS = True")
            elif 'ConnectionRefusedError' in str(type(e).__name__):
                print("   Issue: Cannot connect to Gmail SMTP server")
                print("   Solution: Check internet connection or firewall settings")
            elif 'SMTPException' in str(type(e).__name__):
                print("   Issue: General SMTP error")
                print("   Solution: Check Gmail account settings and permissions")
            
            raise  # Re-raise so it's caught by the view handler
    
    except Exception as e:
        print(f"❌ Error in send_scam_report_email: {str(e)}")
        return False