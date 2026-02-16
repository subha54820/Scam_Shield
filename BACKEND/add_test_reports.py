import os
import django
import uuid
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ScamGuardBackend.settings')
django.setup()

from analyzer.models import ScamReport
from datetime import datetime, timedelta

email = 'jeebankrushnasahu1@gmail.com'

# First, fix the existing report that has no report_id
existing = ScamReport.objects.filter(reporter_email=email, report_id='').first()
if existing:
    existing.report_id = f"SR-{uuid.uuid4().hex[:10].upper()}"
    existing.save()
    print(f'Fixed existing report: {existing.report_id}')

reports = [
    {
        'content': 'Urgent message claiming my account will be suspended if I do not verify my identity immediately',
        'type': 'Phishing Attack',
        'platform': 'Email'
    },
    {
        'content': 'Investment opportunity promising 500% returns in 30 days with crypto trading bot',
        'type': 'Investment Fraud',
        'platform': 'Telegram'
    },
    {
        'content': 'Fake job offer asking for payment to process my application',
        'type': 'Employment Scam',
        'platform': 'LinkedIn'
    }
]

for i, report in enumerate(reports, 1):
    report_id = f"SR-{uuid.uuid4().hex[:10].upper()}"
    ScamReport.objects.create(
        report_id=report_id,
        reporter_email=email,
        scam_content=report['content'],
        scam_type=report['type'],
        platform=report['platform'],
        submitted_at=datetime.now() - timedelta(days=i)
    )
    print(f'Created: {report_id} - {report["type"]}')

total = ScamReport.objects.filter(reporter_email=email).count()
print(f'\nSuccess! Total reports for {email}: {total}')
