
'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, ExternalLink, Github, Code2, Star, Calendar } from 'lucide-react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Mock portfolio data - in real app, this would come from API/database
const portfolioProjects = [
  {
    id: 1,
    title: "E-Commerce Microservices Platform",
    description: "A comprehensive e-commerce platform built with Spring Boot microservices, featuring user management, product catalog, order processing, and payment integration.",
    technologies: ["Java", "Spring Boot", "Spring Cloud", "PostgreSQL", "Redis", "Docker", "Kubernetes", "Apache Kafka"],
    image: "/api/placeholder/600/400",
    demoUrl: "#",
    githubUrl: "#",
    status: "In Development",
    featured: true,
    category: "Full Stack",
    completionDate: "2024-08"
  },
  {
    id: 2,
    title: "Real-time Chat Application",
    description: "A scalable real-time chat application with WebSocket support, message persistence, and user authentication using Spring Boot and React.",
    technologies: ["Java", "Spring Boot", "WebSocket", "React", "PostgreSQL", "Docker"],
    image: "/api/placeholder/600/400",
    demoUrl: "#",
    githubUrl: "#",
    status: "Completed",
    featured: true,
    category: "Backend",
    completionDate: "2024-06"
  },
  {
    id: 3,
    title: "Event Streaming Analytics",
    description: "A real-time data processing system using Apache Kafka for event streaming and analytics dashboard for business insights.",
    technologies: ["Java", "Apache Kafka", "Spring Boot", "Elasticsearch", "Kibana", "Docker"],
    image: "/api/placeholder/600/400",
    demoUrl: "#",
    githubUrl: "#",
    status: "Completed",
    featured: false,
    category: "Data Engineering",
    completionDate: "2024-04"
  },
  {
    id: 4,
    title: "Task Management API",
    description: "RESTful API for task management with authentication, authorization, and comprehensive documentation using Spring Boot.",
    technologies: ["Java", "Spring Boot", "Spring Security", "JPA", "PostgreSQL", "JWT", "Swagger"],
    image: "/api/placeholder/600/400",
    demoUrl: "#",
    githubUrl: "#",
    status: "Completed",
    featured: false,
    category: "Backend",
    completionDate: "2024-03"
  },
  {
    id: 5,
    title: "Next.js Portfolio Website",
    description: "A modern, responsive portfolio website built with Next.js, featuring a blog system and admin panel for content management.",
    technologies: ["Next.js", "React", "TypeScript", "Tailwind CSS", "PostgreSQL", "NextAuth"],
    image: "/api/placeholder/600/400",
    demoUrl: "#",
    githubUrl: "#",
    status: "Completed",
    featured: true,
    category: "Frontend",
    completionDate: "2024-08"
  }
];

const categories = ["All", "Full Stack", "Backend", "Frontend", "Data Engineering"];

export default function PortfolioPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredProjects = selectedCategory === "All" 
    ? portfolioProjects 
    : portfolioProjects.filter(project => project.category === selectedCategory);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-600/20 text-green-400 border-green-600/30';
      case 'In Development': return 'bg-yellow-600/20 text-yellow-400 border-yellow-600/30';
      default: return 'bg-gray-600/20 text-gray-400 border-gray-600/30';
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-6">
            <Link href="/">
              <Button
                variant="ghost"
                className="text-white hover:bg-slate-800 mb-4"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              My <span className="gradient-text">Portfolio</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              A showcase of my technical projects, from enterprise microservices to modern web applications
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-12"
        >
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
                className={`${
                  selectedCategory === category
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "border-slate-600 text-slate-300 hover:bg-slate-800"
                }`}
              >
                {category}
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Projects Grid */}
        <div className="space-y-8">
          {/* Featured Projects */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Featured Projects</h2>
            <div className="grid lg:grid-cols-2 gap-8 mb-12">
              {filteredProjects
                .filter(project => project.featured)
                .map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="bg-slate-800 border-slate-700 hover:border-blue-600/50 transition-all duration-300 h-full">
                    <CardHeader>
                      <div className="flex justify-between items-start mb-4">
                        <Badge className={`${getStatusColor(project.status)}`}>
                          {project.status}
                        </Badge>
                        <div className="flex items-center text-gray-400 text-sm">
                          <Calendar className="w-4 h-4 mr-1" />
                          {project.completionDate}
                        </div>
                      </div>
                      <CardTitle className="text-white text-xl mb-2">
                        {project.title}
                      </CardTitle>
                      <Badge variant="outline" className="border-blue-600/30 text-blue-400 w-fit">
                        {project.category}
                      </Badge>
                    </CardHeader>
                    
                    <CardContent>
                      <p className="text-gray-300 mb-6 leading-relaxed">
                        {project.description}
                      </p>
                      
                      <div className="mb-6">
                        <h4 className="text-white font-semibold mb-3">Technologies Used:</h4>
                        <div className="flex flex-wrap gap-2">
                          {project.technologies.map((tech) => (
                            <Badge 
                              key={tech}
                              variant="secondary"
                              className="bg-slate-700 text-gray-300 hover:bg-slate-600"
                            >
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex gap-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(project.demoUrl, '_blank')}
                          className="border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Live Demo
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(project.githubUrl, '_blank')}
                          className="text-gray-400 hover:text-white hover:bg-slate-700"
                        >
                          <Github className="w-4 h-4 mr-2" />
                          Source Code
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Other Projects */}
          {filteredProjects.filter(project => !project.featured).length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Other Projects</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProjects
                  .filter(project => !project.featured)
                  .map((project, index) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <Card className="bg-slate-800 border-slate-700 hover:border-blue-600/50 transition-all duration-300 h-full">
                      <CardHeader>
                        <div className="flex justify-between items-start mb-2">
                          <Badge className={`${getStatusColor(project.status)} text-xs`}>
                            {project.status}
                          </Badge>
                          <div className="flex items-center text-gray-400 text-xs">
                            <Calendar className="w-3 h-3 mr-1" />
                            {project.completionDate}
                          </div>
                        </div>
                        <CardTitle className="text-white text-lg mb-2">
                          {project.title}
                        </CardTitle>
                        <Badge variant="outline" className="border-blue-600/30 text-blue-400 w-fit text-xs">
                          {project.category}
                        </Badge>
                      </CardHeader>
                      
                      <CardContent>
                        <p className="text-gray-300 mb-4 text-sm leading-relaxed">
                          {project.description}
                        </p>
                        
                        <div className="mb-4">
                          <div className="flex flex-wrap gap-1">
                            {project.technologies.slice(0, 3).map((tech) => (
                              <Badge 
                                key={tech}
                                variant="secondary"
                                className="bg-slate-700 text-gray-300 text-xs"
                              >
                                {tech}
                              </Badge>
                            ))}
                            {project.technologies.length > 3 && (
                              <Badge 
                                variant="secondary"
                                className="bg-slate-700 text-gray-300 text-xs"
                              >
                                +{project.technologies.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(project.demoUrl, '_blank')}
                            className="border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white text-xs h-8"
                          >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            Demo
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(project.githubUrl, '_blank')}
                            className="text-gray-400 hover:text-white hover:bg-slate-700 text-xs h-8"
                          >
                            <Github className="w-3 h-3 mr-1" />
                            Code
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Contact Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-center mt-16 py-12 border-t border-slate-700"
        >
          <h2 className="text-2xl font-bold text-white mb-4">
            Interested in working together?
          </h2>
          <p className="text-gray-300 mb-6">
            Let's discuss how I can help bring your project to life
          </p>
          <Button
            size="lg"
            onClick={() => window.open('mailto:kaushal8650@gmail.com', '_blank')}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Get In Touch
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
