# Skybureau Android Debug APK 构建解决方案

我们发现原始的批处理脚本(build-debug-apk.bat)存在编码问题和语法错误，导致文件复制步骤失败，从而出现以下问题：
1. APK文件没有重新生成
2. 安装的APK页面没有显示最新内容

## 解决方案

我们采用了以下方法解决问题：

1. 创建了一个新的PowerShell脚本 `build-debug-apk.ps1`，它包含了完整的构建流程：
   - 构建Web应用 (npm run build)
   - 清理并将最新的Web应用文件从 `dist/demo` 复制到 `src-cordova/www`
   - 构建Android debug APK (cordova build android --debug)
   - 显示APK文件位置并打开文件浏览器

2. 重写了原始的批处理文件 `build-debug-apk.bat`，将其简化为一个简单的包装器，它只负责调用PowerShell脚本：
   ```batch
   powershell -ExecutionPolicy Bypass -File "%~dp0\build-debug-apk.ps1"
   ```

## 使用方法

1. 双击运行 `build-debug-apk.bat` 文件（与原来的使用方式相同）
2. 等待构建流程完成
3. APK文件将生成在 `src-cordova\platforms\android\app\build\outputs\apk\debug\app-debug.apk`

## 优势

- 解决了批处理文件的编码问题
- 确保了最新的Web应用文件被正确复制到Cordova www目录
- 保留了用户熟悉的双击运行方式
- 提供了更清晰的构建步骤和错误处理

## 注意事项

- 如需修改构建流程，请编辑 `build-debug-apk.ps1` 文件
- 如果遇到权限问题，PowerShell脚本中已包含 `-ExecutionPolicy Bypass` 参数来解决