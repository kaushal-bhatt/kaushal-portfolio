#!/bin/bash
#
# One-shot local setup. The database is Postgres now, not SQLite — the old
# switch-schema.sh that rewrote prisma/schema.prisma on every run is gone, and
# there is a single schema file for every environment.

echo "🚀 Setting up Kaushal's Portfolio Application"
echo "=============================================="

if [ ! -f "package.json" ]; then
    echo "❌ package.json not found. Run this from the project root."
    exit 1
fi

if [ ! -f ".env" ]; then
    echo "❌ No .env file. Copy .env.example to .env and fill it in first:"
    echo "     cp .env.example .env"
    echo "   You need at least POSTGRES_PASSWORD, DATABASE_URL and NEXTAUTH_SECRET."
    exit 1
fi

echo "🐘 Starting Postgres..."
docker compose up -d postgres || { echo "❌ Could not start Postgres"; exit 1; }

echo "📦 Installing dependencies..."
npm install || { echo "❌ Failed to install dependencies"; exit 1; }

echo "🗄️  Applying the schema..."
npx prisma db push || { echo "❌ Failed to apply the schema — is DATABASE_URL right?"; exit 1; }

# Non-destructive: any table that already has rows is left alone unless
# SEED_FORCE=true. Content comes from prisma/seed-data.json.
echo "🌱 Seeding content..."
npm run db:seed || { echo "❌ Seeding failed"; exit 1; }

echo ""
echo "✅ Setup complete"
echo ""
echo "📋 Commands:"
echo "  npm run dev        - development server"
echo "  npm run db:studio  - browse the database"
echo "  npm run build      - production build"
echo ""
echo "🌐 http://localhost:3000"
