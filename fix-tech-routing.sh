#!/bin/bash

echo "🔧 Fixing Technology Routing Issues"
echo "===================================="

echo "1️⃣ Checking current database state..."
node debug-routing.js

echo ""
echo "2️⃣ Resetting and reseeding database..."

# Reset database
npm run db:push --force-reset

# Generate Prisma client
npx prisma generate

# Seed database
npm run db:seed

echo ""
echo "3️⃣ Verifying fix..."
node debug-routing.js

echo ""
echo "4️⃣ Testing technology routes manually..."
echo "   Please test these URLs in your browser:"
echo "   http://localhost:3000/blog/technology/java"
echo "   http://localhost:3000/blog/technology/spring-boot"
echo "   http://localhost:3000/blog/technology/mysql"
echo "   http://localhost:3000/blog/technology/kafka"

echo ""
echo "✅ Fix complete! Your technology routing should now work."
