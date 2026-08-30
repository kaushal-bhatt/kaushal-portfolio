
'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Code2, Database, Cloud, Zap, Award, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const skills = [
  {
    category: 'Programming',
    icon: Code2,
    items: ['Java (8, 11, 17, 21)', 'Python', 'SQL', 'JavaScript'],
    color: 'text-orange-400'
  },
  {
    category: 'Frameworks',
    icon: Zap,
    items: ['Spring Boot 3.5', 'Spring Security', 'Hibernate / JPA', 'Microservices'],
    color: 'text-green-400'
  },
  {
    category: 'Messaging & Streaming',
    icon: Zap,
    items: ['Apache Kafka', 'AWS MSK (TLS/SSL)', 'SQS / SNS', 'RabbitMQ'],
    color: 'text-teal-400'
  },
  {
    category: 'Cloud & DevOps',
    icon: Cloud,
    items: ['AWS (EC2, S3, MSK, IAM)', 'Docker', 'Kubernetes', 'Terraform', 'GitHub Actions'],
    color: 'text-blue-400'
  },
  {
    category: 'Security & Auth',
    icon: Award,
    items: ['JWT / OAuth2', 'WebAuthn / Passkeys', 'HashiCorp Vault', 'RS256 · JWKS'],
    color: 'text-pink-400'
  },
  {
    category: 'Databases',
    icon: Database,
    items: ['PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'DynamoDB'],
    color: 'text-purple-400'
  },
  {
    category: 'Observability',
    icon: Users,
    items: ['Datadog', 'CloudWatch', 'ELK Stack', 'Prometheus', 'Grafana'],
    color: 'text-indigo-400'
  },
  {
    category: 'Domain',
    icon: Award,
    items: ['Crypto custody', 'Fireblocks', 'KYC / AML', 'Payment flows', 'Fraud detection'],
    color: 'text-yellow-400'
  }
];

const achievements = [
  { icon: Award, label: '7 Years', description: 'Building Backends' },
  { icon: Zap, label: '57%', description: 'Latency Reduction Delivered' },
  { icon: Users, label: '99.9%', description: 'Uptime on Regulated Systems' },
  { icon: Code2, label: '1M+', description: 'Daily Transactions Handled' }
];

export function AboutSection() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  return (
    <section id="about" ref={ref} className="py-20 bg-slate-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
            About <span className="gradient-text">Me</span>
          </h2>
          <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto px-4">
            Passionate about building scalable, high-performance applications that solve real-world problems
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 mb-16">
          {/* Story */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Card className="glass-effect border-slate-700">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-6 text-white">My Journey</h3>
                <div className="space-y-4 text-gray-300 leading-relaxed">
                  <p>
                    I&apos;m a Senior Backend Engineer with 7 years designing and operating event-driven
                    microservices where correctness is non-negotiable &mdash; crypto custody, KYC/AML
                    pipelines, payment flows, and fraud detection processing millions of transactions
                    a day.
                  </p>
                  <p>
                    My work sits at the intersection of distributed systems and security: Kafka/MSK
                    event backbones, service-to-service authentication, secrets management, and the
                    unglamorous cryptographic plumbing that keeps accounts safe. Throughout my career
                    I&apos;ve worked with RockWallet, EPAM Systems, Ibosstech Solutions, Boutiqaat and
                    Lenskart, consistently delivering high-performance solutions that drive business
                    growth.
                  </p>
                  <p>
                    At RockWallet I own services inside a 17-microservice monorepo and wrote the
                    platform-wide JWT + WebAuthn authentication framework &mdash; the same expertise
                    behind my open-source <a href="https://github.com/kaushal-bhatt/auth-platform" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">auth-platform</a> project,
                    which you can <a href="https://auth.wekt.in" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">try with a real passkey</a>.
                    Open to Senior Backend Engineer roles across the EU &mdash; Blue Card eligible,
                    English B2, German A1&ndash;A2 (in progress).
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Skills Grid */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4"
          >
            {skills.map((skill) => {
              const Icon = skill.icon;
              return (
                <motion.div
                  key={skill.category}
                  whileHover={{ scale: 1.05 }}
                  className="glass-effect rounded-lg p-4 sm:p-6 border border-slate-700"
                >
                  <div className="flex items-center mb-4">
                    <Icon className={`w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 ${skill.color} flex-shrink-0`} />
                    <h4 className="text-base sm:text-lg font-semibold text-white">{skill.category}</h4>
                  </div>
                  <ul className="space-y-1.5 sm:space-y-2">
                    {skill.items.map((item) => (
                      <li key={item} className="text-gray-300 text-xs sm:text-sm">
                        • {item}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {/* Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6"
        >
          {achievements.map((achievement) => {
            const Icon = achievement.icon;
            return (
              <motion.div
                key={achievement.label}
                whileHover={{ scale: 1.05, y: -5 }}
                className="text-center p-4 sm:p-6 glass-effect rounded-lg border border-slate-700"
              >
                <Icon className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-3 sm:mb-4 text-blue-400" />
                <div className="text-lg sm:text-2xl font-bold text-white mb-1 sm:mb-2">{achievement.label}</div>
                <div className="text-gray-300 text-xs sm:text-sm">{achievement.description}</div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
