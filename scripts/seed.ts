
import { PrismaClient } from '@prisma/client';
import bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const hashedPassword = await bcryptjs.hash('admin123', 12);
  
  const admin = await prisma.user.upsert({
    where: { email: 'kaushal8650@gmail.com' },
    update: {},
    create: {
      email: 'kaushal8650@gmail.com',
      name: 'Kaushal Bhatt',
      password: hashedPassword,
      role: 'admin',
    },
  });

  // Create technology sections
  const techSections = [
    { name: 'Java', slug: 'java', description: 'Enterprise-grade Java development and best practices', icon: 'Coffee', color: '#ED8936' },
    { name: 'Spring Boot', slug: 'spring-boot', description: 'Building microservices and web applications with Spring Boot', icon: 'Leaf', color: '#68D391' },
    { name: 'MySQL', slug: 'mysql', description: 'Database design, optimization, and advanced SQL techniques', icon: 'Database', color: '#4299E1' },
    { name: 'Kafka', slug: 'kafka', description: 'Event-driven architectures and real-time data processing', icon: 'Workflow', color: '#9F7AEA' },
    { name: 'DataDog', slug: 'datadog', description: 'Application monitoring, observability, and performance optimization', icon: 'Activity', color: '#F56565' },
    { name: 'LLM', slug: 'llm', description: 'Large Language Models integration and AI-powered applications', icon: 'Brain', color: '#38B2AC' },
    { name: 'Redis', slug: 'redis', description: 'Caching strategies and high-performance data structures', icon: 'Zap', color: '#FC8181' },
    { name: 'MongoDB', slug: 'mongodb', description: 'NoSQL database design and document-oriented development', icon: 'FileText', color: '#48BB78' },
  ];

  for (const [index, tech] of techSections.entries()) {
    await prisma.techSection.upsert({
      where: { slug: tech.slug },
      update: {},
      create: {
        ...tech,
        order: index,
      },
    });
  }

  // Create portfolio entries based on resume
  const portfolioEntries = [
    {
      company: 'Rockwallet',
      role: 'Senior Software Engineer',
      startDate: 'Dec 2024',
      endDate: null,
      current: true,
      description: 'Developed and architected end-to-end microservices for a crypto wallet platform, enabling secure currency transactions and comprehensive wallet functionalities. Led the backend development from scratch, including designing and implementing scalable microservices architecture. Currently spearheading blockchain integration to ensure seamless connectivity and robust transaction processing within the platform.',
      technologies: ['Java', 'Spring Boot', 'Microservices', 'AWS', 'Blockchain', 'PostgreSQL', 'Docker', 'Kubernetes'],
      achievements: [
        'Architected scalable microservices for crypto wallet platform',
        'Led backend development from scratch',
        'Implemented blockchain integration for secure transactions',
        'Designed comprehensive wallet functionality system'
      ],
      order: 0,
    },
    {
      company: 'EPAM Systems',
      role: 'Senior Software Engineer',
      startDate: 'Feb 2024',
      endDate: 'Dec 2024',
      current: false,
      description: 'Led design and implementation of highly parallelized cloud-native applications with comprehensive automated testing achieving 95%+ code coverage. Collaborated closely with domain experts to understand complex algorithms and translate them into scalable software implementations.',
      technologies: ['Java', 'Spring Boot', 'AWS', 'Microservices', 'Algorithm Design', 'Automated Testing', 'CI/CD'],
      achievements: [
        'Achieved 95%+ code coverage through automated testing',
        'Reduced manual processing time by 30% through automated workflows',
        'Improved system uptime by 25% through robust architecture design',
        'Mentored engineering team on complex software design patterns'
      ],
      order: 1,
    },
    {
      company: 'Ibosstech Solutions',
      role: 'Java Developer',
      startDate: 'Jul 2022',
      endDate: 'Dec 2023',
      current: false,
      description: 'Architected and delivered production-level systems migrating legacy monolithic applications to scalable microservices on AWS. Developed robust real-time applications using Kafka and AWS SageMaker, improving system accuracy by 38%.',
      technologies: ['Java', 'Spring Boot', 'AWS', 'Kafka', 'SageMaker', 'MySQL', 'Microservices', 'Redis'],
      achievements: [
        'Migrated legacy monolithic applications to scalable microservices',
        'Improved system accuracy by 38% using Kafka and AWS SageMaker',
        'Handled 10,000+ daily transactions in order management systems',
        'Achieved 57% reduction in processing time through optimization'
      ],
      order: 2,
    },
    {
      company: 'Lenskart',
      role: 'Software Developer',
      startDate: 'Nov 2019',
      endDate: 'Jul 2022',
      current: false,
      description: 'Designed and optimized production systems for end-to-end order processing, reducing delivery time from 7 to 3 days. Maintained and improved system reliability of backend services handling high-volume transactions.',
      technologies: ['Java', 'Spring Boot', 'MySQL', 'REST APIs', 'System Integration', 'Backend Services'],
      achievements: [
        'Reduced delivery time from 7 to 3 days through system optimization',
        'Maintained high-volume transaction processing systems',
        'Integrated third-party systems for inventory management',
        'Received multiple "Best Employee of the Month" awards'
      ],
      order: 3,
    },
  ];

  // Clear existing portfolio entries to prevent duplicates
  await prisma.portfolio.deleteMany({});
  
  for (const entry of portfolioEntries) {
    await prisma.portfolio.create({
      data: entry,
    });
  }

  // Create sample blog posts for each technology
  const samplePosts = [
    {
      title: 'Advanced Java 17 Features Every Developer Should Know',
      slug: 'advanced-java-17-features',
      excerpt: 'Exploring the latest features in Java 17 including sealed classes, pattern matching, and performance improvements that can enhance your enterprise applications.',
      content: `Java 17 brought significant improvements to the language and runtime. In this comprehensive guide, we'll explore the key features that every enterprise developer should understand and adopt.

## Sealed Classes
Sealed classes provide fine-grained control over inheritance hierarchies, making your code more maintainable and secure.

## Pattern Matching Enhancements
The enhanced pattern matching capabilities in Java 17 allow for more expressive and concise code, particularly in switch expressions.

## Performance Improvements
Java 17 includes significant performance optimizations, including improvements to the garbage collector and startup time.

## Best Practices
When adopting Java 17 in enterprise environments, consider the migration path and ensure compatibility with your existing frameworks and libraries.`,
      technology: 'java',
      published: true,
      tags: ['Java', 'Programming', 'Enterprise', 'Performance'],
      readTime: 8,
    },
    {
      title: 'Building Microservices with Spring Boot: A Complete Guide',
      slug: 'spring-boot-microservices-guide',
      excerpt: 'Learn how to design and implement robust microservices using Spring Boot, including service discovery, load balancing, and distributed configuration.',
      content: `Spring Boot has revolutionized how we build microservices. This guide covers the essential patterns and practices for creating production-ready microservices.

## Service Architecture
Understanding the principles of microservice architecture is crucial for building scalable and maintainable systems.

## Spring Cloud Integration
Leveraging Spring Cloud components for service discovery, configuration management, and circuit breakers.

## Testing Strategies
Implementing comprehensive testing strategies for microservices, including contract testing and integration testing.

## Deployment Patterns
Best practices for deploying microservices in containerized environments using Docker and Kubernetes.`,
      technology: 'spring-boot',
      published: true,
      tags: ['Spring Boot', 'Microservices', 'Architecture', 'Cloud'],
      readTime: 12,
    },
    {
      title: 'MySQL Performance Optimization Techniques',
      slug: 'mysql-performance-optimization',
      excerpt: 'Deep dive into MySQL performance optimization strategies, including indexing, query optimization, and database design best practices.',
      content: `Database performance is critical for application success. This article covers proven techniques for optimizing MySQL performance in production environments.

## Index Optimization
Understanding how to design and optimize indexes for maximum query performance.

## Query Analysis
Using EXPLAIN and other tools to analyze and optimize slow queries.

## Schema Design
Best practices for designing efficient database schemas that scale with your application.

## Monitoring and Maintenance
Implementing monitoring solutions and maintenance routines to keep your database performing optimally.`,
      technology: 'mysql',
      published: true,
      tags: ['MySQL', 'Database', 'Performance', 'Optimization'],
      readTime: 10,
    },
    {
      title: 'Real-time Data Processing with Apache Kafka',
      slug: 'kafka-real-time-processing',
      excerpt: 'Building robust event-driven architectures with Kafka, including stream processing, fault tolerance, and scalability patterns.',
      content: `Apache Kafka has become the backbone of modern event-driven architectures. Learn how to leverage Kafka for building resilient, scalable data processing pipelines.

## Event-Driven Architecture
Understanding the principles and benefits of event-driven systems.

## Stream Processing
Implementing real-time stream processing with Kafka Streams and other processing frameworks.

## Fault Tolerance
Building resilient systems that can handle failures and maintain data consistency.

## Scaling Strategies
Techniques for scaling Kafka clusters and managing high-throughput workloads.`,
      technology: 'kafka',
      published: true,
      tags: ['Kafka', 'Streaming', 'Architecture', 'Real-time'],
      readTime: 15,
    }
  ];

  // Clear existing blog posts to prevent duplicates
  await prisma.blogPost.deleteMany({});
  
  for (const post of samplePosts) {
    await prisma.blogPost.create({
      data: {
        ...post,
        authorId: admin.id,
      },
    });
  }

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
