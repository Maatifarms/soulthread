@echo off
echo =============================================
echo    SoulThread APK Builder v2 - Auto Mode
echo =============================================

:: Fix JAVA_HOME to Java 21 JDK (required for Android Gradle Plugin & Capacitor 7)
set "JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-21.0.10.7-hotspot"
set "PATH=%JAVA_HOME%\bin;%PATH%"

echo [1/5] Verifying Java 21...
java -version
if errorlevel 1 (
    echo ERROR: Java 21 not found at expected path.
    pause
    exit /b 1
)

echo [2/5] Building website...
call npm run build
if errorlevel 1 (
    echo ERROR: npm build failed.
    pause
    exit /b 1
)

echo [3/5] Syncing Capacitor to Android...
call npx cap sync android
if errorlevel 1 (
    echo ERROR: Capacitor sync failed.
    pause
    exit /b 1
)

echo [4/5] Building APK with Gradle (2-5 mins)...
cd android
call gradlew.bat clean
call gradlew.bat assembleDebug
if errorlevel 1 (
    echo ERROR: Gradle build failed. Check the output above.
    cd ..
    pause
    exit /b 1
)
cd ..

echo [5/5] Copying APK and deploying...
if not exist "public\download" mkdir "public\download"
copy /Y "android\app\build\outputs\apk\debug\app-debug.apk" "public\download\soulthread.apk"
if errorlevel 1 (
    echo ERROR: Could not copy APK. Check if the build produced the file.
    pause
    exit /b 1
)
echo APK copied! Rebuilding dist with APK included...
call npm run build

echo Deploying to soulthread.in...
call firebase deploy --only hosting
if errorlevel 1 (
    echo ERROR: Firebase deploy failed.
    pause
    exit /b 1
)

echo.
echo =============================================
echo  SUCCESS! APK is now live at:
echo  https://soulthread.in/download/soulthread.apk
echo =============================================
pause
