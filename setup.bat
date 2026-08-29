@echo off
REM One-shot local setup. The database is Postgres now, not SQLite.

echo Setting up Kaushal's Portfolio Application
echo ==============================================

if not exist "package.json" (
    echo ERROR: package.json not found. Run this from the project root.
    exit /b 1
)

if not exist ".env" (
    echo ERROR: No .env file. Copy .env.example to .env and fill it in first:
    echo     copy .env.example .env
    echo   You need at least POSTGRES_PASSWORD, DATABASE_URL and NEXTAUTH_SECRET.
    exit /b 1
)

echo Starting Postgres...
call docker compose up -d postgres
if %errorlevel% neq 0 ( echo ERROR: Could not start Postgres & exit /b 1 )

echo Installing dependencies...
call npm install
if %errorlevel% neq 0 ( echo ERROR: Failed to install dependencies & exit /b 1 )

echo Applying the schema...
call npx prisma db push
if %errorlevel% neq 0 ( echo ERROR: Failed to apply the schema - is DATABASE_URL right? & exit /b 1 )

REM Non-destructive: tables that already have rows are left alone unless
REM SEED_FORCE=true. Content comes from prisma/seed-data.json.
echo Seeding content...
call npm run db:seed
if %errorlevel% neq 0 ( echo ERROR: Seeding failed & exit /b 1 )

echo.
echo Setup complete
echo.
echo Commands:
echo   npm run dev        - development server
echo   npm run db:studio  - browse the database
echo   npm run build      - production build
echo.
echo http://localhost:3000
