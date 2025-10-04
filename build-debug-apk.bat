@echo off
REM Simple batch file to launch PowerShell build script
REM This file exists for compatibility, the actual build logic is in build-debug-apk.ps1

powershell -ExecutionPolicy Bypass -File "%~dp0\build-debug-apk.ps1"