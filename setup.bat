@echo off
echo 🚀 Setting up Kaushal's Portfolio Application
echo ==============================================

if not exist "package.json" (
    echo ❌ Error: package.json not found. Please run this script from the app directory.
    exit /b 1
)

echo 📦 Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    exit /b 1
)

echo 🗄️  Setting up SQLite database...
call npx prisma db push
if %errorlevel% neq 0 (
    echo ❌ Failed to setup database
    exit /b 1
)

echo 🌱 Seeding database with sample data...
call npm run db:seed 2>nul || echo ⚠️  No seed script found, skipping...

echo ✅ Setup complete!
echo.
echo 📋 Available commands:
echo   npm run dev          - Start development server
echo   npm run docker:dev   - Start with Docker
echo   npm run db:studio    - Open database viewer
echo   npm run build        - Build for production
echo.
echo 🌐 Your portfolio will be available at: http://localhost:3000
echo 🔧 Admin panel will be at: http://localhost:3000/admin
