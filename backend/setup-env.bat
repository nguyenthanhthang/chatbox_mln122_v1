@echo off
REM Script to setup .env file from env.example (Windows)
REM Usage: setup-env.bat

echo 🔧 Setting up .env file for local development...

if exist ".env" (
    echo ⚠️  File .env already exists!
    set /p overwrite="Do you want to overwrite it? (y/N): "
    if /i not "%overwrite%"=="y" (
        echo ❌ Cancelled. Keeping existing .env file.
        exit /b 0
    )
)

if not exist "env.example" (
    echo ❌ Error: env.example not found!
    exit /b 1
)

REM Copy env.example to .env
copy env.example .env >nul

echo ✅ Created .env file from env.example
echo.
echo 📝 Next steps:
echo    1. Open backend\.env
echo    2. Replace 'your-google-ai-api-key-here' with your actual API key
echo    3. Update other credentials if needed (MongoDB, Cloudinary, etc.)
echo.
echo ⚠️  IMPORTANT: Never commit .env file to Git!
echo.

pause

