import { PrismaClient } from '@prisma/client';
import { SecurityService } from '../lib/security';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting secure database seeding...');

  // Create admin user with secure password
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@portfolio.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'SecureAdmin123!';

  // Validate admin password strength
  const passwordCheck = SecurityService.validatePasswordStrength(adminPassword);
  if (!passwordCheck.isValid) {
    console.error('❌ Admin password does not meet security requirements:', passwordCheck.message);
    process.exit(1);
  }

  const hashedPassword = await SecurityService.hashPassword(adminPassword);

  // Upsert admin user
  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      password: hashedPassword,
      role: 'admin',
    },
    create: {
      email: adminEmail,
      name: 'Portfolio Admin',
      password: hashedPassword,
      role: 'admin',
    },
  });

  console.log('✅ Admin user created/updated:', adminUser.email);

  // Clear existing portfolio data
  await prisma.portfolio.deleteMany();
  console.log('🗑️ Cleared existing portfolio data');

  // Seed sample portfolio data
  const portfolioData = [
    {
      company: 'Tech Innovation Corp',
      role: 'Senior Full Stack Developer',
      startDate: 'Jan 2023',
      endDate: null,
      current: true,
      description: 'Leading development of cutting-edge web applications using modern technologies. Responsible for architecture decisions, code reviews, and mentoring junior developers.',
      technologies: 'React, Node.js, TypeScript, PostgreSQL, AWS, Docker',
      achievements: 'Improved application performance by 40%, Led team of 5 developers, Implemented CI/CD pipeline reducing deployment time by 60%',
      order: 1,
    },
    {
      company: 'Digital Solutions Ltd',
      role: 'Frontend Developer',
      startDate: 'Jun 2021',
      endDate: 'Dec 2022',
      current: false,
      description: 'Developed responsive web applications with focus on user experience and performance optimization. Collaborated with design teams to implement pixel-perfect interfaces.',
      technologies: 'React, Vue.js, JavaScript, Sass, Webpack, Jest',
      achievements: 'Reduced bundle size by 35%, Implemented design system used across 10+ projects, Achieved 98% test coverage',
      order: 2,
    },
    {
      company: 'StartupXYZ',
      role: 'Junior Web Developer',
      startDate: 'Sep 2020',
      endDate: 'May 2021',
      current: false,
      description: 'Built and maintained e-commerce platforms using modern web technologies. Gained experience in agile development methodologies and version control.',
      technologies: 'HTML, CSS, JavaScript, PHP, MySQL, Bootstrap',
      achievements: 'Developed 5+ e-commerce websites, Improved page load times by 25%, Learned modern development practices',
      order: 3,
    },
  ];

  for (const item of portfolioData) {
    await prisma.portfolio.create({
      data: item,
    });
  }

  console.log('✅ Sample portfolio data seeded');

  // Clear existing tech sections
  await prisma.techSection.deleteMany();
  console.log('🗑️ Cleared existing tech sections');

  // Seed tech sections
  const techSections = [
    {
      name: 'Java & Spring Boot',
      slug: 'java',
      description: 'Enterprise Java development with Spring Boot framework',
      icon: 'Coffee',
      order: 1,
      color: '#f89820',
    },
    {
      name: 'React & Next.js',
      slug: 'react',
      description: 'Modern frontend development with React ecosystem',
      icon: 'Leaf',
      order: 2,
      color: '#61dafb',
    },
    {
      name: 'Database & Architecture',
      slug: 'database',
      description: 'Database design and system architecture',
      icon: 'Database',
      order: 3,
      color: '#336791',
    },
  ];

  for (const section of techSections) {
    await prisma.techSection.create({
      data: section,
    });
  }

  console.log('✅ Tech sections seeded');

  // Clear existing blog posts
  await prisma.blogPost.deleteMany();
  console.log('🗑️ Cleared existing blog posts');

  // Seed sample blog posts
  const blogPosts = [
    {
      title: 'Getting Started with Spring Boot Microservices',
      slug: 'spring-boot-microservices-guide',
      excerpt: 'Learn how to build scalable microservices using Spring Boot framework with best practices.',
      content: '# Getting Started with Spring Boot Microservices\n\nSpring Boot makes it easy to create stand-alone, production-grade Spring based Applications...',
      technology: 'Java',
      published: true,
      authorId: adminUser.id,
      tags: 'spring-boot, microservices, java, backend',
      readTime: 8,
    },
    {
      title: 'Modern React Patterns and Best Practices',
      slug: 'modern-react-patterns-2024',
      excerpt: 'Explore the latest React patterns and best practices for building maintainable applications.',
      content: '# Modern React Patterns and Best Practices\n\nReact has evolved significantly over the years...',
      technology: 'React',
      published: true,
      authorId: adminUser.id,
      tags: 'react, patterns, best-practices, frontend',
      readTime: 12,
    },
  ];

  for (const post of blogPosts) {
    await prisma.blogPost.create({
      data: post,
    });
  }

  console.log('✅ Sample blog posts seeded');
  console.log('🎉 Database seeding completed successfully!');
  console.log(`📧 Admin login: ${adminEmail}`);
  console.log('🔐 Admin password: [Check your environment variables]');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
