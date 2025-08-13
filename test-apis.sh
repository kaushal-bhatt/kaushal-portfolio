#!/bin/bash

echo "🧪 Testing API Endpoints"
echo "========================"

echo "1️⃣ Testing tech sections API..."
curl -s http://localhost:3000/api/tech-sections | jq '.[0:2] | .[] | {name: .name, slug: .slug, count: ._count.blogPosts}' || echo "❌ Failed to fetch tech sections"

echo ""
echo "2️⃣ Testing individual tech section APIs..."

for slug in java spring-boot mysql kafka; do
    echo "   Testing /api/tech-sections/$slug"
    response=$(curl -s -w "%{http_code}" http://localhost:3000/api/tech-sections/$slug)
    http_code="${response: -3}"
    if [ "$http_code" = "200" ]; then
        echo "   ✅ $slug: OK"
    else
        echo "   ❌ $slug: HTTP $http_code"
    fi
done

echo ""
echo "3️⃣ Testing blog posts with technology filter..."

for slug in java spring-boot mysql kafka; do
    echo "   Testing /api/blog-posts?technology=$slug"
    response=$(curl -s http://localhost:3000/api/blog-posts?technology=$slug)
    count=$(echo "$response" | jq '. | length' 2>/dev/null || echo "0")
    echo "   📰 $slug: $count posts"
done

echo ""
echo "✅ API tests complete!"
