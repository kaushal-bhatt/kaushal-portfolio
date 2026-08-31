
'use client';

import { motion } from 'framer-motion';
import { ChevronDown, Mail, FileText, Linkedin, Github, MapPin, Briefcase, Fingerprint } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePublishedResumes } from '@/hooks/use-published-resumes';

export function HeroSection() {
  const resumes = usePublishedResumes();

  const scrollToNext = () => {
    document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
  };

  // The section's padding is load-bearing, not decoration. The navigation is
  // `fixed` and reserves no space, and the scroll indicator below is absolutely
  // positioned — so `items-center` was centring this content in the whole
  // viewport as though both were absent. On a phone the content is taller than
  // what is actually free, and the overflow went underneath the nav: the hero
  // heading rendered on top of the brand in the bar. The padding makes the free
  // space real, and the section grows past one screen rather than overlapping
  // when it has to.
  return (
    <section id="hero" className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-24 pb-24">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-slate-700/20 rounded-full"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-slate-600/20 rounded-full"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              <span className="text-white">Hi, I&apos;m </span>
              <span className="gradient-text">Kaushal Bhatt</span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-300 mb-4">
              Senior Backend Engineer &middot; 7 years
            </p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="flex items-center justify-center space-x-2 text-gray-400 mb-8 px-4"
            >
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              <span className="text-sm sm:text-base text-center">Dehradun, India &middot; Open to EU relocation (Blue Card eligible)</span>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="mb-12"
          >
            {/*
              Leads with e-commerce scale rather than with the auth work. The
              auth framework is the most interesting thing I have built, but it
              is not the thing a recruiter is scanning for — traffic is, and the
              two consumer platforms are where the traffic was. RockWallet comes
              third here because "currently" carries it anyway.

              Company names and figures are white rather than another accent
              colour: four coloured technology words is already the limit before
              the paragraph stops reading as a sentence.
            */}
            <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed px-4">
              I build event-driven backends for systems that carry real traffic. Order processing
              at national scale for <span className="text-white font-semibold">Lenskart</span> &mdash;
              Kafka-driven inventory synchronisation that cut delivery from seven days to three.
              A distributed pricing engine across Saudi warehouses at{' '}
              <span className="text-white font-semibold">Boutiqaat</span>, carrying{' '}
              <span className="text-white font-semibold">over a million transactions a day</span>.
              Now regulated fintech: the wallet and custody platform at{' '}
              <span className="text-white font-semibold">RockWallet</span>, where I authored the
              JWT + passkey auth framework all 17 services run on. <span className="text-blue-400 font-semibold">Java</span>,
              <span className="text-green-400 font-semibold"> Spring Boot</span>,
              <span className="text-purple-400 font-semibold"> Apache Kafka</span>,
              <span className="text-yellow-400 font-semibold"> AWS</span>.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="flex flex-col sm:flex-row flex-wrap justify-center gap-4 mb-12 px-4"
          >
            <Button
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300"
              onClick={() => document.getElementById('portfolio')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <Briefcase className="w-5 h-5 mr-2" />
              View My Work
            </Button>
            
            {/*
              Second, not third: of the three, this is the only one a visitor can
              act on immediately — register a passkey, sign in with it, and watch
              every request and response. Green rather than the muted slate of
              "Get In Touch" so it reads as a live thing to use, without
              competing with the primary call to action.
            */}
            <Button
              variant="outline"
              size="lg"
              className="border-emerald-500/60 text-emerald-300 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 shadow-xl hover:shadow-2xl transition-all duration-300"
              onClick={() => window.open('https://auth.wekt.in', '_blank', 'noopener,noreferrer')}
            >
              <Fingerprint className="w-5 h-5 mr-2" />
              Try the Passkey Demo
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="border-slate-600 text-slate-300 hover:bg-slate-800 shadow-xl hover:shadow-2xl transition-all duration-300"
              onClick={() => window.open('mailto:kaushalbhatt28650@gmail.com')}
            >
              <Mail className="w-5 h-5 mr-2" />
              Get In Touch
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.6, duration: 0.8 }}
            className="flex justify-center space-x-4 sm:space-x-6 px-4"
          >
            <motion.a
              href="mailto:kaushalbhatt28650@gmail.com"
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="p-3 bg-slate-800/50 rounded-full text-gray-300 hover:text-blue-400 hover:bg-slate-700/50 transition-all duration-300 glass-effect"
            >
              <Mail className="w-6 h-6" />
            </motion.a>
            
            {/*
              The phone number used to be here. It is on the résumé PDF instead:
              this page is public and a tel: link on a public page is a scraper
              target, whereas a recruiter who downloads the PDF has the number.
              The slot is more useful pointing at the résumé anyway.

              Absent while nothing is published, because /resume 404s then.
            */}
            {resumes.length > 0 && (
              <motion.a
                href="/resume"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="p-3 bg-slate-800/50 rounded-full text-gray-300 hover:text-green-400 hover:bg-slate-700/50 transition-all duration-300 glass-effect"
                aria-label="Résumé"
              >
                <FileText className="w-6 h-6" />
              </motion.a>
            )}

            <motion.a
              href="https://www.linkedin.com/in/kaushal-bhatt-5aa73511b/"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="p-3 bg-slate-800/50 rounded-full text-gray-300 hover:text-blue-600 hover:bg-slate-700/50 transition-all duration-300 glass-effect"
            >
              <Linkedin className="w-6 h-6" />
            </motion.a>
            
            <motion.a
              href="https://github.com/kaushal-bhatt"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="p-3 bg-slate-800/50 rounded-full text-gray-300 hover:text-purple-400 hover:bg-slate-700/50 transition-all duration-300 glass-effect"
            >
              <Github className="w-6 h-6" />
            </motion.a>
          </motion.div>
        </div>
      </div>

      {/* Scroll Down Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.button
          onClick={scrollToNext}
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-gray-400 hover:text-white transition-colors duration-300"
        >
          <ChevronDown className="w-8 h-8" />
        </motion.button>
      </motion.div>
    </section>
  );
}
