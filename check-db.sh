#!/bin/bash

echo "🔍 Checking current database state..."

# Start the app in the background to check data
npm run dev &
SERVER_PID=$!

# Wait for server to start
sleep 5

echo "📊 Current Tech Sections:"
curl -s http://localhost:3000/api/tech-sections | jq '.[] | {name: .name, slug: .slug}' || echo "Failed to fetch tech sections"

echo ""
echo "📝 Current Blog Posts:"
curl -s http://localhost:3000/api/blog-posts | jq '.[] | {title: .title, technology: .technology}' || echo "Failed to fetch blog posts"

# Kill the server
kill $SERVER_PID

echo ""
echo "✅ Database check complete!"
