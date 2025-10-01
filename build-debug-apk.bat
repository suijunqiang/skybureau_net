@echo off
REM Very simple script to build debug APK directly
REM This script will build a debug version of the app that can be installed directly

REM Set working directory
cd /d "%~dp0"

REM Set Chinese encoding
chcp 65001 >nul

cls
echo =====================================================================
echo Skybureau Android Debug APK Builder
 echo =====================================================================
echo This script builds a debug APK that can be installed directly on devices/emulators

echo Step 1: Building web application...
npm run build
if %errorLevel% neq 0 (
    echo Web application build failed!
    pause
    exit /B 1
)

echo.
echo Step 2: Building Android debug APK...
cd src-cordova
cordova build android --debug
if %errorLevel% neq 0 (
    echo APK build failed!
    echo Please check the error message above.
    pause
    exit /B 1
)

echo.
echo Step 3: Searching for generated APK file...
cd /d "%~dp0"
for /f "delims=" %%a in ('dir /s /b "src-cordova\platforms\android\app\build\outputs\apk\debug\*.apk"') do (
    set "APK_PATH=%%a"
    goto :found
)

:found
if defined APK_PATH (
    echo =====================================================================
echo SUCCESS! Debug APK has been generated.
echo =====================================================================
echo APK file: %APK_PATH%
echo.
echo You can install this APK using:
echo adb install "%APK_PATH%"
echo.
echo Or double-click the APK file to install it on an emulator.
echo =====================================================================
    explorer /select,"%APK_PATH%"
) else (
    echo =====================================================================
echo Build completed but no APK file found!
echo =====================================================================
echo Please check the following location manually:
echo src-cordova\platforms\android\app\build\outputs\apk\debug\
echo.
echo If you still can't find APK files, but see AAB files, you can:
echo 1. Use this script again to build debug version (which should generate APK)
echo 2. Use bundletool to convert AAB to APK (see build-result-guide.md)
echo =====================================================================
)

pause