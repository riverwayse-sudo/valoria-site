@echo off
REM Run this from C:\Users\FEMI\Downloads after downloading route.js and page.jsx
REM into that same Downloads folder. It copies them into the correct spots
REM inside your local valoria-site repo.

set REPO=C:\Users\FEMI\Downloads\valoria-site

if not exist "%REPO%" (
  echo Could not find %REPO% — edit the REPO path at the top of this script and re-run.
  pause
  exit /b 1
)

echo Creating folders...
if not exist "%REPO%\src\app\api\feedback" mkdir "%REPO%\src\app\api\feedback"
if not exist "%REPO%\src\app\feedback" mkdir "%REPO%\src\app\feedback"

echo Copying files...
copy /Y "%~dp0route.js" "%REPO%\src\app\api\feedback\route.js"
copy /Y "%~dp0page.jsx" "%REPO%\src\app\feedback\page.jsx"

echo.
echo Done. Files placed at:
echo   %REPO%\src\app\api\feedback\route.js
echo   %REPO%\src\app\feedback\page.jsx
echo.
echo Next steps:
echo   cd %REPO%
echo   git add src\app\api\feedback\route.js src\app\feedback\page.jsx
echo   git commit -m "feat: webinar feedback form (page + API route, writes to webinar_feedback table)"
echo   git push
echo.
pause
