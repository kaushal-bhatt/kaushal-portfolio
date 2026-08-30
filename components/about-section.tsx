
'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Card, CardContent } from '@/components/ui/card';
import { aboutColor, aboutIcon } from '@/lib/about-visuals';
import { renderMarkdown } from '@/lib/markdown';

/**
 * Everything here used to be three hardcoded arrays in this file, so a new skill
 * or a changed figure meant a commit and a deploy. It is all admin-managed now
 * and arrives from /api/about; see /admin/about.
 */

interface AboutContent {
  heading: string;
  headingAccent: string;
  subtitle: string;
  journeyTitle: string;
  journey: string;
}

interface AboutSkill {
  id: string;
  category: string;
  icon: string;
  items: string[];
  color: string;
}

interface AboutStat {
  id: string;
  label: string;
  description: string;
  icon: string;
}

export function AboutSection() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  const [content, setContent] = useState<AboutContent | null>(null);
  const [skills, setSkills] = useState<AboutSkill[]>([]);
  const [stats, setStats] = useState<AboutStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // One request: the three parts are always rendered together, so three
        // endpoints would only cost three round trips to show one section.
        const response = await fetch('/api/about');
        if (response.ok) {
          const data = await response.json();
          setContent(data.content);
          setSkills(data.skills);
          setStats(data.stats);
        }
      } catch (error) {
        console.error('Failed to fetch about data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <section id="about" className="py-20 bg-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-slate-700 rounded w-64 mx-auto mb-4"></div>
              <div className="h-4 bg-slate-700 rounded w-96 mx-auto"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

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
            {content?.heading}{' '}
            <span className="gradient-text">{content?.headingAccent}</span>
          </h2>
          <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto px-4">
            {content?.subtitle}
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
                <h3 className="text-2xl font-bold mb-6 text-white">{content?.journeyTitle}</h3>
                {/*
                  Markdown, not HTML: renderMarkdown escapes its input before
                  formatting it, so the links in this copy survive as links and
                  anything else stays text. The paragraph classes come from there
                  too, which is why there is no space-y-4 wrapper any more.
                */}
                <div
                  className="text-gray-300 leading-relaxed [&>p:first-child]:mt-0"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(content?.journey ?? '') }}
                />
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
              const Icon = aboutIcon(skill.icon);
              return (
                <motion.div
                  key={skill.id}
                  whileHover={{ scale: 1.05 }}
                  className="glass-effect rounded-lg p-4 sm:p-6 border border-slate-700"
                >
                  <div className="flex items-center mb-4">
                    <Icon className={`w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 ${aboutColor(skill.color)} flex-shrink-0`} />
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

        {/* Figures */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6"
        >
          {stats.map((stat) => {
            const Icon = aboutIcon(stat.icon);
            return (
              <motion.div
                key={stat.id}
                whileHover={{ scale: 1.05, y: -5 }}
                className="text-center p-4 sm:p-6 glass-effect rounded-lg border border-slate-700"
              >
                <Icon className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-3 sm:mb-4 text-blue-400" />
                <div className="text-lg sm:text-2xl font-bold text-white mb-1 sm:mb-2">{stat.label}</div>
                <div className="text-gray-300 text-xs sm:text-sm">{stat.description}</div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
