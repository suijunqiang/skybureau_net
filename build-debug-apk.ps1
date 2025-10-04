# PowerShell script to build debug APK for Skybureau

Write-Host "Skybureau Android Debug APK Builder"
Write-Host "======================================"

# 先检查src-cordova目录是否存在
$cordovaDir = Join-Path -Path $PSScriptRoot -ChildPath "src-cordova"
if (-not (Test-Path -Path $cordovaDir)) {
    Write-Host "Cordova directory not found at $cordovaDir" -ForegroundColor Red
    Write-Host "Please make sure Cordova is properly set up for this project."
    Read-Host "Press Enter to exit..."
    exit 1
}

# 清除Cordova www目录，确保没有旧文件
$wwwDir = Join-Path -Path $PSScriptRoot -ChildPath "src-cordova\www"
if (Test-Path -Path $wwwDir) {
    Write-Host "Cleaning Cordova www directory..."
    Get-ChildItem -Path $wwwDir -Recurse | Remove-Item -Force -Recurse
}

# 使用Quasar的Cordova构建命令，这将正确处理所有资源和引用
Write-Host "\nBuilding Cordova Android debug APK using Quasar CLI..."
$quasarBuildResult = Start-Process -FilePath "npx" -ArgumentList "quasar", "build", "-m", "cordova", "-T", "android", "--debug" -NoNewWindow -PassThru -Wait

# 如果Quasar构建命令失败，尝试备选方案：先构建web，再手动构建Cordova
if ($quasarBuildResult.ExitCode -ne 0) {
    Write-Host "\nQuasar Cordova build failed, trying alternative build method..." -ForegroundColor Yellow
    
    # Step 1: Build web application
    Write-Host "\nStep 1: Building web application..."
    $buildResult = Start-Process -FilePath "npm" -ArgumentList "run build" -NoNewWindow -PassThru -Wait
    if ($buildResult.ExitCode -ne 0) {
        Write-Host "Web application build failed!" -ForegroundColor Red
        Read-Host "Press Enter to exit..."
        exit 1
    }
    Write-Host "Web application built successfully!" -ForegroundColor Green

    # Step 2: Copy web application files to Cordova www directory
    Write-Host "\nStep 2: Copying web application files to Cordova www directory..."

    # Ensure src-cordova/www directory exists
    if (-not (Test-Path -Path $wwwDir)) {
        Write-Host "Creating www directory: $wwwDir"
        New-Item -Path $wwwDir -ItemType Directory -Force | Out-Null
    }

    # 手动复制构建产物到Cordova目录
    $demoDir = Join-Path -Path $PSScriptRoot -ChildPath "dist\demo"
    if (-not (Test-Path -Path $demoDir)) {
        Write-Host "Build directory not found at $demoDir" -ForegroundColor Red
        Read-Host "Press Enter to exit..."
        exit 1
    }

    Write-Host "Copying files from $demoDir to $wwwDir"

    try {
        Copy-Item -Path "$demoDir\*" -Destination $wwwDir -Recurse -Force
        Write-Host "Files copied successfully!" -ForegroundColor Green
    } catch {
        Write-Host "File copy failed!" -ForegroundColor Red
        Write-Host "Error message: $($_.Exception.Message)"
        Read-Host "Press Enter to exit..."
        exit 1
    }

    # Step 3: Build Android debug APK
    Write-Host "\nStep 3: Building Android debug APK..."
    # 使用cmd.exe来运行cordova命令
    $buildResult = Start-Process -FilePath "cmd.exe" -ArgumentList "/c cordova build android --debug" -WorkingDirectory $cordovaDir -NoNewWindow -PassThru -Wait
    if ($buildResult.ExitCode -ne 0) {
        Write-Host "APK build failed!" -ForegroundColor Red
        Read-Host "Press Enter to exit..."
        exit 1
    }
}

# Step 4: Verify APK creation and provide instructions
Write-Host "\nStep 4: APK build completed!" -ForegroundColor Green

$apkPath = Join-Path -Path $PSScriptRoot -ChildPath "src-cordova\platforms\android\app\build\outputs\apk\debug\app-debug.apk"
if (Test-Path -Path $apkPath) {
    Write-Host "\nDebug APK successfully created at:" -ForegroundColor Yellow
    Write-Host $apkPath -ForegroundColor Cyan
    Write-Host "\nTo install the APK on your device:" -ForegroundColor Yellow
    Write-Host "1. Connect your Android device via USB"
    Write-Host "2. Enable USB debugging on your device"
    Write-Host "3. Run: adb install $apkPath"
    Write-Host "\nTo view the app logs:" -ForegroundColor Yellow
    Write-Host "adb logcat -s CordovaLog:D Chromium:D"
    
    # Open file explorer to show the APK file
    explorer /select,"$apkPath"
} else {
    Write-Host "\nWarning: APK file not found at expected location." -ForegroundColor Yellow
    Write-Host "Please check the following location manually:" -ForegroundColor Yellow
    Write-Host "src-cordova\platforms\android\app\build\outputs\apk\debug\"
}

Read-Host "\nPress Enter to exit..."