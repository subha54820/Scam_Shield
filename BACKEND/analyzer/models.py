from django.db import models
from django.conf import settings


class ScamCheck(models.Model):
    message = models.TextField()
    risk_level = models.CharField(max_length=20)
    score = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.risk_level} - {self.created_at.date()}"


class Scan(models.Model):
    SCAN_TYPES = [("message", "message"), ("link", "link")]
    RISK_LEVELS = [
        ("SAFE", "SAFE"),
        ("SUSPICIOUS", "SUSPICIOUS"),
        ("LIKELY_SCAM", "LIKELY_SCAM"),
        ("DANGEROUS", "DANGEROUS"),
    ]
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, blank=True
    )
    content = models.TextField()
    scan_type = models.CharField(max_length=20, choices=SCAN_TYPES)
    risk_level = models.CharField(max_length=20, choices=RISK_LEVELS)
    risk_score = models.IntegerField(default=0)
    red_flags = models.JSONField(default=list, blank=True)
    result_data = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["user_id"]),
            models.Index(fields=["created_at"]),
        ]


class QuizQuestion(models.Model):
    question = models.TextField()
    options = models.JSONField()
    explanation = models.TextField(blank=True)
    category = models.CharField(max_length=50, blank=True)
    difficulty = models.CharField(max_length=20, default="medium")
    created_at = models.DateTimeField(auto_now_add=True)


class QuizAttempt(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, blank=True
    )
    score = models.IntegerField()
    total_questions = models.IntegerField()
    answers = models.JSONField(default=dict)
    completed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-completed_at"]
        indexes = [models.Index(fields=["user_id"])]


class PasswordResetCode(models.Model):
    email = models.EmailField()
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    class Meta:
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["email"]), models.Index(fields=["code"])]


class ScamReport(models.Model):
    """Model to store user-submitted scam reports"""
    SCAM_TYPES = [
        ('Phishing', 'Phishing'),
        ('Fake Payment Request', 'Fake Payment Request'),
        ('OTP Scam', 'OTP Scam'),
        ('Romance Scam', 'Romance Scam'),
        ('Investment Fraud', 'Investment Fraud'),
        ('Fake Tech Support', 'Fake Tech Support'),
        ('Malware/Virus', 'Malware/Virus'),
        ('Lottery Scam', 'Lottery Scam'),
        ('Banking Fraud', 'Banking Fraud'),
        ('E-commerce Fraud', 'E-commerce Fraud'),
        ('Job Offer Scam', 'Job Offer Scam'),
        ('Credential Harvesting', 'Credential Harvesting'),
        ('Other', 'Other'),
    ]
    
    PLATFORMS = [
        ('SMS', 'SMS'),
        ('WhatsApp', 'WhatsApp'),
        ('Email', 'Email'),
        ('Website', 'Website'),
        ('Phone Call', 'Phone Call'),
        ('Social Media', 'Social Media'),
        ('Other', 'Other'),
    ]
    
    report_id = models.CharField(max_length=20, unique=True, db_index=True)
    reporter_name = models.CharField(max_length=200, default='Anonymous')
    reporter_email = models.EmailField(blank=True, null=True)
    reporter_mobile = models.CharField(max_length=20, blank=True, null=True)
    scam_content = models.TextField()
    scam_type = models.CharField(max_length=50, choices=SCAM_TYPES)
    platform = models.CharField(max_length=50, choices=PLATFORMS)
    screenshot_path = models.CharField(max_length=500, blank=True, null=True)
    submitted_at = models.DateTimeField(auto_now_add=True)
    is_reviewed = models.BooleanField(default=False)
    review_notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-submitted_at']
        indexes = [
            models.Index(fields=['report_id']),
            models.Index(fields=['submitted_at']),
        ]

    def __str__(self):
        return f"{self.report_id} - {self.scam_type} ({self.submitted_at.date()})"