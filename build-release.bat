@echo off
echo =============================================
echo    SoulThread Google Play Bundle Builder
echo =============================================

set "JAVA_HOME=C:\Program Files\Android\Android Studio\jbr"
set "PATH=%JAVA_HOME%\bin;C:\Program Files\nodejs;%PATH%"

echo [1/4] Verifying Java...
java -version
if errorlevel 1 (
    echo ERROR: Java not found.
    pause
    exit /b 1
)

echo [2/4] Building website...
call npm run build
if errorlevel 1 (
    echo ERROR: npm build failed.
    pause
    exit /b 1
)

echo [3/4] Syncing Capacitor to Android...
call npx cap sync android
if errorlevel 1 (
    echo ERROR: Capacitor sync failed.
    pause
    exit /b 1
)

echo [4/4] Building Release Bundle (.aab) with Gradle...
cd android
call gradlew.bat clean
call gradlew.bat bundleRelease
if errorlevel 1 (
    echo ERROR: Gradle build failed. Check the output above.
    cd ..
    pause
    exit /b 1
)
cd ..

echo.
echo =============================================
echo  SUCCESS! Bundle is ready at:
echo  android\app\build\outputs\bundle\release\app-release.aab
echo =============================================
pause
