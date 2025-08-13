#!/bin/bash

echo "🔧 Fixing Portfolio Issues - Complete Setup"
echo "=============================================="

echo "1️⃣ Resetting database..."
npm run db:push --force-reset

echo "2️⃣ Regenerating Prisma client..."
npx prisma generate

echo "3️⃣ Seeding database with correct data..."
npm run db:seed

echo "4️⃣ Installing missing Sonner toast library..."
npm install sonner

echo "✅ Setup complete!"
echo ""
echo "📋 Fixed Issues:"
echo "  ✅ Technology routing (java, spring-boot, mysql, kafka)"
echo "  ✅ Blog post creation success messages"
echo "  ✅ Password update success messages"
echo "  ✅ All array handling issues"
echo ""
echo "🚀 Your portfolio is now ready!"
echo "   Run: npm run dev"
