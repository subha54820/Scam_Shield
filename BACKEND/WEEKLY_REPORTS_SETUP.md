# ScamShield Weekly Email Reports Setup

## 📧 Overview
This system automatically sends weekly activity reports to all users via email and optionally clears old database records.

## ✨ Features
- Sends personalized weekly reports to each user
- Includes statistics: total scans, scams blocked, quiz scores, etc.
- Beautiful HTML email template with cybersecurity theme
- Shows recent threat detections
- Optional database cleanup after sending
- Skip users with no activity

## 🚀 Quick Start

### 1. Test Email Sending (Manual)
```bash
cd BACKEND
python manage.py send_weekly_reports
```

### 2. Test with Database Cleanup
```bash
python manage.py send_weekly_reports --clear-data
```

### 3. Custom Time Period (e.g., last 14 days)
```bash
python manage.py send_weekly_reports --days 14
```

## ⚙️ Email Configuration

Make sure your email settings are configured in `BACKEND/.env`:

```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@scamshield.com
```

### Getting Gmail App Password:
1. Go to Google Account Settings
2. Security → 2-Step Verification
3. App passwords → Generate new password
4. Copy the 16-character password to `.env` file

## ⏰ Schedule Automatic Reports (Windows)

### Option A: Using Task Scheduler (GUI)

1. **Open Task Scheduler**
   - Press `Win + R`, type `taskschd.msc`, press Enter

2. **Create New Task**
   - Click "Create Basic Task"
   - Name: "ScamShield Weekly Reports"
   - Description: "Send weekly security reports to users"

3. **Set Trigger**
   - Trigger: Weekly
   - Day: Sunday (or preferred day)
   - Time: 9:00 AM (or preferred time)
   - Recur every: 1 week

4. **Set Action**
   - Action: Start a program
   - Program: `C:\Users\ASUS\OneDrive\Desktop\Scam_Shield\BACKEND\run_weekly_reports.bat`
   - Or with cleanup: Add argument `--clear`

5. **Finish**
   - Check "Open Properties" before finish
   - In General tab: Check "Run whether user is logged on or not"
   - Save with admin password

### Option B: Using PowerShell Script

Run this PowerShell command as Administrator:

```powershell
# Navigate to BACKEND folder
cd "C:\Users\ASUS\OneDrive\Desktop\Scam_Shield\BACKEND"

# Create scheduled task
$action = New-ScheduledTaskAction -Execute "python" -Argument "manage.py send_weekly_reports --clear-data" -WorkingDirectory "C:\Users\ASUS\OneDrive\Desktop\Scam_Shield\BACKEND"

$trigger = New-ScheduledTaskTrigger -Weekly -DaysOfWeek Sunday -At 9am

$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable

Register-ScheduledTask -TaskName "ScamShield Weekly Reports" -Action $action -Trigger $trigger -Settings $settings -Description "Send weekly security reports to all ScamShield users"
```

### Option C: Using Cron (Linux/Mac)

Add to crontab (`crontab -e`):

```bash
# Send reports every Sunday at 9 AM
0 9 * * 0 cd /path/to/BACKEND && python manage.py send_weekly_reports --clear-data
```

## 📊 Report Contents

Each user receives an email with:
- **Activity Summary**: Total scans, scams blocked, quiz attempts, avg score
- **Scan Breakdown**: Dangerous, suspicious, and safe detections
- **Scan Types**: Message scans vs link scans
- **Recent Threats**: Last 3 dangerous detections
- **Reports Submitted**: Number of scam reports filed
- **Call to Action**: Link to view full dashboard

## 🗑️ Database Cleanup

When using `--clear-data` flag:
- ✅ **Deleted**: Scan history (Scan model)
- ✅ **Deleted**: Scam reports (ScamReport model)
- ❌ **Kept**: Quiz attempts (for learning history)
- ❌ **Kept**: User accounts and profiles

To also delete quiz attempts, uncomment lines in the command file.

## 🔧 Customization

### Change Report Period
```bash
python manage.py send_weekly_reports --days 30  # Monthly report
```

### Edit Email Template
Open: `BACKEND/analyzer/management/commands/send_weekly_reports.py`
- Modify `create_html_email()` method for HTML design
- Modify `create_plain_text_email()` for text version

### Change Email Frequency
Modify the scheduled task trigger to daily, bi-weekly, or monthly.

## 📝 Command Options

```bash
python manage.py send_weekly_reports [options]

Options:
  --clear-data    Clear scan history and reports after sending emails
  --days N        Number of days to include in report (default: 7)
  --help          Show help message
```

## 🐛 Troubleshooting

### Emails not sending?
1. Check `.env` file has correct EMAIL_USER and EMAIL_PASS
2. Verify Gmail app password is correct (16 characters, no spaces)
3. Test manually: `python manage.py send_weekly_reports`
4. Check console output for error messages

### No emails received?
- Check spam/junk folder
- Verify users have email addresses in database
- Check if users had activity (skipped if zero activity)
- Look at console output for "Sent to [email]" confirmations

### Task Scheduler not running?
- Check task history in Task Scheduler
- Verify Python path is correct in task action
- Ensure task has "Run whether user is logged on or not" checked
- Check `weekly_reports.log` file for execution history

## 📈 Monitoring

Check execution log:
```bash
type BACKEND\weekly_reports.log
```

View last report run:
```bash
python manage.py send_weekly_reports  # Shows detailed output
```

## 🔒 Security Notes

- Email credentials are stored in `.env` file (never commit to git)
- Use Gmail app passwords, not your actual Gmail password
- Consider using a dedicated email account for sending reports
- Review and validate email templates to prevent XSS issues

## 📧 Example Report Preview

Users receive an email like this:

```
Subject: 🛡️ Your ScamShield Weekly Report - Feb 9, 2026 to Feb 16, 2026

Hi John! 👋

Here's your security activity summary for the past 7 days.

┌─────────────────────────────┐
│  Total Scans: 24            │
│  Scams Blocked: 5           │
│  Quiz Attempts: 3           │
│  Avg Quiz Score: 87.5%      │
└─────────────────────────────┘

📊 Scan Breakdown:
• DANGEROUS: 5
• SUSPICIOUS: 8  
• SAFE: 11

• Message Scans: 18
• Link Scans: 6
• Reports Submitted: 2

⚠️ Recent Threats Detected:
[Detailed list of dangerous scans]

[View Full Dashboard Button]
```

## 🎯 Best Practices

1. **Test first**: Run manually before scheduling
2. **Start without cleanup**: Test emails work before adding `--clear-data`
3. **Schedule wisely**: Choose low-traffic times (early morning weekends)
4. **Monitor logs**: Check weekly that emails are being sent
5. **Backup data**: Export important data before enabling cleanup

---

**Need help?** Check the Django admin logs or open an issue on GitHub.
