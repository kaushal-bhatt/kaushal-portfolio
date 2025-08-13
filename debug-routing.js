const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debugAndFix() {
  try {
    console.log('🔍 Debugging Technology Routing...\n');

    // 1. Check if tech sections exist
    console.log('1️⃣ Checking Tech Sections:');
    const techSections = await prisma.techSection.findMany({
      orderBy: { order: 'asc' }
    });
    
    if (techSections.length === 0) {
      console.log('❌ No tech sections found! Need to seed data.');
      return;
    }
    
    techSections.forEach(tech => {
      console.log(`   ${tech.name} -> /${tech.slug}`);
    });

    // 2. Check if blog posts exist
    console.log('\n2️⃣ Checking Blog Posts:');
    const blogPosts = await prisma.blogPost.findMany({
      select: { title: true, technology: true, published: true }
    });
    
    if (blogPosts.length === 0) {
      console.log('❌ No blog posts found! Need to seed data.');
      return;
    }
    
    blogPosts.forEach(post => {
      console.log(`   "${post.title}" -> technology: "${post.technology}" -> published: ${post.published}`);
    });

    // 3. Check mapping between tech sections and blog posts
    console.log('\n3️⃣ Checking Technology Mapping:');
    for (const tech of techSections) {
      const matchingPosts = blogPosts.filter(post => 
        post.technology === tech.slug || 
        post.technology === tech.name
      );
      console.log(`   ${tech.name} (${tech.slug}): ${matchingPosts.length} posts`);
      matchingPosts.forEach(post => {
        console.log(`     - ${post.title} (published: ${post.published})`);
      });
    }

    console.log('\n✅ Debug complete!');
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugAndFix();
