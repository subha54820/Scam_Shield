from django.core.management.base import BaseCommand
from django.core.mail import send_mail
from django.conf import settings


class Command(BaseCommand):
    help = "Send a test email to verify SMTP (report emails go to ananta.evince@gmail.com)"

    def handle(self, *args, **options):
        backend = getattr(settings, "EMAIL_BACKEND", "")
        user = getattr(settings, "EMAIL_HOST_USER", "")
        has_pass = bool(getattr(settings, "EMAIL_HOST_PASSWORD", ""))
        recipients = getattr(settings, "SCAMSHIELD_REPORT_EMAILS", [])

        self.stdout.write(f"EMAIL_BACKEND: {backend}")
        self.stdout.write(f"EMAIL_HOST_USER: {user}")
        self.stdout.write(f"EMAIL_PASS set: {has_pass}")
        self.stdout.write(f"Recipients: {recipients}")

        if "console" in backend:
            self.stdout.write(self.style.WARNING("Using console backend - emails are printed here, not sent. Set EMAIL_PASS in .env (Gmail App Password)."))
            send_mail(
                subject="[Test] ScamShield report email",
                message="This is a test. If you use SMTP, this would go to your inbox.",
                from_email=user or "noreply@test.com",
                recipient_list=recipients or ["ananta.evince@gmail.com"],
                fail_silently=False,
            )
            self.stdout.write(self.style.SUCCESS("Check the output above for the 'email' content (console backend)."))
            return

        if not recipients:
            self.stdout.write(self.style.ERROR("No SCAMSHIELD_REPORT_EMAILS in settings."))
            return

        try:
            send_mail(
                subject="[Test] ScamShield report email",
                message="This is a test. If you see this in your inbox, report emails will work.",
                from_email=user,
                recipient_list=recipients,
                fail_silently=False,
            )
            self.stdout.write(self.style.SUCCESS(f"Test email sent to {recipients}. Check your inbox (and spam)."))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Failed: {e}"))
            self.stdout.write(
                "Gmail requires an App Password (not your normal password): "
                "Google Account -> Security -> 2-Step Verification -> App passwords -> generate for Mail."
            )
