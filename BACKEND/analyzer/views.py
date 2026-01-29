from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.core.paginator import Paginator
from .utils import analyze_message, send_scam_report_email
from .models import ScamCheck, ScamReport, Scan, QuizQuestion, QuizAttempt, PasswordResetCode
from .auth_views import get_user_from_request
from .link_validator import validate_url as link_validate_url
from django.utils import timezone
from django.utils.html import escape
import uuid
import os
from django.core.files.storage import default_storage

RISK_LEVEL_MAP = {"High Risk Scam": "LIKELY_SCAM", "Suspicious": "SUSPICIOUS", "Safe": "SAFE"}

try:
    import bleach
    def _sanitize(text):
        return bleach.clean(text, tags=[], attributes={}, strip=True)
except ImportError:
    def _sanitize(text):
        return escape(text)

@csrf_exempt
@api_view(['POST', 'OPTIONS'])
@require_http_methods(["POST", "OPTIONS"])
def scam_analyzer(request):
    if request.method == 'OPTIONS':
        return Response(status=200)
    
    text = request.data.get("message", "")

    if not text:
        return Response({
            "error": "Message is required"
        }, status=400)

    result = analyze_message(text)
    doc_risk_level = RISK_LEVEL_MAP.get(result["risk_level"], "SAFE")
    user = get_user_from_request(request)

    try:
        ScamCheck.objects.create(
            message=text,
            risk_level=result["risk_level"],
            score=result["scam_score"]
        )
        if user:
            Scan.objects.create(
                user=user,
                content=text[:5000],
                scan_type="message",
                risk_level=doc_risk_level,
                risk_score=result["scam_score"],
                red_flags=result["detailed_reasons"],
                result_data={"scam_type": result["scam_type"], "detected_categories": result.get("detected_categories", [])},
            )
    except Exception as e:
        print(f"Database save error: {e}")

    response_data = {
        "input_message": text,
        "risk_level": doc_risk_level,
        "scam_score": result["scam_score"],
        "red_flags": result["detailed_reasons"],
        "confidence": min(result["scam_score"], 100),
        "explanation": result["explanation_for_user"],
        "tips": result["safety_tips"],
        "detected_keywords": result["detected_keywords"],
        "scam_type": result["scam_type"],
        "detailed_reasons": result["detailed_reasons"],
        "safety_tips": result["safety_tips"],
        "detected_categories": result.get("detected_categories", []),
    }
    if result.get("language") == "odia":
        response_data["odia_reasons"] = result.get("odia_reasons", [])
        response_data["english_reasons"] = result.get("english_reasons", [])
        response_data["language_detected"] = "odia"
    elif result.get("language") == "hindi":
        response_data["hindi_reasons"] = result.get("hindi_reasons", [])
        response_data["english_reasons"] = result.get("english_reasons", [])
        response_data["language_detected"] = "hindi"
    return Response(response_data)

@csrf_exempt
@api_view(['GET', 'OPTIONS'])
@require_http_methods(["GET", "OPTIONS"])
def get_stats(request):
    if request.method == 'OPTIONS':
        return Response(status=200)
    
    total_checks = ScamCheck.objects.count()
    high_risk = ScamCheck.objects.filter(risk_level="High Risk Scam").count()
    suspicious = ScamCheck.objects.filter(risk_level="Suspicious").count()
    safe = ScamCheck.objects.filter(risk_level="Safe").count()

    return Response({
        "total_checks": total_checks,
        "high_risk": high_risk,
        "suspicious": suspicious,
        "safe": safe
    })

@csrf_exempt
@api_view(['POST', 'OPTIONS'])
@require_http_methods(["POST", "OPTIONS"])
def report_scam(request):
    """Handle scam report submissions"""
    if request.method == 'OPTIONS':
        return Response(status=200)
    
    try:
        # Get form data
        reporter_name = request.POST.get('reporter_name', '').strip()
        email = request.POST.get('email', '').strip()
        mobile_number = request.POST.get('mobile_number', '').strip()
        scam_content = request.POST.get('scam_content', '').strip()
        scam_type = request.POST.get('scam_type', '').strip()
        platform = request.POST.get('platform', '').strip()
        screenshot = request.FILES.get('screenshot', None)
        
        # Validate required fields
        if not scam_content or not scam_type or not platform:
            return Response({
                'error': 'Scam content, type, and platform are required'
            }, status=400)
        
        scam_content_sanitized = _sanitize(scam_content)
        
        # Generate unique Report ID
        report_id = f"SR-{uuid.uuid4().hex[:10].upper()}"
        
        # Save screenshot if provided
        screenshot_path = None
        if screenshot:
            try:
                # Create a unique filename
                filename = f"reports/{report_id}_{screenshot.name}"
                screenshot_path = default_storage.save(filename, screenshot)
            except Exception as e:
                print(f"Screenshot upload error: {e}")
        
        # Create ScamReport object
        scam_report = ScamReport.objects.create(
            report_id=report_id,
            reporter_name=reporter_name or 'Anonymous',
            reporter_email=email or None,
            reporter_mobile=mobile_number or None,
            scam_content=scam_content_sanitized,
            scam_type=scam_type,
            platform=platform,
            screenshot_path=screenshot_path,
        )
        
        email_sent = False
        try:
            email_sent = send_scam_report_email(scam_report)
        except Exception as e:
            print(f"Email sending error: {e}")
        
        return Response({
            'success': True,
            'report_id': report_id,
            'message': 'Your scam report has been submitted successfully.',
            'email_sent': email_sent
        }, status=201)
        
    except Exception as e:
        print(f"Error in report_scam: {str(e)}")
        return Response({
            'error': f'An error occurred: {str(e)}'
        }, status=500)


@csrf_exempt
@api_view(["POST", "OPTIONS"])
@require_http_methods(["POST", "OPTIONS"])
def link_check(request):
    if request.method == "OPTIONS":
        return Response(status=200)
    url = (request.data.get("url") or "").strip()
    if not url:
        return Response({"error": "URL is required"}, status=400)
    result = link_validate_url(url)
    user = get_user_from_request(request)
    if user and result.get("is_valid"):
        try:
            Scan.objects.create(
                user=user,
                content=url,
                scan_type="link",
                risk_level=result["risk_level"],
                risk_score=result["risk_score"],
                red_flags=result["red_flags"],
                result_data=result,
            )
        except Exception as e:
            print(f"Scan save error: {e}")
    return Response(result)


@csrf_exempt
@api_view(["GET", "OPTIONS"])
@require_http_methods(["GET", "OPTIONS"])
def quiz_questions(request):
    if request.method == "OPTIONS":
        return Response(status=200)
    questions = list(
        QuizQuestion.objects.values("id", "question", "options", "explanation", "category", "difficulty")
    )
    return Response({"questions": questions})


@csrf_exempt
@api_view(["POST", "OPTIONS"])
@require_http_methods(["POST", "OPTIONS"])
def quiz_submit(request):
    if request.method == "OPTIONS":
        return Response(status=200)
    answers = request.data.get("answers") or {}
    if not isinstance(answers, dict):
        return Response({"error": "answers must be a map of question_id: answer_id"}, status=400)
    qs = QuizQuestion.objects.all()
    total = qs.count()
    if total == 0:
        return Response({"score": 0, "total": 0, "percentage": 0, "feedback": ["No questions available."]})
    score = 0
    feedback = []
    for q in qs:
        opt = q.options
        if not isinstance(opt, list):
            continue
        correct_id = next((o.get("id") for o in opt if o.get("is_correct")), None)
        user_choice = answers.get(str(q.id))
        if user_choice is not None and str(user_choice) == str(correct_id):
            score += 1
        else:
            if q.explanation:
                feedback.append(q.explanation)
    percentage = round((score / total) * 100) if total else 0
    user = get_user_from_request(request)
    if user:
        try:
            QuizAttempt.objects.create(
                user=user, score=score, total_questions=total, answers=answers
            )
        except Exception as e:
            print(f"QuizAttempt save error: {e}")
    return Response({
        "score": score,
        "total": total,
        "percentage": percentage,
        "feedback": feedback[:5],
    })


@csrf_exempt
@api_view(["GET", "OPTIONS"])
@require_http_methods(["GET", "OPTIONS"])
def quiz_history(request):
    if request.method == "OPTIONS":
        return Response(status=200)
    user = get_user_from_request(request)
    if not user:
        return Response({"error": "Authorization token required"}, status=401)
    qs = QuizAttempt.objects.filter(user=user).order_by("-completed_at")
    meta, items = _paginated(request, qs, 10)
    attempts = [
        {
            "id": a.id,
            "score": a.score,
            "total_questions": a.total_questions,
            "percentage": round((a.score / a.total_questions * 100) if a.total_questions else 0),
            "completed_at": a.completed_at.isoformat(),
        }
        for a in items
    ]
    return Response({"attempts": attempts, **meta})


def _paginated(request, qs, page_size=10):
    page = max(1, int(request.GET.get("page", 1)))
    limit = min(50, max(1, int(request.GET.get("limit", page_size))))
    paginator = Paginator(qs, limit)
    p = paginator.get_page(page)
    return {"page": page, "limit": limit, "total": paginator.count}, list(p)


@csrf_exempt
@api_view(["GET", "OPTIONS"])
@require_http_methods(["GET", "OPTIONS"])
def message_history(request):
    if request.method == "OPTIONS":
        return Response(status=200)
    user = get_user_from_request(request)
    if not user:
        return Response({"error": "Authorization token required"}, status=401)
    qs = Scan.objects.filter(user=user, scan_type="message").order_by("-created_at")
    meta, items = _paginated(request, qs)
    scans = [
        {
            "id": s.id,
            "content": s.content[:200] + ("..." if len(s.content) > 200 else ""),
            "risk_level": s.risk_level,
            "risk_score": s.risk_score,
            "created_at": s.created_at.isoformat(),
        }
        for s in items
    ]
    return Response({"scans": scans, **meta})


@csrf_exempt
@api_view(["GET", "OPTIONS"])
@require_http_methods(["GET", "OPTIONS"])
def link_history(request):
    if request.method == "OPTIONS":
        return Response(status=200)
    user = get_user_from_request(request)
    if not user:
        return Response({"error": "Authorization token required"}, status=401)
    qs = Scan.objects.filter(user=user, scan_type="link").order_by("-created_at")
    meta, items = _paginated(request, qs)
    scans = [
        {
            "id": s.id,
            "content": s.content,
            "risk_level": s.risk_level,
            "risk_score": s.risk_score,
            "created_at": s.created_at.isoformat(),
        }
        for s in items
    ]
    return Response({"scans": scans, **meta})


@csrf_exempt
@api_view(["GET", "PUT", "DELETE", "OPTIONS"])
@require_http_methods(["GET", "PUT", "DELETE", "OPTIONS"])
def user_profile(request):
    if request.method == "OPTIONS":
        return Response(status=200)
    user = get_user_from_request(request)
    if not user:
        return Response({"error": "Authorization token required"}, status=401)
    if request.method == "DELETE":
        from rest_framework.authtoken.models import Token
        Token.objects.filter(user=user).delete()
        user.delete()
        return Response({"message": "Account deleted"}, status=200)
    if request.method == "PUT":
        name = (request.data.get("name") or "").strip()
        email = (request.data.get("email") or "").strip()
        if name and len(name) >= 2 and len(name) <= 150:
            user.username = name
        if email:
            from django.contrib.auth.models import User as AuthUser
            if AuthUser.objects.filter(email__iexact=email).exclude(pk=user.pk).exists():
                return Response({"error": "Email already in use"}, status=400)
            user.email = email
        user.save()
    return Response({
        "user_id": user.id,
        "email": user.email or "",
        "name": user.username,
        "created_at": user.date_joined.isoformat() if user.date_joined else None,
    })


@csrf_exempt
@api_view(["GET", "OPTIONS"])
@require_http_methods(["GET", "OPTIONS"])
def user_stats(request):
    if request.method == "OPTIONS":
        return Response(status=200)
    user = get_user_from_request(request)
    if not user:
        return Response({"error": "Authorization token required"}, status=401)
    scans = Scan.objects.filter(user=user)
    total_scans = scans.count()
    scams_detected = scans.filter(risk_level__in=["LIKELY_SCAM", "DANGEROUS"]).count()
    safe_detected = scans.filter(risk_level="SAFE").count()
    quiz_attempts = QuizAttempt.objects.filter(user=user).order_by("-completed_at")
    quiz_score = quiz_attempts.first().score if quiz_attempts.exists() else 0
    return Response({
        "total_scans": total_scans,
        "scams_detected": scams_detected,
        "safe_detected": safe_detected,
        "quiz_score": quiz_score,
        "join_date": user.date_joined.isoformat() if user.date_joined else None,
    })


@csrf_exempt
@api_view(["GET", "OPTIONS"])
@require_http_methods(["GET", "OPTIONS"])
def report_my_reports(request):
    if request.method == "OPTIONS":
        return Response(status=200)
    user = get_user_from_request(request)
    if not user:
        return Response({"error": "Authorization token required"}, status=401)
    qs = ScamReport.objects.filter(reporter_email=user.email).order_by("-submitted_at")
    if not user.email:
        qs = ScamReport.objects.none()
    meta, items = _paginated(request, qs, 10)
    reports = [
        {
            "report_id": r.report_id,
            "content": r.scam_content[:150] + ("..." if len(r.scam_content) > 150 else ""),
            "scam_type": r.scam_type,
            "platform": r.platform,
            "status": "pending",
            "created_at": r.submitted_at.isoformat(),
        }
        for r in items
    ]
    return Response({"reports": reports, **meta})
