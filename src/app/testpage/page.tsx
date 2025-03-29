"use client"
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Users, Briefcase, Building, Search, BookOpen, CheckCircle, Clock } from 'lucide-react';

const HomePage = () => {
  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  };
  
  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3
      }
    }
  };
  
  // Stats data
  const stats = [
    { label: 'Active Users', value: '10,000+', icon: <Users className="h-6 w-6" /> },
    { label: 'Opportunities', value: '1,500+', icon: <Briefcase className="h-6 w-6" /> },
    { label: 'Partner Organizations', value: '200+', icon: <Building className="h-6 w-6" /> }
  ];
  
  // Features data
  const features = [
    {
      title: 'Opportunity Discovery',
      description: 'Find scholarships, internships, jobs, and workshops all in one place.',
      icon: <Search className="h-10 w-10 text-theme-teal" />
    },
    {
      title: 'Community Engagement',
      description: 'Connect with organizations and follow their latest opportunities.',
      icon: <Users className="h-10 w-10 text-theme-teal" />
    },
    {
      title: 'Application Tracking',
      description: 'Manage and monitor your applications all from your dashboard.',
      icon: <CheckCircle className="h-10 w-10 text-theme-teal" />
    },
    {
      title: 'Real-time Updates',
      description: 'Receive notifications about deadlines and new opportunities.',
      icon: <Clock className="h-10 w-10 text-theme-teal" />
    }
  ];
  
  // Pain points data
  const painPoints = [
    {
      title: 'Fragmented Information',
      description: 'Opportunities are scattered across different platforms, making them hard to discover.',
    },
    {
      title: 'Limited Visibility',
      description: 'Many valuable opportunities remain hidden, especially for those outside major cities.',
    },
    {
      title: 'Application Overload',
      description: 'Managing multiple applications across different organizations is overwhelming.',
    }
  ];
  
  // Testimonials data
  const testimonials = [
    {
      quote: "CamboConnect helped me find and secure a scholarship that completely changed my educational journey.",
      author: "Sokha Chhay",
      role: "Student, Royal University of Phnom Penh"
    },
    {
      quote: "As an educator, I'm able to share opportunities with my students more efficiently than ever before.",
      author: "Dr. Vannak Prum",
      role: "Professor, Institute of Technology of Cambodia"
    }
  ];

  return (
    <div className="font-body text-theme-slate">
      {/* Hero Section */}
      <section className="bg-theme-cream min-h-screen flex items-center justify-center text-center px-4">
        <motion.div 
          className="max-w-4xl mx-auto"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          <h1 className="font-heading font-bold text-4xl md:text-5xl lg:text-6xl text-theme-navy mb-4">
            Discover & Apply for the Best Opportunities in Cambodia
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-theme-slate">
            A centralized platform for academic, professional, and entrepreneurial opportunities.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button 
              className="bg-theme-teal hover:bg-teal-600 text-white px-8 py-3 rounded-lg font-semibold text-lg flex items-center justify-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Get Started <ArrowRight className="ml-2 h-5 w-5" />
            </motion.button>
            <motion.button 
              className="border-2 border-theme-navy text-theme-navy hover:bg-theme-navy hover:text-white px-8 py-3 rounded-lg font-semibold text-lg flex items-center justify-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Learn More <BookOpen className="ml-2 h-5 w-5" />
            </motion.button>
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            {stats.map((stat, index) => (
              <motion.div 
                key={index}
                className="bg-white rounded-xl shadow-lg p-6 text-center border-l-4 border-theme-teal"
                variants={fadeIn}
              >
                <div className="flex justify-center mb-4">
                  {stat.icon}
                </div>
                <h3 className="text-4xl font-bold text-theme-navy mb-2">{stat.value}</h3>
                <p className="text-theme-slate">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-theme-cream">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div 
            className="text-center mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
          >
            <h2 className="font-heading font-bold text-3xl md:text-4xl text-theme-navy mb-4">Key Features</h2>
            <p className="text-xl max-w-3xl mx-auto">Designed to simplify your opportunity discovery and application journey.</p>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            {features.map((feature, index) => (
              <motion.div 
                key={index}
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-300"
                variants={fadeIn}
                whileHover={{ y: -5 }}
              >
                <div className="mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-theme-navy mb-2">{feature.title}</h3>
                <p className="text-theme-slate">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-16 bg-theme-navy text-white">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div 
            className="text-center mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
          >
            <h2 className="font-heading font-bold text-3xl md:text-4xl mb-4">Why We Exist</h2>
            <p className="text-xl max-w-3xl mx-auto text-gray-300">
              We're addressing critical challenges in Cambodia's opportunity ecosystem.
            </p>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            {painPoints.map((point, index) => (
              <motion.div 
                key={index}
                className="bg-theme-navy border border-gray-700 rounded-xl p-6"
                variants={fadeIn}
                whileHover={{ scale: 1.03 }}
              >
                <h3 className="text-xl font-semibold text-theme-gold mb-3">{point.title}</h3>
                <p className="text-gray-300">{point.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How to Use Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div 
            className="text-center mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
          >
            <h2 className="font-heading font-bold text-3xl md:text-4xl text-theme-navy mb-4">How to Use CamboConnect</h2>
            <p className="text-xl max-w-3xl mx-auto text-theme-slate">
              Start your journey in just a few simple steps.
            </p>
          </motion.div>
          
          <motion.div 
            className="relative"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
          >
            <div className="bg-theme-cream rounded-2xl p-8 md:p-12 relative overflow-hidden">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="md:w-1/2">
                  <h3 className="text-2xl font-semibold text-theme-navy mb-4">Your Gateway to Opportunities</h3>
                  <ul className="space-y-4">
                    <li className="flex items-start">
                      <span className="flex-shrink-0 bg-theme-teal rounded-full w-6 h-6 flex items-center justify-center text-white mr-3 mt-1">1</span>
                      <p><span className="font-semibold">Create your profile</span> - Complete your information to receive personalized opportunity matches.</p>
                    </li>
                    <li className="flex items-start">
                      <span className="flex-shrink-0 bg-theme-teal rounded-full w-6 h-6 flex items-center justify-center text-white mr-3 mt-1">2</span>
                      <p><span className="font-semibold">Discover opportunities</span> - Browse and filter opportunities based on your interests and qualifications.</p>
                    </li>
                    <li className="flex items-start">
                      <span className="flex-shrink-0 bg-theme-teal rounded-full w-6 h-6 flex items-center justify-center text-white mr-3 mt-1">3</span>
                      <p><span className="font-semibold">Apply with ease</span> - Track your application status all in one place.</p>
                    </li>
                  </ul>
                  <motion.button 
                    className="mt-6 bg-theme-teal hover:bg-teal-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    View Complete Guide <ArrowRight className="ml-2 h-5 w-5" />
                  </motion.button>
                </div>
                <div className="md:w-1/2">
                  <div className="bg-white rounded-xl shadow-lg p-4 relative">
                    {/* Placeholder for dashboard image */}
                    <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                      <p className="text-gray-500">Dashboard Preview</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-theme-cream">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div 
            className="text-center mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
          >
            <h2 className="font-heading font-bold text-3xl md:text-4xl text-theme-navy mb-4">What Our Users Say</h2>
            <p className="text-xl max-w-3xl mx-auto text-theme-slate">
              Hear from students and educators who've experienced CamboConnect.
            </p>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            {testimonials.map((testimonial, index) => (
              <motion.div 
                key={index}
                className="bg-white rounded-xl shadow-md p-6 flex flex-col"
                variants={fadeIn}
                whileHover={{ y: -5 }}
              >
                <div className="mb-4 text-theme-teal">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="currentColor" className="opacity-20">
                    <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621c.537-.278 1.24-.375 1.929-.311c1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 0 1-3.5 3.5a3.871 3.871 0 0 1-2.748-1.179Zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621c.537-.278 1.24-.375 1.929-.311c1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 0 1-3.5 3.5a3.871 3.871 0 0 1-2.748-1.179Z"/>
                  </svg>
                </div>
                <p className="text-lg mb-6 flex-grow italic">{testimonial.quote}</p>
                <div>
                  <p className="font-semibold text-theme-navy">{testimonial.author}</p>
                  <p className="text-sm text-theme-slate">{testimonial.role}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* About Us Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div 
            className="text-center mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
          >
            <h2 className="font-heading font-bold text-3xl md:text-4xl text-theme-navy mb-4">About Us</h2>
            <p className="text-xl max-w-3xl mx-auto text-theme-slate">
              A team of passionate students committed to democratizing access to opportunities.
            </p>
          </motion.div>
          
          <motion.div 
            className="bg-theme-cream rounded-xl p-6 md:p-10"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
          >
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="md:w-1/2">
                <h3 className="text-2xl font-semibold text-theme-navy mb-4">Our Mission</h3>
                <p className="mb-4">
                  CamboConnect was founded by students from Paragon International University who recognized the challenges Cambodian students face in finding and accessing opportunities.
                </p>
                <p className="mb-6">
                  Led by founder Uylongsong and CEO Linhcheu Meng, we're building a platform that bridges the gap between talented individuals and life-changing opportunities.
                </p>
                <motion.button 
                  className="bg-theme-navy hover:bg-blue-900 text-white px-6 py-3 rounded-lg font-semibold flex items-center"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Learn More About Us <ArrowRight className="ml-2 h-5 w-5" />
                </motion.button>
              </div>
              <div className="md:w-1/2">
                <div className="relative h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Team Photo</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-theme-navy text-white pt-16 pb-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div>
              <h3 className="font-heading font-semibold text-xl mb-4">CamboConnect</h3>
              <p className="text-gray-300 mb-4">A centralized platform for academic, professional, and entrepreneurial opportunities in Cambodia.</p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-300 hover:text-white">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"></path>
                  </svg>
                </a>
                <a href="#" className="text-gray-300 hover:text-white">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"></path>
                  </svg>
                </a>
                <a href="#" className="text-gray-300 hover:text-white">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"></path>
                  </svg>
                </a>
                <a href="#" className="text-gray-300 hover:text-white">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.48 22.926c-1.193.628-2.49.918-3.786.918-2.004 0-3.874-.727-5.235-1.798-.193-.152-.43-.152-.624-.004-1.359 1.06-3.22 1.787-5.201 1.787-1.303 0-2.597-.29-3.787-.918-.84-.403-.667-1.66.346-1.894 2.814-.652 5.12-2.305 6.427-4.596.215-.38.712-.38.927 0 1.306 2.291 3.613 3.944 6.428 4.596 1.013.235 1.187 1.492.346 1.895zm-12.236-7.013c-2.445-1.052-4.02-3.505-4.02-6.32 0-3.988 3.373-7.221 7.515-7.221s7.516 3.233 7.516 7.22c0 2.816-1.575 5.27-4.02 6.322-.134.057-.358.135-.623.135-.26 0-.487-.078-.622-.135zm-.797-6.32c0 2.367 1.584 4.339 3.738 4.984.12.036.28.071.485.071.204 0 .37-.035.485-.07 2.153-.646 3.738-2.618 3.738-4.985 0-2.86-2.248-5.172-4.996-5.172-2.746 0-4.996 2.312-4.996 5.172zm10.476 4.316c.252-.395.694-.681 1.192-.681.346 0 .675.158.942.438.241.253.391.591.391.95 0 .357-.15.695-.39.945-.266.28-.596.438-.943.438-.525 0-.965-.287-1.193-.682.229.395.668.682 1.193.682.347 0 .677-.158.943-.438.24-.25.39-.588.39-.945 0-.359-.15-.697-.39-.95-.267-.28-.596-.438-.943-.438-.498 0-.94.286-1.192.681z"></path>
                  </svg>
                </a>
              </div>
            </div>
            <div>
              <h3 className="font-heading font-semibold text-xl mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-300 hover:text-white">Home</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white">Browse Opportunities</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white">Organizations</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white">About Us</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-heading font-semibold text-xl mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-300 hover:text-white">User Guide</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white">FAQ</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white">Terms of Service</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white">Disclaimer</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-heading font-semibold text-xl mb-4">Contact Us</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <svg className="h-6 w-6 mr-2 text-theme-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-gray-300">support@camboconnect.com</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 mr-2 text-theme-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="text-gray-300">(+855) 123-456-789</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 mr-2 text-theme-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-gray-300">Phnom Penh, Cambodia</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm mb-4 md:mb-0">&copy; 2025 CamboConnect. All rights reserved.</p>
              <div className="flex space-x-6">
                <a href="#" className="text-gray-400 hover:text-white text-sm">Privacy Policy</a>
                <a href="#" className="text-gray-400 hover:text-white text-sm">Terms of Service</a>
                <a href="#" className="text-gray-400 hover:text-white text-sm">Disclaimer</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;