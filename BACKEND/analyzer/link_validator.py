import re
import ssl
import socket
from urllib.parse import urlparse


SUSPICIOUS_TLDS = (".tk", ".xyz", ".ml", ".ga", ".cf", ".gq", ".work", ".top")
SUSPICIOUS_KEYWORDS = ["login", "verify", "secure", "account", "bank", "pay", "update"]


def check_ssl(domain: str, timeout: int = 5) -> bool:
    try:
        context = ssl.create_default_context()
        with socket.create_connection((domain, 443), timeout=timeout) as sock:
            with context.wrap_socket(sock, server_hostname=domain) as ssock:
                return True
    except Exception:
        return False


def validate_url(url: str) -> dict:
    result = {
        "is_valid": False,
        "is_safe": True,
        "domain": None,
        "ssl_valid": False,
        "risk_level": "SAFE",
        "risk_score": 0,
        "red_flags": [],
        "analysis": "",
    }
    url = (url or "").strip()
    if not url:
        result["red_flags"].append("URL is required")
        result["analysis"] = "Invalid or missing URL."
        return result
    if not url.startswith(("http://", "https://")):
        result["red_flags"].append("URL must start with http:// or https://")
        result["analysis"] = "Invalid URL scheme."
        return result
    try:
        parsed = urlparse(url)
        domain = (parsed.netloc or "").lower().split(":")[0]
        if not domain:
            result["red_flags"].append("Invalid domain")
            result["analysis"] = "Could not parse domain."
            return result
        result["domain"] = domain
        result["is_valid"] = True
    except Exception as e:
        result["red_flags"].append(f"Invalid URL: {str(e)}")
        result["analysis"] = "URL could not be parsed."
        return result

    risk_score = 0
    if parsed.scheme == "https":
        result["ssl_valid"] = check_ssl(domain)
        if not result["ssl_valid"]:
            result["red_flags"].append("SSL certificate invalid or missing")
            risk_score += 25
    else:
        result["red_flags"].append("No HTTPS encryption")
        risk_score += 30

    for tld in SUSPICIOUS_TLDS:
        if domain.endswith(tld) or (tld in domain and domain.rfind(tld) == len(domain) - len(tld)):
            result["red_flags"].append(f"Suspicious domain extension ({tld})")
            risk_score += 35
            break

    path_lower = (parsed.path or "").lower()
    for kw in SUSPICIOUS_KEYWORDS:
        if kw in path_lower or kw in domain:
            risk_score += 10
            break

    result["risk_score"] = min(100, risk_score)
    if result["risk_score"] >= 70:
        result["risk_level"] = "DANGEROUS"
        result["is_safe"] = False
        result["analysis"] = "This link has multiple red flags. Do not visit or enter any personal information."
    elif result["risk_score"] >= 40:
        result["risk_level"] = "SUSPICIOUS"
        result["is_safe"] = False
        result["analysis"] = "This link shows suspicious characteristics. Proceed with caution."
    else:
        result["risk_level"] = "SAFE"
        result["analysis"] = "No major red flags detected. Always verify the sender before clicking links."

    return result
