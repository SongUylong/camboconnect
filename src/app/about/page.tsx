"use client"
import React from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight, Heart, Target, Globe, MessageCircle, Mail, Facebook, Linkedin, Instagram
} from 'lucide-react';

const AboutPage = () => {
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

  // Team members data
  const teamMembers = [
    {
      name: "Uylongsong",
      role: "Founder",
      bio: "Passionate about educational equity and opportunity access across Cambodia. Founded CamboConnect to bridge the gap between talented individuals and life-changing opportunities.",
      image: "/uylongsong.jpg"
    },
    {
      name: "Linhcheu Meng",
      role: "CEO",
      bio: "Leads the strategic vision and operations of CamboConnect. Committed to creating technological solutions that address social challenges in Cambodia.",
      image: "/linhcheu.jpg"
    },
    {
      name: "Sophorn Khoun",
      role: "CTO",
      bio: "Oversees the technical development and infrastructure of the platform. Dedicated to creating a seamless and accessible user experience.",
      image: "/team-member.jpg"
    },
    {
      name: "Dara Chhay",
      role: "Community Manager",
      bio: "Builds and maintains relationships with organizations and users. Ensures that opportunities are effectively communicated to the community.",
      image: "/team-member.jpg"
    }
  ];

  // Core values data
  const coreValues = [
    {
      title: "Accessibility",
      description: "We believe that every Cambodian should have access to opportunities regardless of their background or location.",
      icon: <Globe className="h-8 w-8 text-theme-teal" />
    },
    {
      title: "Transparency",
      description: "We are committed to providing clear and honest information about opportunities and organizations.",
      icon: <MessageCircle className="h-8 w-8 text-theme-teal" />
    },
    {
      title: "Empowerment",
      description: "We strive to empower individuals by connecting them with opportunities that can transform their lives and careers.",
      icon: <Heart className="h-8 w-8 text-theme-teal" />
    },
    {
      title: "Impact",
      description: "We measure our success by the positive impact we have on individuals, organizations, and communities across Cambodia.",
      icon: <Target className="h-8 w-8 text-theme-teal" />
    }
  ];

  return (
    <div className="font-body text-theme-slate">
      {/* Header Section */}
      <section className="bg-theme-navy text-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            className="text-center"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <h1 className="font-heading font-bold text-4xl md:text-5xl mb-4">About CamboConnect</h1>
            <p className="text-xl max-w-3xl mx-auto text-gray-300">
              Learn about our mission, our team, and the vision behind Cambodia's premier opportunity platform.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            className="flex flex-col md:flex-row gap-12 items-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
          >
            <div className="md:w-1/2">
              <h2 className="font-heading font-bold text-3xl text-theme-navy mb-6">Our Story</h2>
              <p className="mb-4">
                CamboConnect was born from a simple observation: despite the abundance of opportunities in Cambodia,
                many talented individuals struggled to discover and access them due to fragmented information and lack of visibility.
              </p>
              <p className="mb-4">
                Founded in 2023 by a group of students from Paragon International University,
                the platform started as a student project aimed at helping classmates find scholarships and internships.
              </p>
              <p className="mb-4">
                What began as a small initiative quickly grew as we recognized the widespread need for a centralized
                opportunity platform across Cambodia. Today, CamboConnect serves thousands of users nationwide,
                connecting them with hundreds of opportunities from educational institutions, NGOs, and businesses.
              </p>
              <p>
                Our journey continues as we expand our reach and impact, driven by our commitment to democratize
                access to opportunities and empower Cambodians to reach their full potential.
              </p>
            </div>
            <div className="md:w-1/2">
              <div className="relative">
                <div className="bg-theme-navy rounded-xl p-6 relative z-10">
                  <div className="aspect-video bg-gray-700 rounded-lg mb-4">
                    {/* Placeholder for story image */}
                    <div className="w-full h-full flex items-center justify-center">
                      <p className="text-gray-400">Our Journey Image</p>
                    </div>
                  </div>
                  <div className="bg-theme-cream p-6 rounded-lg">
                    <h3 className="font-semibold text-xl text-theme-navy mb-2">Our Mission</h3>
                    <p className="text-theme-slate">
                      To democratize access to opportunities across Cambodia by creating a centralized,
                      user-friendly platform that connects individuals with educational, professional,
                      and personal growth opportunities.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Our Team Section */}
      <section className="py-16 bg-theme-cream">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            className="text-center mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
          >
            <h2 className="font-heading font-bold text-3xl text-theme-navy mb-4">Meet Our Team</h2>
            <p className="text-xl max-w-3xl mx-auto">
              The passionate individuals behind CamboConnect dedicated to empowering Cambodians.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            {teamMembers.map((member, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-xl shadow-md overflow-hidden"
                variants={fadeIn}
                whileHover={{ y: -5 }}
              >
                <div className="h-64 bg-gray-200">
                  {/* Placeholder for team member image */}
                  <div className="w-full h-full flex items-center justify-center">
                    <p className="text-gray-500">{member.name}'s Photo</p>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-semibold text-xl text-theme-navy">{member.name}</h3>
                  <p className="text-theme-teal font-medium mb-3">{member.role}</p>
                  <p className="text-theme-slate">{member.bio}</p>
                  <div className="mt-4 flex space-x-3">
                    <a href="#" className="text-gray-400 hover:text-theme-navy">
                      <Linkedin size={18} />
                    </a>
                    <a href="#" className="text-gray-400 hover:text-theme-navy">
                      <Mail size={18} />
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Our Values Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            className="text-center mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
          >
            <h2 className="font-heading font-bold text-3xl text-theme-navy mb-4">Our Core Values</h2>
            <p className="text-xl max-w-3xl mx-auto">
              The principles that guide our work and shape our platform.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            {coreValues.map((value, index) => (
              <motion.div
                key={index}
                className="bg-theme-cream rounded-xl p-6 text-center"
                variants={fadeIn}
                whileHover={{ y: -5 }}
              >
                <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  {value.icon}
                </div>
                <h3 className="font-semibold text-xl text-theme-navy mb-3">{value.title}</h3>
                <p>{value.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Our Vision Section */}
      <section className="py-16 bg-theme-navy text-white">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            className="flex flex-col md:flex-row gap-12 items-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
          >
            <div className="md:w-1/2">
              <h2 className="font-heading font-bold text-3xl mb-6">Our Vision</h2>
              <p className="mb-4 text-gray-300">
                We envision a Cambodia where every individual has equal access to opportunities
                that can transform their lives, regardless of their background or location.
              </p>
              <p className="mb-4 text-gray-300">
                By 2026, we aim to be the go-to platform for opportunity discovery in Cambodia,
                serving over 100,000 users and partnering with 500+ organizations.
              </p>
              <p className="mb-6 text-gray-300">
                Our long-term goals include:
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <svg className="h-6 w-6 mr-2 text-theme-teal flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Expanding our services to reach underserved rural communities</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 mr-2 text-theme-teal flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Developing personalized opportunity matching using AI technology</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 mr-2 text-theme-teal flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Creating a mentorship network connecting experienced professionals with aspiring youth</span>
                </li>
              </ul>
            </div>
            <div className="md:w-1/2">
              <div className="bg-gradient-to-r from-theme-teal to-theme-navy p-6 rounded-xl border border-teal-600">
                <h3 className="font-semibold text-2xl mb-4 text-white">Our Impact So Far</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white bg-opacity-10 p-4 rounded-lg text-center">
                    <h4 className="text-4xl font-bold text-theme-gold mb-2">10,000+</h4>
                    <p className="text-gray-200">Active Users</p>
                  </div>
                  <div className="bg-white bg-opacity-10 p-4 rounded-lg text-center">
                    <h4 className="text-4xl font-bold text-theme-gold mb-2">1,500+</h4>
                    <p className="text-gray-200">Opportunities Listed</p>
                  </div>
                  <div className="bg-white bg-opacity-10 p-4 rounded-lg text-center">
                    <h4 className="text-4xl font-bold text-theme-gold mb-2">200+</h4>
                    <p className="text-gray-200">Partner Organizations</p>
                  </div>
                  <div className="bg-white bg-opacity-10 p-4 rounded-lg text-center">
                    <h4 className="text-4xl font-bold text-theme-gold mb-2">25</h4>
                    <p className="text-gray-200">Provinces Reached</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Partner Organizations Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            className="text-center mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
          >
            <h2 className="font-heading font-bold text-3xl text-theme-navy mb-4">Our Partners</h2>
            <p className="text-xl max-w-3xl mx-auto">
              We collaborate with organizations across sectors to bring diverse opportunities to our users.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 justify-items-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((partner, index) => (
              <motion.div
                key={index}
                className="bg-gray-100 w-32 h-32 rounded-full flex items-center justify-center"
                variants={fadeIn}
                whileHover={{ scale: 1.1 }}
              >
                <p className="text-gray-500">Partner Logo</p>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            className="text-center mt-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
          >
            <a href="#" className="inline-flex items-center text-theme-teal hover:text-teal-700 font-semibold">
              View all partners
              <ArrowRight className="ml-2 h-5 w-5" />
            </a>
          </motion.div>
        </div>
      </section>

      {/* Contact Us Section */}
      <section className="py-16 bg-theme-cream">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            className="text-center mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
          >
            <h2 className="font-heading font-bold text-3xl text-theme-navy mb-4">Get In Touch</h2>
            <p className="text-xl max-w-3xl mx-auto">
              Have questions or want to collaborate? We'd love to hear from you.
            </p>
          </motion.div>

          <motion.div
            className="bg-white rounded-xl shadow-md overflow-hidden"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
          >
            <div className="flex flex-col md:flex-row">
              <div className="md:w-1/3 bg-theme-navy text-white p-8">
                <h3 className="font-semibold text-2xl mb-6">Contact Information</h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <svg className="h-6 w-6 mr-3 text-theme-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <div>
                      <p className="font-medium">Address</p>
                      <p className="text-gray-300">Phnom Penh, Cambodia</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <svg className="h-6 w-6 mr-3 text-theme-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <div>
                      <p className="font-medium">Email</p>
                      <p className="text-gray-300">support@camboconnect.com</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <svg className="h-6 w-6 mr-3 text-theme-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <div>
                      <p className="font-medium">Phone</p>
                      <p className="text-gray-300">(+855) 123-456-789</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <h4 className="font-medium mb-4">Follow Us</h4>
                  <div className="flex space-x-4">
                    <a href="#" className="bg-white bg-opacity-10 p-2 rounded-full hover:bg-opacity-20">
                      <Facebook size={20} className="text-white" />
                    </a>
                    <a href="#" className="bg-white bg-opacity-10 p-2 rounded-full hover:bg-opacity-20">
                      <Instagram size={20} className="text-white" />
                    </a>
                    <a href="#" className="bg-white bg-opacity-10 p-2 rounded-full hover:bg-opacity-20">
                      <Linkedin size={20} className="text-white" />
                    </a>
                  </div>
                </div>
              </div>
              <div className="md:w-2/3 p-8">
                <h3 className="font-semibold text-2xl text-theme-navy mb-6">Send Us a Message</h3>
                <form>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="name">Your Name</label>
                      <input
                        type="text"
                        id="name"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-theme-teal focus:border-theme-teal"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">Your Email</label>
                      <input
                        type="email"
                        id="email"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-theme-teal focus:border-theme-teal"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="subject">Subject</label>
                    <input
                      type="text"
                      id="subject"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-theme-teal focus:border-theme-teal"
                      placeholder="How can we help you?"
                    />
                  </div>
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="message">Message</label>
                    <textarea
                      id="message"
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-theme-teal focus:border-theme-teal"
                      placeholder="Your message here..."
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    className="bg-theme-teal hover:bg-teal-600 text-white px-6 py-3 rounded-lg font-semibold"
                  >
                    Send Message
                  </button>
                </form>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer - Similar to the one in HomePage */}
      <footer className="bg-theme-navy text-white pt-8 pb-6 border-t border-gray-800">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">&copy; 2025 CamboConnect. All rights reserved.</p>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-white text-sm">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-white text-sm">Terms of Service</a>
              <a href="#" className="text-gray-400 hover:text-white text-sm">Disclaimer</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AboutPage;
