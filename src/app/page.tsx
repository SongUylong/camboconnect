"use client";
import Link from "next/link";
import { MainLayout } from "@/components/layout/main-layout";
import { motion } from "framer-motion";
import { ReactiveBackground } from "@/components/ui/ReactiveBackground";
import { FloatingPaths } from "@/components/ui/FloatingPaths";
import { BackgroundBeams } from "@/components/ui/BackgroundBeams";
import { ArrowRight, Upload, Users, RotateCcw } from "lucide-react";
import { AnimatedFeatureCardGrid } from "@/components/ui/AnimatedFeatureCard";
import { InfiniteSlider } from "@/components/ui/infinite-slider";
import WhyWeExist from "@/components/ui/Why-we-exit";
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
      staggerChildren: 0.2
    }
  }
};

// Pain points data for the "Why We Exist" section
const painPoints = [
  {
    title: "Fragmented Information",
    description: "Opportunities are scattered across different platforms, making it difficult for Cambodians to discover them."
  },
  {
    title: "Limited Access",
    description: "Many talented individuals miss opportunities because they aren't connected to the right networks."
  },
  {
    title: "Lack of Guidance",
    description: "Navigating application processes and requirements can be challenging without proper support and resources."
  }
];

export default function Home() {
  return (
    <MainLayout>

      {/* Hero Section with reactive dot background */}
      <div className="relative isolate bg-gradient-to-r from-theme-navy to-theme-teal/90 overflow-hidden ">
        {/* Reactive background dots */}
        <BackgroundBeams className="h-screen absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-90" />
        <ReactiveBackground
          dotColor="bg-white/10"
          dotSize={2}
          dotSpacing={30}
          sensitivity={3}
        />

        {/* Reduced top padding to move content up */}
        <div className="mx-auto max-w-7xl px-6 py-16 sm:py-24 lg:px-8 mb-24">
          <div className="mx-auto max-w-7xl flex flex-col lg:flex-row items-center justify-between relative">
            {/* Left Floating Paths Animation */}
            <div className="hidden lg:block absolute left-0 top-0 z-0 w-full h-full lg:w-[800px] lg:h-[800px] opacity-90 pointer-events-none"
              style={{ transform: 'translate(-45%, -20%)' }}>
              <FloatingPaths position={1} />
            </div>

            {/* Center Text Content - removed mt-10 from span to move content up */}
            <div className="mx-auto max-w-2xl text-center lg:w-1/2 z-30 relative">
              {/* Using our enhanced DecorativeHalfCircle component with icons for Discover, Connect, and Grow */}
              {/* <DecorativeHalfCircle 
                width={920}
                height={450}
                borderColor="border-white/40"
                iconColor="text-theme-gold"
                iconSize={24}
                flowColor="text-theme-gold/40"
              /> */}

              <span className="inline-block px-4 py-1 rounded-full text-sm font-medium bg-white/20 text-white mb-5">
                Opportunity Platform for Cambodia
              </span>
              <motion.h1
                className="text-4xl font-bold tracking-tight text-white sm:text-6xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                Discover Opportunities in Cambodia
              </motion.h1>
              <motion.p
                className="mt-6 text-lg leading-8 text-gray-200"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                CamboConnect is your centralized platform for finding and applying to opportunities
                across Cambodia - from startups and incubation programs to hackathons and internships.
              </motion.p>
              <motion.div
                className="mt-6 flex items-center justify-center gap-x-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <Link
                  href="/opportunities"
                  className="btn bg-white hover:bg-white/90 text-theme-navy btn-lg"
                >
                  Explore Opportunities
                </Link>
                <Link href="/guide" className="text-sm font-semibold leading-6 text-white flex items-center gap-x-1 hover:text-theme-gold transition-all duration-300 ease-in-out">
                  Learn more <span aria-hidden="true" className="inline-block transition-transform duration-300 ease-in-out group-hover:translate-x-1">→</span>
                </Link>
              </motion.div>
            </div>

            {/* Right Floating Paths Animation */}
            <div className="hidden lg:block absolute right-0 top-0 z-0 w-full h-full lg:w-[800px] lg:h-[800px] opacity-70 pointer-events-none"
              style={{ transform: 'translate(75%, -25%) scaleX(-0.75)' }}>
              <FloatingPaths position={-1} />
            </div>
          </div>
        </div>

        {/* Replace straight gradient with curved SVG wave divider */}
        <div className="absolute inset-x-0 bottom-0 w-full overflow-hidden leading-none">
          <div className="relative w-full h-16 sm:h-24">
            <svg className="absolute block w-full h-16 sm:h-24 lg:bottom-2 bottom-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
              <path
                d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z"
                className="fill-theme-teal-light"
              ></path>
            </svg>
            <svg className="absolute block w-full h-16 sm:h-24 lg:left-20 left-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
              <path
                d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z"
                className="fill-gray-600"
              ></path>
            </svg>
            <svg className="absolute block w-full h-16 sm:h-24" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
              <path
                d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z"
                className="fill-white"
              ></path>
            </svg>
          </div>
        </div>
      </div>

      {/* Feature section with light background */}
      <div className="bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-theme-teal/10 text-theme-teal mb-2">
              Find Your Path
            </span>
            <p className="mt-2 text-3xl font-bold tracking-tight text-theme-navy sm:text-4xl">
              Everything you need to grow and succeed
            </p>
            <p className="mt-6 text-lg leading-8 text-theme-slate">
              CamboConnect brings it all together!
            </p>
          </div>
          <div className="mx-auto mt-8 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <AnimatedFeatureCardGrid
              cards={[
                {
                  icon: "./animations/icon1.json",
                  title: "Discover Opportunities",
                  description: "Browse opportunities from startups, incubators, companies, and more. Filter by category, deadline, and eligibility to find the perfect match.",
                  linkText: "Explore opportunities",
                  linkHref: "/opportunities",
                  accentColor: "#EAB308",
                  iconBackground: "bg-theme-teal/10",
                  linkColor: "text-theme-teal hover:text-theme-teal/90",
                  width: 100,
                  height: 100,
                },
                {
                  icon: "./animations/icon2.json",
                  title: "Connect with Community",
                  description: "Engage with organizations and past participants. Learn from others' experiences and expand your network in Cambodia's growing ecosystem.",
                  linkText: "Join community",
                  linkHref: "/community",
                  accentColor: "#EAB308", // theme-gold
                  iconBackground: "bg-theme-teal/10",
                  linkColor: "text-theme-gold hover:text-theme-gold/90",
                  width: 200,
                  height: 200,
                },
                {
                  icon: "./animations/icon3.json",
                  title: "Track Your Journey",
                  description: "Save opportunities, track applications, and build a portfolio of your experiences. Show off your accomplishments and growth along the way.",
                  linkText: "Create account",
                  linkHref: "/register",
                  accentColor: "#EAB308", // theme-sage
                  iconBackground: "bg-theme-teal/10",
                  linkColor: "text-theme-sage hover:text-theme-sage/90",
                  width: 100,
                  height: 100,
                }
              ]}
              className="px-4"
            />
          </div>

          <div className="w-screen relative sm:left-[49%] sm:right-[51%] left-[49%] right-[49%] -ml-[50vw] -mr-[50vw] mt-16 py-12 px-6 overflow-hidden">
            <InfiniteSlider gap={10} reverse children={[
              <div key="text1" className="bg-white px-3 py-4 rounded-lg shadow-md">
                <p className="font-bold tracking-wider text-theme-teal uppercase text-lg">STARTUP INCUBATOR</p>
              </div>,
              <div key="text2" className="bg-white px-3 py-4 rounded-lg shadow-md">
                <p className="font-bold tracking-wider text-theme-gold uppercase text-lg">ENTREPRENEURSHIP</p>
              </div>,
              <div key="text3" className="bg-white px-3 py-4 rounded-lg shadow-md">
                <p className="font-bold tracking-wider text-theme-sage uppercase text-lg">MENTORSHIP</p>
              </div>,
              <div key="text4" className="bg-white px-3 py-4 rounded-lg shadow-md">
                <p className="font-bold tracking-wider text-theme-teal-light uppercase text-lg">HACKATHONS</p>
              </div>,
              <div key="text5" className="bg-white px-3 py-4 rounded-lg shadow-md">
                <p className="font-bold tracking-wider text-theme-gold uppercase text-lg">TECH EVENTS</p>
              </div>,
              <div key="text6" className="bg-white px-3 py-4 rounded-lg shadow-md">
                <p className="font-bold tracking-wider text-theme-sage uppercase text-lg">GLOBAL EXCHANGE</p>
              </div>,
              <div key="text7" className="bg-white px-3 py-4 rounded-lg shadow-md">
                <p className="font-bold tracking-wider text-theme-teal uppercase text-lg">COMPETITIONS</p>
              </div>,
              <div key="text8" className="bg-white px-3 py-4 rounded-lg shadow-md">
                <p className="font-bold tracking-wider text-theme-gold uppercase text-lg">SCHOLARSHIPS</p>
              </div>,
              <div key="text9" className="bg-white px-3 py-4 rounded-lg shadow-md">
                <p className="font-bold tracking-wider text-theme-sage uppercase text-lg">INTERNSHIPS</p>
              </div>,
              <div key="text10" className="bg-white px-3 py-4 rounded-lg shadow-md">
                <p className="font-bold tracking-wider text-theme-teal-light uppercase text-lg">NETWORKING</p>
              </div>
            ]} />
          </div>

        </div>
      </div>

      {/* Stats section with dynamic background gradient and sticky title - Redesigned */}
      <div className="relative">
        {/* Section Content */}
        <div className="bg-gradient-to-t from-theme-navy to-theme-navy/80 py-24 sm:py-32 relative z-10 overflow-visible">
          <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-30">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 relative">

              {/* Left: Sticky Title Section */}
              <div className="lg:col-span-1 relative lg:sticky top-0 self-start">
                <div className="text-left space-y-4">
                  <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
                    Empowering Cambodia's Future
                  </h2>
                  <p className="text-xl leading-8 text-gray-300">
                    A thriving community of students, organizations, and changemakers building Cambodia’s future.
                  </p>
                </div>
              </div>

              {/* Right: Stats Section */}
              <div className="lg:col-span-1">
                <div className="space-y-6">
                  <div className="grid grid-cols-1  gap-6">


                    {/* Active Users Stat */}
                    <div className="bg-white/5 backdrop-blur-sm p-8 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-300">
                      <div className="flex items-center justify-between">
                        <div className="text-left">
                          <p className="text-sm font-medium text-gray-300 mb-1">Active Users</p>
                          <h3 className="text-3xl md:text-4xl font-bold text-white">8,000+</h3>
                        </div>
                        <div className="h-12 w-12 bg-theme-teal/20 rounded-full flex items-center justify-center">
                          <Users className="h-6 w-6 text-theme-teal" />
                        </div>
                      </div>
                    </div>

                    {/* Organizations Stat */}
                    <div className="bg-white/5 backdrop-blur-sm p-8 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-300">
                      <div className="flex items-center justify-between">
                        <div className="text-left">
                          <p className="text-sm font-medium text-gray-300 mb-1">Organizations</p>
                          <h3 className="text-3xl md:text-4xl font-bold text-white">200+</h3>
                        </div>
                        <div className="h-12 w-12 bg-theme-gold/20 rounded-full flex items-center justify-center">
                          <RotateCcw className="h-6 w-6 text-theme-gold" />
                        </div>
                      </div>
                    </div>

                    {/* Opportunities Stat */}
                    <div className="bg-white/5 backdrop-blur-sm p-8 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-300">
                      <div className="flex items-center justify-between">
                        <div className="text-left">
                          <p className="text-sm font-medium text-gray-300 mb-1">Opportunities</p>
                          <h3 className="text-3xl md:text-4xl font-bold text-white">500+</h3>
                        </div>
                        <div className="h-12 w-12 bg-theme-sage/20 rounded-full flex items-center justify-center">
                          <Upload className="h-6 w-6 text-theme-sage" />
                        </div>
                      </div>
                    </div>



                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* SVG Background at Bottom */}
          <div className="sm:absolute bottom-0 left-0 right-0 z-10 opacity-70 hidden lg:block">
            <svg
              className="w-full"
              viewBox="0 0 1920 265"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="none"
            >
              <g clipPath="url(#clip0_11004_227)">
                <path
                  opacity="0.3"
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M1919.76 156.196C1716.39 264.124 1424.92 293.756 1045.34 245.092C727.146 57.0101 378.617 27.378 -0.242188 156.196V363.769H1919.76V156.196Z"
                  fill="white"
                />

                <path
                  opacity="0.6"
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M1919.76 186.084C1627.29 306.095 1307.29 306.095 959.758 186.084C612.227 66.0735 292.227 66.0735 -0.242188 186.084V363.768H1919.76V186.084Z"
                  fill="#f0e6d2"
                />

                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M1919.76 199.967C1631.04 280.184 1311.04 280.184 959.758 199.967C608.471 119.751 288.471 119.751 -0.242188 199.967V684.65H1919.76V199.967Z"
                  fill="#001525"
                />
              </g>
              <defs>
                <clipPath id="clip0_11004_227">
                  <rect width="1920" height="353" fill="white" />
                </clipPath>
              </defs>
            </svg>

          </div>
        </div>
      </div>

      {/* Why We Exist Section with accent background to match CTA */}
      <WhyWeExist />
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
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      href="/guide"
                      className="mt-6 bg-theme-teal hover:bg-teal-600 text-white px-6 py-3 rounded-lg font-semibold inline-block"
                    >
                      View Complete Guide <ArrowRight className="ml-2 h-5 w-5 inline-block" />
                    </Link>
                  </motion.div>
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
      {/* Explore opportunities */}
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
            {/* {testimonials.map((testimonial, index) => (
              <motion.div 
                key={index}
                className="bg-white rounded-xl shadow-md p-6 flex flex-col"
                variants={fadeIn}
                whileHover={{ y: -5 }}
              >
                <div className="mb-4 text-theme-teal">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="currentColor" className="opacity-20">
                    <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621c.537-.278 1.24-.375 1.929-.311c1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 0 1-3.5 3.5a3.871 3.871 0 0 1-2.748-1.179Zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621c.537-.278 1.24-.375 1.929-.311c1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 0 1-3.5 3.5a3.871 3.871 0 0 1-2.748-1.179Zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621c.537-.278 1.24-.375 1.929-.311c1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 0 1-3.5 3.5a3.871 3.871 0 0 1-2.748-1.179Z"/>
                  </svg>
                </div>
                <p className="text-lg mb-6 flex-grow italic">{testimonial.quote}</p>
                <div>
                  <p className="font-semibold text-theme-navy">{testimonial.author}</p>
                  <p className="text-sm text-theme-slate">{testimonial.role}</p>
                </div>
              </motion.div>
            ))} */}
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
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    href="/about"
                    className="bg-theme-navy hover:bg-blue-900 text-white px-6 py-3 rounded-lg font-semibold inline-block"
                  >
                    Learn More About Us <ArrowRight className="ml-2 h-5 w-5 inline-block" />
                  </Link>
                </motion.div>
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
    </MainLayout >
  );
}