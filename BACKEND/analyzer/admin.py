from django.contrib import admin
from .models import ScamCheck, ScamReport, Scan, QuizQuestion, QuizAttempt

@admin.register(ScamCheck)
class ScamCheckAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'risk_level',
        'score',
        'created_at'
    )

    list_filter = (
        'risk_level',
        'created_at'
    )

    search_fields = (
        'message',
    )


@admin.register(ScamReport)
class ScamReportAdmin(admin.ModelAdmin):
    list_display = (
        'report_id',
        'reporter_name',
        'scam_type',
        'platform',
        'is_reviewed',
        'submitted_at',
    )

    list_filter = (
        'scam_type',
        'platform',
        'is_reviewed',
        'submitted_at',
    )

    search_fields = (
        'report_id',
        'reporter_name',
        'reporter_email',
        'scam_content',
    )

    readonly_fields = (
        'report_id',
        'submitted_at',
        'created_at',
        'scam_content',
    )

    fieldsets = (
        ('Report Information', {
            'fields': ('report_id', 'submitted_at', 'created_at', 'is_reviewed')
        }),
        ('Reporter Details', {
            'fields': ('reporter_name', 'reporter_email', 'reporter_mobile')
        }),
        ('Scam Details', {
            'fields': ('scam_type', 'platform', 'scam_content', 'screenshot_path')
        }),
        ('Review Notes', {
            'fields': ('review_notes',)
        }),
    )

    actions = ['mark_as_reviewed']

    def mark_as_reviewed(self, request, queryset):
        updated = queryset.update(is_reviewed=True)
        self.message_user(request, f'{updated} reports marked as reviewed.')
    mark_as_reviewed.short_description = 'Mark selected reports as reviewed'



    ordering = ('-created_at',)


@admin.register(Scan)
class ScanAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'scan_type', 'risk_level', 'risk_score', 'created_at')
    list_filter = ('scan_type', 'risk_level', 'created_at')
    search_fields = ('content',)
    ordering = ('-created_at',)


@admin.register(QuizQuestion)
class QuizQuestionAdmin(admin.ModelAdmin):
    list_display = ('id', 'question', 'category', 'difficulty', 'created_at')
    list_filter = ('category', 'difficulty')
    search_fields = ('question',)


@admin.register(QuizAttempt)
class QuizAttemptAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'score', 'total_questions', 'completed_at')
    list_filter = ('completed_at',)
    ordering = ('-completed_at',)
