"""
Django management command to send weekly activity reports to users
Run with: python manage.py send_weekly_reports
Add --clear-data flag to clear database after sending
"""
from django.core.management.base import BaseCommand
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings
from django.utils import timezone
from django.contrib.auth import get_user_model
from datetime import timedelta
from analyzer.models import Scan, QuizAttempt, ScamReport
from collections import defaultdict

User = get_user_model()


class Command(BaseCommand):
    help = 'Send weekly activity reports to all users via email'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear-data',
            action='store_true',
            help='Clear scan history and reports after sending emails',
        )
        parser.add_argument(
            '--days',
            type=int,
            default=7,
            help='Number of days to include in report (default: 7)',
        )

    def handle(self, *args, **options):
        clear_data = options['clear_data']
        days = options['days']
        
        self.stdout.write(self.style.SUCCESS(f'\n📧 Starting weekly report generation for the last {days} days...\n'))
        
        # Calculate date range
        end_date = timezone.now()
        start_date = end_date - timedelta(days=days)
        
        # Get all users with email addresses
        users = User.objects.filter(email__isnull=False).exclude(email='')
        total_users = users.count()
        
        if total_users == 0:
            self.stdout.write(self.style.WARNING('No users found with email addresses.'))
            return
        
        self.stdout.write(f'Found {total_users} users to send reports to...\n')
        
        emails_sent = 0
        emails_failed = 0
        
        for user in users:
            try:
                # Gather user statistics for the week
                stats = self.get_user_weekly_stats(user, start_date, end_date)
                
                # Skip if user had no activity
                if stats['total_activity'] == 0:
                    self.stdout.write(f'  ⏭️  Skipping {user.email} - no activity')
                    continue
                
                # Send email
                success = self.send_report_email(user, stats, days)
                
                if success:
                    emails_sent += 1
                    self.stdout.write(self.style.SUCCESS(f'  ✅ Sent to {user.email}'))
                else:
                    emails_failed += 1
                    self.stdout.write(self.style.ERROR(f'  ❌ Failed to send to {user.email}'))
            
            except Exception as e:
                emails_failed += 1
                self.stdout.write(self.style.ERROR(f'  ❌ Error processing {user.email}: {str(e)}'))
        
        # Summary
        self.stdout.write('\n' + '='*60)
        self.stdout.write(self.style.SUCCESS(f'✅ Emails sent: {emails_sent}'))
        if emails_failed > 0:
            self.stdout.write(self.style.ERROR(f'❌ Emails failed: {emails_failed}'))
        self.stdout.write('='*60 + '\n')
        
        # Clear data if requested
        if clear_data:
            self.clear_database_data(start_date, end_date)
    
    def get_user_weekly_stats(self, user, start_date, end_date):
        """Calculate user statistics for the given period"""
        
        # Scan statistics
        scans = Scan.objects.filter(
            user=user,
            created_at__gte=start_date,
            created_at__lte=end_date
        )
        
        message_scans = scans.filter(scan_type='message')
        link_scans = scans.filter(scan_type='link')
        
        scams_detected = scans.filter(risk_level__in=['LIKELY_SCAM', 'DANGEROUS']).count()
        suspicious_detected = scans.filter(risk_level='SUSPICIOUS').count()
        safe_detected = scans.filter(risk_level='SAFE').count()
        
        # Quiz statistics
        quiz_attempts = QuizAttempt.objects.filter(
            user=user,
            completed_at__gte=start_date,
            completed_at__lte=end_date
        )
        
        total_quiz_attempts = quiz_attempts.count()
        avg_quiz_score = 0
        if total_quiz_attempts > 0:
            total_score = sum(qa.score for qa in quiz_attempts)
            avg_quiz_score = round((total_score / (total_quiz_attempts * 10)) * 100, 1)
        
        # Report statistics
        reports_submitted = ScamReport.objects.filter(
            reporter_email=user.email,
            submitted_at__gte=start_date,
            submitted_at__lte=end_date
        ).count()
        
        # Recent scans for highlights
        recent_dangerous = scans.filter(risk_level='DANGEROUS').order_by('-created_at')[:3]
        recent_scans_list = [
            {
                'content': scan.content[:100] + ('...' if len(scan.content) > 100 else ''),
                'risk_level': scan.risk_level,
                'scan_type': scan.scan_type,
                'date': scan.created_at.strftime('%b %d, %Y')
            }
            for scan in recent_dangerous
        ]
        
        total_activity = scans.count() + total_quiz_attempts + reports_submitted
        
        return {
            'total_scans': scans.count(),
            'message_scans': message_scans.count(),
            'link_scans': link_scans.count(),
            'scams_detected': scams_detected,
            'suspicious_detected': suspicious_detected,
            'safe_detected': safe_detected,
            'quiz_attempts': total_quiz_attempts,
            'avg_quiz_score': avg_quiz_score,
            'reports_submitted': reports_submitted,
            'recent_scans': recent_scans_list,
            'total_activity': total_activity,
            'start_date': start_date.strftime('%b %d, %Y'),
            'end_date': end_date.strftime('%b %d, %Y'),
        }
    
    def send_report_email(self, user, stats, days):
        """Send the weekly report email to a user"""
        
        subject = f'🛡️ Your ScamShield Weekly Report - {stats["start_date"]} to {stats["end_date"]}'
        
        # Create HTML email content
        html_message = self.create_html_email(user, stats, days)
        
        # Create plain text version
        plain_message = self.create_plain_text_email(user, stats, days)
        
        try:
            send_mail(
                subject=subject,
                message=plain_message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                html_message=html_message,
                fail_silently=False,
            )
            return True
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'    Error: {str(e)}'))
            return False
    
    def create_html_email(self, user, stats, days):
        """Create HTML email content"""
        return f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {{ font-family: 'Arial', sans-serif; background-color: #0a0e27; color: #ffffff; margin: 0; padding: 0; }}
        .container {{ max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #0f1535 0%, #0a0e27 100%); padding: 40px 20px; }}
        .header {{ text-align: center; padding: 30px 0; border-bottom: 2px solid #00d9ff; }}
        .logo {{ font-size: 32px; font-weight: bold; color: #00d9ff; margin-bottom: 10px; }}
        .subtitle {{ color: #94a3b8; font-size: 14px; }}
        .stats-grid {{ display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin: 30px 0; }}
        .stat-card {{ background: rgba(0, 217, 255, 0.1); border: 1px solid rgba(0, 217, 255, 0.3); border-radius: 12px; padding: 20px; text-align: center; }}
        .stat-value {{ font-size: 36px; font-weight: bold; color: #00d9ff; margin-bottom: 5px; }}
        .stat-label {{ color: #94a3b8; font-size: 14px; text-transform: uppercase; }}
        .section {{ margin: 30px 0; padding: 20px; background: rgba(26, 31, 58, 0.5); border-radius: 12px; border: 1px solid rgba(0, 217, 255, 0.2); }}
        .section-title {{ font-size: 20px; color: #00d9ff; margin-bottom: 15px; font-weight: bold; }}
        .highlight {{ background: rgba(255, 59, 48, 0.1); border-left: 4px solid #ff3b30; padding: 10px 15px; margin: 10px 0; border-radius: 6px; }}
        .footer {{ text-align: center; padding: 30px 0; color: #64748b; font-size: 12px; border-top: 1px solid rgba(0, 217, 255, 0.2); margin-top: 30px; }}
        .cta-button {{ display: inline-block; background: #00d9ff; color: #0a0e27; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 20px 0; }}
        .badge {{ display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: bold; margin: 5px 0; }}
        .badge-danger {{ background: rgba(255, 59, 48, 0.2); color: #ff3b30; }}
        .badge-warning {{ background: rgba(255, 149, 0, 0.2); color: #ff9500; }}
        .badge-success {{ background: rgba(52, 199, 89, 0.2); color: #34c759; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🛡️ ScamShield</div>
            <div class="subtitle">Your Weekly Security Report</div>
            <p style="color: #94a3b8; margin-top: 15px;">{stats['start_date']} - {stats['end_date']}</p>
        </div>
        
        <div style="padding: 20px 0;">
            <h2 style="color: #ffffff;">Hi {user.username or 'there'}! 👋</h2>
            <p style="color: #cbd5e1; line-height: 1.6;">
                Here's your security activity summary for the past {days} days. You've been doing great at staying protected online!
            </p>
        </div>
        
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-value">{stats['total_scans']}</div>
                <div class="stat-label">Total Scans</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">{stats['scams_detected']}</div>
                <div class="stat-label">Scams Blocked</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">{stats['quiz_attempts']}</div>
                <div class="stat-label">Quiz Attempts</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">{stats['avg_quiz_score']}%</div>
                <div class="stat-label">Avg Quiz Score</div>
            </div>
        </div>
        
        <div class="section">
            <div class="section-title">📊 Scan Breakdown</div>
            <div style="padding: 10px 0;">
                <div style="margin: 8px 0; color: #cbd5e1;">
                    <span class="badge badge-danger">DANGEROUS: {stats['scams_detected']}</span>
                    <span class="badge badge-warning">SUSPICIOUS: {stats['suspicious_detected']}</span>
                    <span class="badge badge-success">SAFE: {stats['safe_detected']}</span>
                </div>
                <div style="margin-top: 15px; color: #94a3b8; font-size: 14px;">
                    <p>✉️ Message Scans: {stats['message_scans']}</p>
                    <p>🔗 Link Scans: {stats['link_scans']}</p>
                    <p>📝 Reports Submitted: {stats['reports_submitted']}</p>
                </div>
            </div>
        </div>
        
        {self.render_recent_threats(stats['recent_scans'])}
        
        <div style="text-align: center; margin: 40px 0;">
            <a href="http://localhost:5175/profile" class="cta-button">View Full Dashboard</a>
        </div>
        
        <div class="footer">
            <p><strong>ScamShield</strong> - Your Digital Security Guardian</p>
            <p>Keep staying vigilant online! 🛡️</p>
            <p style="margin-top: 15px; font-size: 11px;">
                This is an automated weekly report. Data older than {days} days has been archived.
            </p>
        </div>
    </div>
</body>
</html>
"""
    
    def render_recent_threats(self, recent_scans):
        """Render recent threat highlights"""
        if not recent_scans:
            return ''
        
        threats_html = '<div class="section"><div class="section-title">⚠️ Recent Threats Detected</div>'
        
        for scan in recent_scans:
            threats_html += f"""
            <div class="highlight">
                <div style="font-weight: bold; color: #ff3b30; margin-bottom: 5px;">
                    {scan['risk_level'].replace('_', ' ')} - {scan['scan_type'].upper()}
                </div>
                <div style="color: #cbd5e1; font-size: 14px; margin-bottom: 5px;">
                    {scan['content']}
                </div>
                <div style="color: #64748b; font-size: 12px;">
                    Detected on {scan['date']}
                </div>
            </div>
            """
        
        threats_html += '</div>'
        return threats_html
    
    def create_plain_text_email(self, user, stats, days):
        """Create plain text version of email"""
        return f"""
ScamShield - Your Weekly Security Report
{'='*60}

Hi {user.username or 'there'}!

Here's your security activity summary for {stats['start_date']} - {stats['end_date']}

ACTIVITY SUMMARY
----------------
Total Scans: {stats['total_scans']}
Scams Blocked: {stats['scams_detected']}
Quiz Attempts: {stats['quiz_attempts']}
Average Quiz Score: {stats['avg_quiz_score']}%

SCAN BREAKDOWN
--------------
Dangerous: {stats['scams_detected']}
Suspicious: {stats['suspicious_detected']}
Safe: {stats['safe_detected']}

Message Scans: {stats['message_scans']}
Link Scans: {stats['link_scans']}
Reports Submitted: {stats['reports_submitted']}

{'='*60}
Keep staying vigilant online!
ScamShield - Your Digital Security Guardian
{'='*60}
"""
    
    def clear_database_data(self, start_date, end_date):
        """Clear scan and report data after sending emails"""
        
        self.stdout.write('\n' + self.style.WARNING('🗑️  Starting database cleanup...\n'))
        
        # Delete scans from the period
        scans_deleted = Scan.objects.filter(
            created_at__gte=start_date,
            created_at__lte=end_date
        ).delete()
        
        # Delete reports from the period
        reports_deleted = ScamReport.objects.filter(
            submitted_at__gte=start_date,
            submitted_at__lte=end_date
        ).delete()
        
        # Keep quiz attempts for learning history (optional)
        # Uncomment below if you want to delete quiz attempts too
        # quiz_deleted = QuizAttempt.objects.filter(
        #     completed_at__gte=start_date,
        #     completed_at__lte=end_date
        # ).delete()
        
        self.stdout.write(self.style.SUCCESS(f'  ✅ Deleted {scans_deleted[0]} scans'))
        self.stdout.write(self.style.SUCCESS(f'  ✅ Deleted {reports_deleted[0]} reports'))
        self.stdout.write(self.style.SUCCESS('\n✨ Database cleanup complete!\n'))
