// Simple API test script
const testTechRouting = async () => {
  console.log('🧪 Testing Technology APIs...\n');
  
  const baseUrl = 'http://localhost:3000';
  
  // Test cases
  const tests = [
    { name: 'Tech Sections API', url: '/api/tech-sections' },
    { name: 'Java Tech Section', url: '/api/tech-sections/java' },
    { name: 'Spring Boot Tech Section', url: '/api/tech-sections/spring-boot' },
    { name: 'Blog Posts for Java', url: '/api/blog-posts?technology=java' },
    { name: 'Blog Posts for Spring Boot', url: '/api/blog-posts?technology=spring-boot' },
  ];
  
  for (const test of tests) {
    try {
      console.log(`Testing: ${test.name}`);
      const response = await fetch(`${baseUrl}${test.url}`);
      
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          console.log(`✅ ${test.name}: ${data.length} items`);
        } else {
          console.log(`✅ ${test.name}: Success`);
        }
      } else {
        console.log(`❌ ${test.name}: HTTP ${response.status}`);
        const errorText = await response.text();
        console.log(`   Error: ${errorText}`);
      }
    } catch (error) {
      console.log(`❌ ${test.name}: ${error.message}`);
    }
    console.log('');
  }
};

testTechRouting();
