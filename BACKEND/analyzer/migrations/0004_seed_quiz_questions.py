# Data migration: seed default quiz questions

from django.db import migrations


def seed_questions(apps, schema_editor):
    QuizQuestion = apps.get_model("analyzer", "QuizQuestion")
    questions = [
        {
            "question": "A message says 'URGENT: Your account will be suspended in 24 hours. Click here to verify.' What should you do?",
            "options": [
                {"id": 1, "text": "Click the link immediately to verify", "is_correct": False},
                {"id": 2, "text": "Ignore it and contact the company through official website or phone", "is_correct": True},
                {"id": 3, "text": "Forward it to friends to warn them", "is_correct": False},
                {"id": 4, "text": "Reply with your password to confirm identity", "is_correct": False},
            ],
            "explanation": "Legitimate companies never ask you to verify via links in messages. Always go to the official website directly.",
            "category": "Phishing",
            "difficulty": "easy",
        },
        {
            "question": "You receive an SMS saying you've won a lottery you never entered. They ask for bank details to transfer the prize. This is likely:",
            "options": [
                {"id": 1, "text": "A genuine prize from a random draw", "is_correct": False},
                {"id": 2, "text": "A scam to steal your money or identity", "is_correct": True},
                {"id": 3, "text": "A marketing survey", "is_correct": False},
                {"id": 4, "text": "A government scheme", "is_correct": False},
            ],
            "explanation": "You cannot win a lottery you did not enter. Prize scams often ask for fees or bank details.",
            "category": "Lottery Scam",
            "difficulty": "easy",
        },
        {
            "question": "A link in an email shows 'https://secure-bank-verify.tk/login'. What is a red flag?",
            "options": [
                {"id": 1, "text": "The .tk domain is often used by scammers", "is_correct": True},
                {"id": 2, "text": "It uses HTTPS so it is safe", "is_correct": False},
                {"id": 3, "text": "The word 'secure' appears in the URL", "is_correct": False},
                {"id": 4, "text": "Banks never send login links", "is_correct": False},
            ],
            "explanation": "Suspicious TLDs like .tk, .xyz, .ml are commonly used in phishing. Banks do not send login links via email.",
            "category": "Phishing",
            "difficulty": "medium",
        },
        {
            "question": "Someone you met online asks you to send money for an emergency. They refuse video calls. You should:",
            "options": [
                {"id": 1, "text": "Send money to help quickly", "is_correct": False},
                {"id": 2, "text": "Stop contact and do not send money; it may be a romance scam", "is_correct": True},
                {"id": 3, "text": "Send a small amount to test", "is_correct": False},
                {"id": 4, "text": "Share your bank details for direct transfer", "is_correct": False},
            ],
            "explanation": "Romance scammers often avoid video calls and create urgent reasons to ask for money.",
            "category": "Romance Scam",
            "difficulty": "medium",
        },
        {
            "question": "A job offer asks for an upfront 'registration fee' or 'training fee' before you start. This is:",
            "options": [
                {"id": 1, "text": "Normal for remote jobs", "is_correct": False},
                {"id": 2, "text": "A common sign of a job scam", "is_correct": True},
                {"id": 3, "text": "Required by law", "is_correct": False},
                {"id": 4, "text": "A one-time security deposit", "is_correct": False},
            ],
            "explanation": "Legitimate employers do not ask for upfront fees. Job scams often request payment for 'training' or 'equipment'.",
            "category": "Job Scam",
            "difficulty": "easy",
        },
    ]
    for q in questions:
        QuizQuestion.objects.get_or_create(
            question=q["question"],
            defaults={
                "options": q["options"],
                "explanation": q.get("explanation", ""),
                "category": q.get("category", ""),
                "difficulty": q.get("difficulty", "medium"),
            },
        )


def reverse_seed(apps, schema_editor):
    QuizQuestion = apps.get_model("analyzer", "QuizQuestion")
    QuizQuestion.objects.all().delete()


class Migration(migrations.Migration):

    dependencies = [
        ('analyzer', '0003_scan_quizquestion_quizattempt'),
    ]

    operations = [
        migrations.RunPython(seed_questions, reverse_seed),
    ]
