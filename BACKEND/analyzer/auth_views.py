from django.contrib.auth.models import User
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods


def get_user_from_request(request):
    auth_header = request.META.get("HTTP_AUTHORIZATION") or ""
    if not auth_header.startswith("Token "):
        return None
    key = auth_header[6:].strip()
    try:
        return Token.objects.get(key=key).user
    except Token.DoesNotExist:
        return None


def _user_response(user, token=None):
    data = {
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email or "",
        }
    }
    if token:
        data["token"] = token.key
    return data


@csrf_exempt
@api_view(["POST", "OPTIONS"])
@require_http_methods(["POST", "OPTIONS"])
def register(request):
    if request.method == "OPTIONS":
        return Response(status=200)
    username = (request.data.get("username") or "").strip()
    email = (request.data.get("email") or "").strip()
    password = request.data.get("password") or ""

    if not username or not password:
        return Response({"error": "Username and password are required"}, status=400)
    if User.objects.filter(username__iexact=username).exists():
        return Response({"error": "Username already taken"}, status=400)
    if email and User.objects.filter(email__iexact=email).exists():
        return Response({"error": "Email already registered"}, status=400)
    if len(password) < 8:
        return Response({"error": "Password must be at least 8 characters"}, status=400)

    user = User.objects.create_user(username=username, email=email or "", password=password)
    token, _ = Token.objects.get_or_create(user=user)
    return Response(_user_response(user, token), status=201)


@csrf_exempt
@api_view(["POST", "OPTIONS"])
@require_http_methods(["POST", "OPTIONS"])
def login(request):
    if request.method == "OPTIONS":
        return Response(status=200)
    username = (request.data.get("username") or "").strip()
    password = request.data.get("password") or ""

    if not username or not password:
        return Response({"error": "Username and password are required"}, status=400)

    from django.contrib.auth import authenticate
    user = authenticate(request, username=username, password=password)
    if not user:
        return Response({"error": "Invalid username or password"}, status=401)

    token, _ = Token.objects.get_or_create(user=user)
    return Response(_user_response(user, token), status=200)


@csrf_exempt
@api_view(["GET", "OPTIONS"])
@require_http_methods(["GET", "OPTIONS"])
def me(request):
    if request.method == "OPTIONS":
        return Response(status=200)
    auth_header = request.META.get("HTTP_AUTHORIZATION") or ""
    if not auth_header.startswith("Token "):
        return Response({"error": "Authorization token required"}, status=401)
    key = auth_header[6:].strip()
    try:
        token = Token.objects.get(key=key)
        return Response(_user_response(token.user))
    except Token.DoesNotExist:
        return Response({"error": "Invalid token"}, status=401)


def _generate_code():
    import random
    return "".join(str(random.randint(0, 9)) for _ in range(6))


@csrf_exempt
@api_view(["POST", "OPTIONS"])
@require_http_methods(["POST", "OPTIONS"])
def recovery_request(request):
    if request.method == "OPTIONS":
        return Response(status=200)
    from .models import PasswordResetCode
    from django.utils import timezone
    from django.core.mail import send_mail
    from django.conf import settings
    email = (request.data.get("email") or "").strip().lower()
    if not email:
        return Response({"error": "Email is required"}, status=400)
    try:
        user = User.objects.get(email__iexact=email)
    except User.DoesNotExist:
        return Response({"error": "No account found with this email"}, status=404)
    PasswordResetCode.objects.filter(email__iexact=email).delete()
    code = _generate_code()
    expires_at = timezone.now() + timezone.timedelta(minutes=15)
    PasswordResetCode.objects.create(email=user.email, code=code, expires_at=expires_at)
    subject = "ScamShield – Password recovery code"
    body = f"Your recovery code is: {code}\n\nIt expires in 15 minutes.\n\nIf you did not request this, ignore this email."
    try:
        send_mail(subject, body, getattr(settings, "DEFAULT_FROM_EMAIL", "noreply@scamshield.com"), [user.email], fail_silently=False)
    except Exception as e:
        print(f"Recovery email send error: {e}")
    return Response({"message": "Recovery code sent to your email"})


@csrf_exempt
@api_view(["POST", "OPTIONS"])
@require_http_methods(["POST", "OPTIONS"])
def recovery_verify(request):
    if request.method == "OPTIONS":
        return Response(status=200)
    from .models import PasswordResetCode
    from django.utils import timezone
    email = (request.data.get("email") or "").strip().lower()
    code = (request.data.get("code") or "").strip()
    new_password = request.data.get("new_password") or ""
    if not email or not code or not new_password:
        return Response({"error": "Email, code and new password are required"}, status=400)
    if len(new_password) < 8:
        return Response({"error": "Password must be at least 8 characters"}, status=400)
    try:
        rec = PasswordResetCode.objects.get(email__iexact=email, code=code)
    except PasswordResetCode.DoesNotExist:
        return Response({"error": "Invalid or expired code"}, status=400)
    if timezone.now() > rec.expires_at:
        rec.delete()
        return Response({"error": "Code has expired"}, status=400)
    try:
        user = User.objects.get(email__iexact=email)
    except User.DoesNotExist:
        return Response({"error": "Account not found"}, status=400)
    user.set_password(new_password)
    user.save()
    rec.delete()
    return Response({"message": "Password updated. You can now log in."})


@csrf_exempt
@api_view(["POST", "OPTIONS"])
@require_http_methods(["POST", "OPTIONS"])
def change_password(request):
    if request.method == "OPTIONS":
        return Response(status=200)
    user = get_user_from_request(request)
    if not user:
        return Response({"error": "Authorization required"}, status=401)
    old_password = request.data.get("old_password") or ""
    new_password = request.data.get("new_password") or ""
    if not old_password or not new_password:
        return Response({"error": "Current and new password are required"}, status=400)
    if len(new_password) < 8:
        return Response({"error": "New password must be at least 8 characters"}, status=400)
    from django.contrib.auth import authenticate
    if not authenticate(request, username=user.username, password=old_password):
        return Response({"error": "Current password is incorrect"}, status=400)
    user.set_password(new_password)
    user.save()
    return Response({"message": "Password updated"})
