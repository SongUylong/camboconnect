"use client";
import Link from "next/link";
import { MainLayout } from "@/components/layout/main-layout";
import { motion } from "framer-motion";
import { ReactiveBackground } from "@/components/ui/ReactiveBackground";
import { FloatingPaths } from "@/components/ui/FloatingPaths";
import { BackgroundBeams } from "@/components/ui/BackgroundBeams";
import { ArrowRight, Upload, Users, RotateCcw ,CheckCircle, UserCheck ,Search, Send} from "lucide-react";
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
const testimonials = [
  {
    quote: "CamboConnect made finding internships so much easier! I discovered opportunities I wouldn't have found otherwise.",
    author: "Sokunthea Lim",
    role: "University Student",
    image: "/images/placeholder-avatar-1.png" // Replace with actual image paths
  },
  {
    quote: "As an organization, posting our programs on CamboConnect significantly increased our applicant pool quality.",
    author: "Dara Khim",
    role: "Program Manager, Tech Startup",
    image: "/images/placeholder-avatar-2.png" // Replace with actual image paths
  },
  {
    quote: "The platform is intuitive and connects students directly to valuable resources. It's a game-changer for Cambodian youth.",
    author: "Chanmony Meas",
    role: "Career Advisor, Paragon.U",
    image: "/images/placeholder-avatar-3.png" // Replace with actual image paths
  }
];
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
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-theme-teal/20 text-theme-teal mb-2"> {/* Added a badge */}
                    Platform Impact
                  </span>
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


       <section className="py-20 sm:py-28 bg-gradient-to-b from-white via-theme-cream/30 to-theme-cream/60">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <motion.div
            className="text-center mb-12 md:mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeIn}
          >
            <span className="inline-block px-4 py-1 rounded-full text-sm font-medium bg-theme-teal/10 text-theme-teal mb-3">
              Get Started Easily
            </span>
            <h2 className="font-heading font-bold text-3xl md:text-4xl lg:text-5xl text-theme-navy mb-4">
              How CamboConnect Works
            </h2>
            <p className="text-lg md:text-xl max-w-3xl mx-auto text-theme-slate">
              Navigate your path to opportunity in three simple steps.
            </p>
          </motion.div>

          <motion.div
            className="relative"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeIn}
          >
            {/* Card with gradient border effect */}
            <div className="relative p-1 bg-gradient-to-br from-theme-teal/50 via-theme-gold/50 to-theme-sage/50 rounded-2xl shadow-xl">
              <div className="bg-white rounded-xl p-8 md:p-12 relative overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-10 lg:gap-16">
                  {/* Left Side: Steps */}
                  <div className="space-y-6">
                    <h3 className="text-2xl font-semibold text-theme-navy mb-6">Your Gateway to Opportunities</h3>
                    <motion.div variants={fadeIn} className="flex items-start space-x-4">
                      <div className="flex-shrink-0 bg-theme-teal text-white rounded-full w-10 h-10 flex items-center justify-center mt-1 shadow-md">
                        <UserCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-lg text-theme-navy">1. Create Your Profile</h4>
                        <p className="text-theme-slate">Sign up and complete your profile to unlock personalized opportunity recommendations.</p>
                      </div>
                    </motion.div>
                    <motion.div variants={fadeIn} className="flex items-start space-x-4">
                      <div className="flex-shrink-0 bg-theme-gold text-white rounded-full w-10 h-10 flex items-center justify-center mt-1 shadow-md">
                         <Search className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-lg text-theme-navy">2. Discover & Filter</h4>
                        <p className="text-theme-slate">Browse diverse opportunities. Use filters to find the perfect match for your goals.</p>
                      </div>
                    </motion.div>
                     <motion.div variants={fadeIn} className="flex items-start space-x-4">
                       <div className="flex-shrink-0 bg-theme-sage text-white rounded-full w-10 h-10 flex items-center justify-center mt-1 shadow-md">
                         <Send className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-lg text-theme-navy">3. Apply & Track</h4>
                        <p className="text-theme-slate">Apply directly through the platform and easily monitor your application status.</p>
                      </div>
                    </motion.div>
                     <motion.div
                      className="mt-8"
                      whileHover={{ scale: 1.03 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <Link
                        href="/guide"
                        className="inline-flex items-center gap-x-2 btn btn-primary bg-theme-teal hover:bg-theme-teal/90 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
                      >
                        View Complete Guide <ArrowRight className="w-5 h-5" />
                      </Link>
                    </motion.div>
                  </div>

                  {/* Right Side: Image Placeholder */}
                  <motion.div
                    className="relative aspect-[16/10] rounded-lg overflow-hidden shadow-lg group"
                     variants={fadeIn}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-theme-navy/80 to-theme-teal/80 opacity-80 group-hover:opacity-90 transition-opacity duration-300 z-10"></div>
                     {/* Placeholder image - replace with actual screenshot */}
                    <img
                      src="/images/dashboard-placeholder.png" // Replace with your actual dashboard preview image
                      alt="CamboConnect Dashboard Preview"
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                     />
                    <div className="absolute inset-0 flex items-center justify-center z-20 p-4">
                      <p className="text-white text-xl font-semibold text-center bg-black/30 backdrop-blur-sm px-4 py-2 rounded-md">
                        Simplified Opportunity Tracking
                      </p>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- Testimonials Section (Improved Design) --- */}
      <section className="py-20 sm:py-28 bg-theme-sand/40"> {/* Use light sand background */}
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <motion.div
            className="text-center mb-12 md:mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeIn}
          >
             <span className="inline-block px-4 py-1 rounded-full text-sm font-medium bg-theme-gold/10 text-theme-gold mb-3">
              Community Voices
            </span>
            <h2 className="font-heading font-bold text-3xl md:text-4xl lg:text-5xl text-theme-navy mb-4">
              Success Stories
            </h2>
            <p className="text-lg md:text-xl max-w-3xl mx-auto text-theme-slate">
              Hear from individuals and organizations thriving with CamboConnect.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={staggerContainer}
          >
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col transition-all duration-300 hover:shadow-2xl border border-transparent hover:border-theme-teal/30"
                variants={fadeIn}
                whileHover={{ y: -8 }}
              >
                <div className="p-6 md:p-8 flex-grow">
                   {/* Quote Icon */}
                   <svg className="w-10 h-10 text-theme-teal/20 mb-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 14">
                    <path d="M6 0H2a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h4v1a3 3 0 0 1-3 3H2a1 1 0 0 0 0 2h1a5.006 5.006 0 0 0 5-5V2a2 2 0 0 0-2-2Zm10 0h-4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h4v1a3 3 0 0 1-3 3h-1a1 1 0 0 0 0 2h1a5.006 5.006 0 0 0 5-5V2a2 2 0 0 0-2-2Z"/>
                  </svg>
                  <p className="text-lg text-theme-slate mb-6 italic">"{testimonial.quote}"</p>
                </div>
                <div className="bg-theme-cream/50 px-6 py-5 mt-auto border-t border-gray-100">
                  <div className="flex items-center space-x-4">
                    <img className="w-12 h-12 rounded-full object-cover ring-2 ring-theme-teal/30" src={testimonial.image} alt={testimonial.author} />
                    <div>
                      <p className="font-semibold text-base text-theme-navy">{testimonial.author}</p>
                      <p className="text-sm text-theme-slate">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* --- About Us Section (Improved Design) --- */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <motion.div
            className="text-center mb-12 md:mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeIn}
          >
             <span className="inline-block px-4 py-1 rounded-full text-sm font-medium bg-theme-navy/10 text-theme-navy mb-3">
              Our Story
            </span>
            <h2 className="font-heading font-bold text-3xl md:text-4xl lg:text-5xl text-theme-navy mb-4">
              Meet the Team Behind CamboConnect
            </h2>
            <p className="text-lg md:text-xl max-w-3xl mx-auto text-theme-slate">
              Driven by passion, built by students, for students.
            </p>
          </motion.div>

          <motion.div
            className="bg-gradient-to-br from-theme-navy to-theme-teal/90 rounded-2xl p-8 md:p-12 shadow-xl text-white"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeIn}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
              {/* Left Side: Text Content */}
              <div className="space-y-5">
                <h3 className="text-2xl md:text-3xl font-semibold text-white">Our Mission</h3>
                <p className="text-lg text-gray-200 leading-relaxed">
                  Founded by students from Paragon International University, CamboConnect addresses the critical need for a centralized platform showcasing opportunities for Cambodian youth. We saw firsthand the fragmentation and difficulty in accessing internships, scholarships, and programs.
                </p>
                <p className="text-lg text-gray-200 leading-relaxed">
                  Led by founder Uylong Song and CEO Linhcheu Meng, our dedicated team is committed to bridging this gap, empowering students and young professionals to achieve their full potential.
                </p>
                 <motion.div
                    className="mt-8"
                    whileHover={{ scale: 1.03 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                  <Link
                    href="/about"
                     className="inline-flex items-center gap-x-2 btn bg-white hover:bg-white/90 text-theme-navy px-6 py-3 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
                   >
                    Learn More About Us <ArrowRight className="w-5 h-5" />
                  </Link>
                </motion.div>
              </div>

              {/* Right Side: Image Placeholder */}
               <motion.div
                className="relative aspect-video rounded-lg overflow-hidden shadow-lg group border-4 border-white/20"
                variants={fadeIn}
              >
                 {/* Placeholder image - replace with actual team photo */}
                 <img
                  src="/images/team-placeholder.jpg" // Replace with your actual team photo
                  alt="CamboConnect Team"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10 z-10"></div>
                <div className="absolute bottom-4 left-4 z-20 p-2">
                  <p className="text-white text-lg font-semibold drop-shadow-md">
                    Paragon.U Student Team
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
    </MainLayout >
  );
}