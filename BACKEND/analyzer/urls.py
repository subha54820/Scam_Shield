from django.urls import path
from .views import (
    scam_analyzer,
    get_stats,
    report_scam,
    link_check,
    quiz_questions,
    quiz_submit,
    quiz_history,
    message_history,
    link_history,
    user_profile,
    user_stats,
    report_my_reports,
)
from .auth_views import register, login, me, recovery_request, recovery_verify, change_password

urlpatterns = [
    path("analyze/", scam_analyzer),
    path("stats/", get_stats),
    path("report-scam/", report_scam),
    path("auth/register/", register),
    path("auth/login/", login),
    path("auth/me/", me),
    path("auth/recovery/request/", recovery_request),
    path("auth/recovery/verify/", recovery_verify),
    path("auth/change-password/", change_password),
    path("link/check/", link_check),
    path("quiz/questions/", quiz_questions),
    path("quiz/submit/", quiz_submit),
    path("quiz/history/", quiz_history),
    path("message/history/", message_history),
    path("link/history/", link_history),
    path("user/profile/", user_profile),
    path("user/stats/", user_stats),
    path("report/my-reports/", report_my_reports),
]
