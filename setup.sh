#!/bin/bash

echo "🚀 Setting up Kaushal's Portfolio Application"
echo "=============================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the app directory."
    exit 1
fi

echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "🗄️  Setting up SQLite database..."
chmod +x switch-schema.sh
./switch-schema.sh sqlite
npx prisma db push

if [ $? -ne 0 ]; then
    echo "❌ Failed to setup database"
    exit 1
fi

echo "🌱 Seeding database with sample data..."
npm run db:seed 2>/dev/null || echo "⚠️  No seed script found, skipping..."

echo "✅ Setup complete!"
echo ""
echo "📋 Available commands:"
echo "  npm run dev          - Start development server"
echo "  npm run docker:dev   - Start with Docker"
echo "  npm run db:studio    - Open database viewer"
echo "  npm run build        - Build for production"
echo ""
echo "🌐 Your portfolio will be available at: http://localhost:3000"
echo "🔧 Admin panel will be at: http://localhost:3000/admin"
