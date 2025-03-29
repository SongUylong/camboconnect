"use client"
import React from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowRight, User, Search, CheckCircle, BookOpen, 
  Calendar, Bell, ThumbsUp, Building, Users
} from 'lucide-react';

const GuidePage = () => {
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

  // Guide steps data
  const guideSteps = [
    {
      title: "Create Your Profile",
      description: "Sign up and complete your profile with your education, skills, and interests to get personalized opportunity recommendations.",
      icon: <User className="h-10 w-10 text-theme-teal" />,
      steps: [
        "Click on the 'Sign Up' button in the top right corner",
        "Fill in your basic information and create a password",
        "Verify your email address through the confirmation link",
        "Complete your profile with education, skills, and interests"
      ],
      image: "/profile-setup.png"
    },
    {
      title: "Discover Opportunities",
      description: "Browse through various opportunities including scholarships, internships, jobs, and workshops tailored to your profile.",
      icon: <Search className="h-10 w-10 text-theme-teal" />,
      steps: [
        "Use the search bar to find specific opportunities",
        "Apply filters to narrow down results by category, deadline, or eligibility",
        "Save interesting opportunities to your bookmarks",
        "Follow organizations to see their latest opportunities"
      ],
      image: "/discover.png"
    },
    {
      title: "Apply for Opportunities",
      description: "Submit applications directly through the platform and track their status all in one place.",
      icon: <CheckCircle className="h-10 w-10 text-theme-teal" />,
      steps: [
        "Click on an opportunity to view full details",
        "Review the requirements and eligibility criteria",
        "Prepare necessary documents as specified",
        "Submit your application through the platform"
      ],
      image: "/apply.png"
    },
    {
      title: "Track Your Progress",
      description: "Monitor the status of your applications and receive updates on deadlines and new opportunities.",
      icon: <Calendar className="h-10 w-10 text-theme-teal" />,
      steps: [
        "Check your dashboard for application statuses",
        "Set up notifications for application updates",
        "Receive reminders for upcoming deadlines",
        "Review feedback and results for completed applications"
      ],
      image: "/track.png"
    }
  ];

  // Advanced tips data
  const advancedTips = [
    {
      title: "Set Up Notifications",
      description: "Configure your notification preferences to receive alerts via email or Telegram about new opportunities that match your profile.",
      icon: <Bell />
    },
    {
      title: "Build Your Network",
      description: "Connect with organizations and other users to expand your professional network and discover more opportunities.",
      icon: <Users />
    },
    {
      title: "Follow Organizations",
      description: "Stay updated with your favorite organizations by following them and receiving notifications about their new postings.",
      icon: <Building />
    },
    {
      title: "Improve Your Profile",
      description: "Regularly update your profile with new skills and experiences to receive better-matched opportunity recommendations.",
      icon: <ThumbsUp />
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
            <h1 className="font-heading font-bold text-4xl md:text-5xl mb-4">CamboConnect User Guide</h1>
            <p className="text-xl max-w-3xl mx-auto text-gray-300">
              Learn how to make the most out of CamboConnect and discover the best opportunities for your future.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Overview Section */}
      <section className="py-12 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div 
            className="bg-theme-cream rounded-xl p-6 md:p-10"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
          >
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="md:w-1/2">
                <h2 className="font-heading font-bold text-3xl text-theme-navy mb-4">Getting Started with CamboConnect</h2>
                <p className="mb-4">
                  CamboConnect is designed to simplify your journey in finding and applying for opportunities in Cambodia. 
                  This guide will walk you through the key features and functionalities of the platform.
                </p>
                <p>
                  Whether you're a student looking for scholarships, a graduate seeking internships, 
                  or a professional exploring new career paths, CamboConnect has something for you.
                </p>
              </div>
              <div className="md:w-1/2">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="font-semibold text-xl text-theme-navy mb-4">Platform Benefits</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <svg className="h-6 w-6 mr-2 text-theme-teal flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>All opportunities in one centralized location</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="h-6 w-6 mr-2 text-theme-teal flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Personalized recommendations based on your profile</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="h-6 w-6 mr-2 text-theme-teal flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Simplified application tracking across organizations</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="h-6 w-6 mr-2 text-theme-teal flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Direct connection with organizations and communities</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Step-by-Step Guide Section */}
      <section className="py-12 bg-theme-cream">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div 
            className="text-center mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
          >
            <h2 className="font-heading font-bold text-3xl text-theme-navy mb-4">Step-by-Step Guide</h2>
            <p className="text-xl max-w-3xl mx-auto">
              Follow these steps to make the most of the CamboConnect platform.
            </p>
          </motion.div>
          
          <div className="space-y-16">
            {guideSteps.map((step, index) => (
              <motion.div 
                key={index}
                className={`flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} gap-8 items-center`}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={fadeIn}
              >
                <div className="md:w-1/2">
                  <div className="flex items-center mb-4">
                    <div className="bg-white p-3 rounded-full mr-4">
                      {step.icon}
                    </div>
                    <h3 className="font-heading font-semibold text-2xl text-theme-navy">
                      {index + 1}. {step.title}
                    </h3>
                  </div>
                  <p className="mb-6 text-lg">{step.description}</p>
                  <ul className="space-y-3 mb-6">
                    {step.steps.map((substep, i) => (
                      <li key={i} className="flex items-start bg-white p-3 rounded-lg shadow-sm">
                        <span className="flex-shrink-0 bg-theme-teal rounded-full w-6 h-6 flex items-center justify-center text-white mr-3 mt-0.5 text-sm">{i + 1}</span>
                        <span>{substep}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="md:w-1/2">
                  <div className="bg-white p-4 rounded-xl shadow-md">
                    {/* Placeholder for step image */}
                    <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                      <p className="text-gray-500">{step.title} - Screenshot</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Advanced Tips Section */}
      <section className="py-12 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div 
            className="text-center mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
          >
            <h2 className="font-heading font-bold text-3xl text-theme-navy mb-4">Advanced Tips</h2>
            <p className="text-xl max-w-3xl mx-auto">
              Maximize your experience with these additional features and strategies.
            </p>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            {advancedTips.map((tip, index) => (
              <motion.div 
                key={index}
                className="bg-theme-cream rounded-xl p-6 flex"
                variants={fadeIn}
                whileHover={{ y: -5 }}
              >
                <div className="bg-white p-3 rounded-full mr-4 flex-shrink-0">
                  {tip.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-xl text-theme-navy mb-2">{tip.title}</h3>
                  <p>{tip.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 bg-theme-cream">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div 
            className="text-center mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
          >
            <h2 className="font-heading font-bold text-3xl text-theme-navy mb-4">Frequently Asked Questions</h2>
            <p className="text-xl max-w-3xl mx-auto">
              Find answers to common questions about using CamboConnect.
            </p>
          </motion.div>
          
          <motion.div 
            className="space-y-4 max-w-4xl mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            {[
              {
                question: "Is CamboConnect free to use?",
                answer: "Yes, CamboConnect is completely free for all users. Our mission is to democratize access to opportunities across Cambodia without any financial barriers."
              },
              {
                question: "How do I know if I'm eligible for an opportunity?",
                answer: "Each opportunity listing includes detailed eligibility criteria. Additionally, our platform will highlight opportunities that match your profile information, making it easier to find relevant options."
              },
              {
                question: "Can organizations post their opportunities on CamboConnect?",
                answer: "Absolutely! Organizations can create an account and submit their opportunities for approval. Once verified, their opportunities will be visible to all users on the platform."
              },
              {
                question: "How secure is my personal information on CamboConnect?",
                answer: "We take data security seriously. CamboConnect implements industry-standard security measures, including encrypted data storage and secure authentication. You also have full control over your privacy settings."
              },
              {
                question: "What should I do if I encounter technical issues?",
                answer: "If you experience any technical issues, please contact our support team through the 'Contact Us' page. We're committed to resolving any problems as quickly as possible."
              }
            ].map((faq, index) => (
              <motion.div 
                key={index}
                className="bg-white rounded-xl shadow-sm overflow-hidden"
                variants={fadeIn}
              >
                <details className="group">
                  <summary className="flex items-center justify-between cursor-pointer p-6">
                    <h3 className="font-semibold text-lg text-theme-navy">{faq.question}</h3>
                    <span className="ml-4 flex-shrink-0 text-theme-teal group-open:rotate-180 transition-transform duration-300">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </span>
                  </summary>
                  <div className="px-6 pb-6 pt-0">
                    <p>{faq.answer}</p>
                  </div>
                </details>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Video Tutorial Section */}
      <section className="py-12 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div 
            className="text-center mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
          >
            <h2 className="font-heading font-bold text-3xl text-theme-navy mb-4">Video Tutorials</h2>
            <p className="text-xl max-w-3xl mx-auto">
              Watch these helpful videos to learn how to use CamboConnect effectively.
            </p>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            {[
              {
                title: "Getting Started with CamboConnect",
                duration: "3:45"
              },
              {
                title: "How to Apply for Opportunities",
                duration: "5:12"
              }
            ].map((video, index) => (
              <motion.div 
                key={index}
                className="bg-theme-cream rounded-xl overflow-hidden shadow-md"
                variants={fadeIn}
              >
                <div className="aspect-video bg-gray-200 relative flex items-center justify-center">
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="bg-theme-teal bg-opacity-80 rounded-full p-4 cursor-pointer">
                      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="5 3 19 12 5 21 5 3"></polygon>
                      </svg>
                    </span>
                  </span>
                  <p className="text-gray-500">Video Thumbnail</p>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-xl text-theme-navy">{video.title}</h3>
                    <span className="text-sm text-gray-500">{video.duration}</span>
                  </div>
                  <p className="text-theme-slate">Learn how to navigate the platform and discover opportunities that match your profile.</p>
                </div>
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
              View all tutorials
              <ArrowRight className="ml-2 h-5 w-5" />
            </a>
          </motion.div>
        </div>
      </section>

      {/* Need Help Section */}
      <section className="py-12 bg-theme-navy text-white">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div 
            className="bg-gradient-to-r from-theme-teal to-theme-navy border border-teal-600 rounded-xl p-8 text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
          >
            <h2 className="font-heading font-bold text-3xl mb-4">Still Need Help?</h2>
            <p className="text-xl max-w-3xl mx-auto mb-8 text-gray-200">
              Our support team is ready to assist you with any questions or issues you may have.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button 
                className="bg-white text-theme-navy hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold text-lg flex items-center justify-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Contact Support
              </motion.button>
              <motion.button 
                className="border-2 border-white text-white hover:bg-white hover:text-theme-navy px-8 py-3 rounded-lg font-semibold text-lg flex items-center justify-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Visit FAQ
              </motion.button>
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

export default GuidePage;