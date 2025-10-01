@echo off
REM 设置Gradle国内镜像源
set CORDOVA_ANDROID_GRADLE_DISTRIBUTION_URL=https://mirrors.cloud.tencent.com/gradle/gradle-7.6-all.zip
REM 设置Node内存限制
set NODE_OPTIONS=--max-old-space-size=8192
REM 设置Quasar开发服务器的默认IP地址
echo 正在使用腾讯云Gradle镜像源...
echo 自动设置开发服务器IP地址为192.168.0.98
REM 使用--hostname参数自动设置IP地址，避免交互式提示
npm run dev -- -m cordova -T android --hostname 192.168.0.98