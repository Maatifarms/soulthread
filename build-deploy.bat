@echo off
setlocal
echo ==============================================
echo     SoulThread Production Deployment Pipeline
echo ==============================================

echo [1/6] Installing dependencies...
call npm ci
if errorlevel 1 (
    echo [ERROR] Dependency installation failed.
    exit /b 1
)

echo [2/6] Running Lint Checks...
call npm run lint
if errorlevel 1 (
    echo [ERROR] Linting failed. Fix code quality issues before deployment.
    exit /b 1
)

echo [3/6] Running Automated Tests...
call npm test -- --coverage
if errorlevel 1 (
    echo [ERROR] Test suite failed. Fix failing tests before deployment.
    exit /b 1
)

echo [4/6] Building Production Bundle...
call npm run build
if errorlevel 1 (
    echo [ERROR] Production Build failed.
    exit /b 1
)

echo [5/6] Deploying Firebase Functions...
call firebase deploy --only functions --project soulthread-prod
if errorlevel 1 (
    echo [ERROR] Backend deployment failed.
    exit /b 1
)

echo [6/6] Deploying Frontend Application...
call firebase deploy --only hosting,firestore,storage --project soulthread-prod
if errorlevel 1 (
    echo [ERROR] Frontend deployment failed.
    exit /b 1
)

echo.
echo ==============================================
echo ✅ Deployment Successful! 
echo Application is now live in production.
echo ==============================================
exit /b 0
