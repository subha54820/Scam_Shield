# ScamShield Weekly Reports - Automated Task Setup
# Run this script as Administrator to set up automatic weekly reports

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "ScamShield Weekly Reports Setup" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "ERROR: This script must be run as Administrator!" -ForegroundColor Red
    Write-Host "Right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
    pause
    exit
}

# Get script directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendPath = $scriptPath

Write-Host "Backend Path: $backendPath`n" -ForegroundColor Gray

# Configuration
Write-Host "Configure your weekly reports:`n" -ForegroundColor Yellow

$taskName = Read-Host "Task name (default: ScamShield Weekly Reports)"
if ([string]::IsNullOrWhiteSpace($taskName)) { $taskName = "ScamShield Weekly Reports" }

$dayOfWeek = Read-Host "Day of week (Sunday/Monday/Tuesday/etc, default: Sunday)"
if ([string]::IsNullOrWhiteSpace($dayOfWeek)) { $dayOfWeek = "Sunday" }

$timeOfDay = Read-Host "Time of day (HH:MM format, default: 09:00)"
if ([string]::IsNullOrWhiteSpace($timeOfDay)) { $timeOfDay = "09:00" }

$clearData = Read-Host "Clear database after sending? (yes/no, default: yes)"
if ([string]::IsNullOrWhiteSpace($clearData)) { $clearData = "yes" }

# Build command arguments
$arguments = "manage.py send_weekly_reports"
if ($clearData -eq "yes" -or $clearData -eq "y") {
    $arguments += " --clear-data"
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Creating Scheduled Task..." -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

try {
    # Find Python executable
    $pythonPath = (Get-Command python -ErrorAction SilentlyContinue).Source
    if (-not $pythonPath) {
        Write-Host "ERROR: Python not found in PATH!" -ForegroundColor Red
        Write-Host "Please install Python or add it to your PATH" -ForegroundColor Yellow
        pause
        exit
    }
    
    Write-Host "Python found: $pythonPath" -ForegroundColor Green

    # Remove existing task if it exists
    $existingTask = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue
    if ($existingTask) {
        Write-Host "Removing existing task..." -ForegroundColor Yellow
        Unregister-ScheduledTask -TaskName $taskName -Confirm:$false
    }

    # Create task action
    $action = New-ScheduledTaskAction -Execute $pythonPath -Argument $arguments -WorkingDirectory $backendPath

    # Create task trigger
    $trigger = New-ScheduledTaskTrigger -Weekly -DaysOfWeek $dayOfWeek -At $timeOfDay

    # Task settings
    $settings = New-ScheduledTaskSettingsSet `
        -AllowStartIfOnBatteries `
        -DontStopIfGoingOnBatteries `
        -StartWhenAvailable `
        -RunOnlyIfNetworkAvailable `
        -MultipleInstances IgnoreNew

    # Register the task
    Register-ScheduledTask `
        -TaskName $taskName `
        -Action $action `
        -Trigger $trigger `
        -Settings $settings `
        -Description "Automatically send weekly security reports to ScamShield users and optionally clear old data" `
        -User $env:USERNAME `
        -RunLevel Highest | Out-Null

    Write-Host "`n✅ SUCCESS! Task created successfully!" -ForegroundColor Green
    Write-Host "`nTask Details:" -ForegroundColor Cyan
    Write-Host "  Name: $taskName" -ForegroundColor White
    Write-Host "  Schedule: Every $dayOfWeek at $timeOfDay" -ForegroundColor White
    Write-Host "  Clear Data: $clearData" -ForegroundColor White
    Write-Host "  Working Directory: $backendPath" -ForegroundColor Gray
    
    Write-Host "`nNext Steps:" -ForegroundColor Yellow
    Write-Host "  1. Open Task Scheduler (taskschd.msc) to verify" -ForegroundColor White
    Write-Host "  2. Configure email settings in BACKEND/.env file" -ForegroundColor White
    Write-Host "  3. Test manually: python manage.py send_weekly_reports" -ForegroundColor White
    
    Write-Host "`n✨ The task will run automatically every $dayOfWeek at $timeOfDay" -ForegroundColor Green
    
} catch {
    Write-Host "`n❌ ERROR: Failed to create scheduled task!" -ForegroundColor Red
    Write-Host "Error details: $_" -ForegroundColor Red
    Write-Host "`nTry creating the task manually in Task Scheduler" -ForegroundColor Yellow
}

Write-Host "`n========================================" -ForegroundColor Cyan
pause
