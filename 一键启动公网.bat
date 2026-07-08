@echo off
title Sanhua Public
color 0A

echo ============================================
echo   Sanhua Package Spec - Public Access
echo ============================================
echo.

cd /d "D:\RT Agent\sanhuPackageApp"

if not exist "go_public.py" (
    echo [ERROR] go_public.py not found in current directory
    pause
    exit /b
)

"D:\Program Files\Python\Python36\python.exe" go_public.py

pause
