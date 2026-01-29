import re

URL_PATTERN = re.compile(r"https?://\S+")
OTP_PATTERN = re.compile(r"\b\d{4,6}\b")
MONEY_PATTERN = re.compile(r"(₹|\$)\s?\d+")