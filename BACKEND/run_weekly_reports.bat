@echo off
REM Weekly Report Scheduler for ScamShield
REM This script sends weekly reports to all users and optionally clears old data
REM 
REM Usage:
REM   run_weekly_reports.bat          - Send reports only
REM   run_weekly_reports.bat --clear  - Send reports and clear database

cd /d "%~dp0"

echo.
echo ========================================
echo ScamShield Weekly Report System
echo ========================================
echo Starting at: %DATE% %TIME%
echo.

REM Activate virtual environment if it exists
if exist "venv\Scripts\activate.bat" (
    echo Activating virtual environment...
    call venv\Scripts\activate.bat
)

REM Run the management command
if "%1"=="--clear" (
    echo Running with database cleanup...
    python manage.py send_weekly_reports --clear-data
) else (
    echo Sending reports without cleanup...
    python manage.py send_weekly_reports
)

echo.
echo Completed at: %DATE% %TIME%
echo ========================================
echo.

REM Log the execution
echo %DATE% %TIME% - Weekly reports executed >> weekly_reports.log

pause
