
'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Code2, Database, Cloud, Zap, Award, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const skills = [
  {
    category: 'Programming',
    icon: Code2,
    items: ['Java (8, 11, 17)', 'Python', 'SQL', 'Algorithm Design'],
    color: 'text-orange-400'
  },
  {
    category: 'Frameworks',
    icon: Zap,
    items: ['Spring Boot', 'Spring Framework', 'Hibernate', 'Microservices'],
    color: 'text-green-400'
  },
  {
    category: 'Cloud & DevOps',
    icon: Cloud,
    items: ['AWS (extensive)', 'Docker', 'Kubernetes', 'CI/CD'],
    color: 'text-blue-400'
  },
  {
    category: 'Databases',
    icon: Database,
    items: ['PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'DynamoDB'],
    color: 'text-purple-400'
  }
];

const achievements = [
  { icon: Award, label: '5+ Years', description: 'Professional Experience' },
  { icon: Users, label: '95%+', description: 'Code Coverage Achieved' },
  { icon: Zap, label: '57%', description: 'Performance Improvement' },
  { icon: Code2, label: '10,000+', description: 'Daily Transactions Handled' }
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
                    I'm a Senior Software Engineer with over 5 years of experience in designing and implementing 
                    highly distributed, scalable cloud-based applications. My expertise spans from backend 
                    microservices architecture to complex algorithm implementation.
                  </p>
                  <p>
                    Throughout my career, I've worked with industry leaders like Rockwallet, EPAM Systems, 
                    and Lenskart, consistently delivering high-performance solutions that drive business growth 
                    and improve user experiences.
                  </p>
                  <p>
                    I'm passionate about continuous learning and staying current with emerging technologies, 
                    particularly in areas like cloud-native development, AI/ML integration, and performance optimization.
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
            {skills.map((skill, index) => {
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
          {achievements.map((achievement, index) => {
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
