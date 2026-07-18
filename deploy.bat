@echo off
setlocal EnableDelayedExpansion

set "DOWNLOADS=%USERPROFILE%\Downloads"
set "PLATFORM=%DOWNLOADS%\valoria-platform\valoria-final"
set "SITE=%DOWNLOADS%\valoria-site"

echo.
echo Deploying into valoria-platform...
echo.

call :deploy "%DOWNLOADS%\PRIMEAssessment*" "%PLATFORM%\src\PRIMEAssessment.jsx" "computeFingerprint" "PRIMEAssessment.jsx"
call :deploy "%DOWNLOADS%\claim-listing*" "%PLATFORM%\api\claim-listing.js" "claim-listing" "claim-listing.js"

echo.
echo Deploying into valoria-site...
echo.

call :deploy "%DOWNLOADS%\page*" "%SITE%\src\app\dashboard\page.jsx" "DashboardPage" "dashboard/page.jsx"
call :deploy "%DOWNLOADS%\page*" "%SITE%\src\app\valoria-develop\page.jsx" "ValoriaDevelopPage" "valoria-develop/page.jsx (new)"
call :deploy "%DOWNLOADS%\page*" "%SITE%\src\app\facilitators\page.jsx" "FacilitatorsPage" "facilitators/page.jsx"

echo.
echo ============================================================
echo Done. profile/[id]/page.jsx was already deployed successfully
echo in the previous run - not repeated here.
echo.
echo Review the changes above, then run these manually:
echo ============================================================
echo.
echo   cd "%PLATFORM%"
echo   npm run build
echo   git add -A
echo   git commit -m "fix: restore working PRIMEAssessment.jsx, claim-listing active_tracks"
echo   git push
echo.
echo   cd "%SITE%"
echo   npm run build
echo   git add -A
echo   git commit -m "feat: track-aware dashboard/profile, add valoria-develop listings"
echo   git push
echo.

goto :eof

:deploy
set "PATTERN=%~1"
set "DEST=%~2"
set "MARKER=%~3"
set "LABEL=%~4"
set "FOUND="

for %%F in (%PATTERN%) do (
    if not defined FOUND (
        findstr /c:"%MARKER%" "%%F" >nul 2>&1
        if not errorlevel 1 (
            set "FOUND=%%F"
        )
    )
)

if not defined FOUND (
    echo [MISSING] %LABEL% -- no downloaded file matched marker: %MARKER%
    goto :eof
)

for %%D in ("%DEST%") do set "DESTDIR=%%~dpD"
if not exist "!DESTDIR!" mkdir "!DESTDIR!"

if exist "%DEST%" (
    copy /Y "%DEST%" "%DEST%.bak" >nul
    echo   backed up existing to %DEST%.bak
)

copy /Y "!FOUND!" "%DEST%" >nul
echo [OK] %LABEL%
echo   !FOUND!  --^>  %DEST%
echo.

goto :eof
