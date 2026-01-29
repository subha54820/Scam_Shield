# Generated manually

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('analyzer', '0004_seed_quiz_questions'),
    ]

    operations = [
        migrations.CreateModel(
            name='PasswordResetCode',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('email', models.EmailField(max_length=254)),
                ('code', models.CharField(max_length=6)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('expires_at', models.DateTimeField()),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
        migrations.AddIndex(
            model_name='passwordresetcode',
            index=models.Index(fields=['email'], name='analyzer_pa_email_9a2b1c_idx'),
        ),
        migrations.AddIndex(
            model_name='passwordresetcode',
            index=models.Index(fields=['code'], name='analyzer_pa_code_8c3d2e_idx'),
        ),
    ]
