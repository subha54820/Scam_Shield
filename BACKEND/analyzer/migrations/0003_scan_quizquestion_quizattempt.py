# Generated manually for ScamShield doc implementation

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('analyzer', '0002_scamreport'),
    ]

    operations = [
        migrations.CreateModel(
            name='Scan',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('content', models.TextField()),
                ('scan_type', models.CharField(choices=[('message', 'message'), ('link', 'link')], max_length=20)),
                ('risk_level', models.CharField(choices=[('SAFE', 'SAFE'), ('SUSPICIOUS', 'SUSPICIOUS'), ('LIKELY_SCAM', 'LIKELY_SCAM'), ('DANGEROUS', 'DANGEROUS')], max_length=20)),
                ('risk_score', models.IntegerField(default=0)),
                ('red_flags', models.JSONField(blank=True, default=list)),
                ('result_data', models.JSONField(blank=True, default=dict)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('user', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='QuizQuestion',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('question', models.TextField()),
                ('options', models.JSONField()),
                ('explanation', models.TextField(blank=True)),
                ('category', models.CharField(blank=True, max_length=50)),
                ('difficulty', models.CharField(default='medium', max_length=20)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
        ),
        migrations.CreateModel(
            name='QuizAttempt',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('score', models.IntegerField()),
                ('total_questions', models.IntegerField()),
                ('answers', models.JSONField(default=dict)),
                ('completed_at', models.DateTimeField(auto_now_add=True)),
                ('user', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['-completed_at'],
            },
        ),
        migrations.AddIndex(
            model_name='scan',
            index=models.Index(fields=['user'], name='analyzer_sc_user_id_8a1f0d_idx'),
        ),
        migrations.AddIndex(
            model_name='scan',
            index=models.Index(fields=['created_at'], name='analyzer_sc_created_2c8e0a_idx'),
        ),
        migrations.AddIndex(
            model_name='quizattempt',
            index=models.Index(fields=['user'], name='analyzer_qu_user_id_3f2a1b_idx'),
        ),
    ]
