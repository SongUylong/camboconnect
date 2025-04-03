"use client";
import Link from "next/link";
import { MainLayout } from "@/components/layout/main-layout";
import { motion } from "framer-motion";
import { ReactiveBackground } from "@/components/ui/ReactiveBackground";
import { FloatingPaths } from "@/components/ui/FloatingPaths";
import { DotLottieWorkerReact } from "@lottiefiles/dotlottie-react";
import { BackgroundBeams } from "@/components/ui/BackgroundBeams";

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
                <Link href="/about" className="text-sm font-semibold leading-6 text-white flex items-center gap-x-1 hover:text-theme-gold transition-all duration-300 ease-in-out">
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
              CamboConnect brings together opportunities, communities, and resources to help you take
              the next step in your career or entrepreneurial journey.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              <div className="flex flex-col bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 ease-in-out">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-theme-navy">
                  <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-theme-teal/10">
                    <svg
                      className="h-5 w-5 flex-none text-theme-teal"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.5 17a4.5 4.5 0 01-1.44-8.765 4.5 4.5 0 018.302-3.046 3.5 3.5 0 014.504 4.272A4 4 0 0115 17H5.5zm3.75-2.75a.75.75 0 001.5 0V9.66l1.95 2.1a.75.75 0 101.1-1.02l-3.25-3.5a.75.75 0 00-1.1 0l-3.25 3.5a.75.75 0 101.1 1.02l1.95-2.1v4.59z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  Discover Opportunities
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-theme-slate">
                  <p className="flex-auto">
                    Browse opportunities from startups, incubators, companies, and more. Filter by
                    category, deadline, and eligibility to find the perfect match.
                  </p>
                  <p className="mt-6">
                    <Link
                      href="/opportunities"
                      className="group flex items-center text-sm font-semibold leading-6 text-theme-teal hover:text-theme-teal/90 transition-colors"
                    >
                      Explore opportunities
                      <span aria-hidden="true" className="inline-block transition-transform duration-300 ease-in-out group-hover:translate-x-1 ml-1">→</span>
                    </Link>
                  </p>
                </dd>
              </div>

              <div className="flex flex-col bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 ease-in-out">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-theme-navy">
                  <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-theme-gold/10">
                    <svg
                      className="h-5 w-5 flex-none text-theme-gold"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  Connect with Community
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-theme-slate">
                  <p className="flex-auto">
                    Engage with organizations and past participants. Learn from others' experiences
                    and expand your network in Cambodia's growing ecosystem.
                  </p>
                  <p className="mt-6">
                    <Link
                      href="/community"
                      className="group flex items-center text-sm font-semibold leading-6 text-theme-gold hover:text-theme-gold/90 transition-colors"
                    >
                      Join community
                      <span aria-hidden="true" className="inline-block transition-transform duration-300 ease-in-out group-hover:translate-x-1 ml-1">→</span>
                    </Link>
                  </p>
                </dd>
              </div>

              <div className="flex flex-col bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 ease-in-out">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-theme-navy">
                  <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-theme-sage/10">
                    <svg
                      className="h-5 w-5 flex-none text-theme-sage"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M15.312 11.424a5.5 5.5 0 01-9.201 2.466l-.312-.311h2.433a.75.75 0 000-1.5H3.989a.75.75 0 00-.75.75v4.242a.75.75 0 001.5 0v-2.43l.31.31a7 7 0 0011.712-3.138.75.75 0 00-1.449-.39zm1.23-3.723a.75.75 0 00.219-.53V2.929a.75.75 0 00-1.5 0V5.36l-.31-.31A7 7 0 003.239 8.188a.75.75 0 101.448.389A5.5 5.5 0 0113.89 6.11l.311.31h-2.432a.75.75 0 000 1.5h4.243a.75.75 0 00.53-.219z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  Track Your Journey
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-theme-slate">
                  <p className="flex-auto">
                    Save opportunities, track applications, and build a portfolio of your experiences.
                    Show off your accomplishments and growth along the way.
                  </p>
                  <p className="mt-6">
                    <Link
                      href="/register"
                      className="group flex items-center text-sm font-semibold leading-6 text-theme-sage hover:text-theme-sage/90 transition-colors"
                    >
                      Create account
                      <span aria-hidden="true" className="inline-block transition-transform duration-300 ease-in-out group-hover:translate-x-1 ml-1">→</span>
                    </Link>
                  </p>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* Stats section with gradient background */}
      <div className="bg-gradient-to-r from-theme-navy to-theme-navy/80 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:max-w-none">
            <div className="text-center">
              <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Trusted by individuals and organizations across Cambodia
              </h2>
              <p className="mt-4 text-lg leading-8 text-gray-300">
                Join thousands of students, professionals, and organizations building Cambodia's future.
              </p>
            </div>
            <dl className="mt-16 grid grid-cols-1 gap-0.5 overflow-hidden rounded-2xl text-center sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex flex-col bg-white/5 backdrop-blur-sm p-8">
                <dt className="text-sm font-semibold leading-6 text-gray-300">Active Users</dt>
                <dd className="order-first text-3xl font-semibold tracking-tight text-white">8,000+</dd>
              </div>
              <div className="flex flex-col bg-white/5 backdrop-blur-sm p-8">
                <dt className="text-sm font-semibold leading-6 text-gray-300">Organizations</dt>
                <dd className="order-first text-3xl font-semibold tracking-tight text-white">200+</dd>
              </div>
              <div className="flex flex-col bg-white/5 backdrop-blur-sm p-8">
                <dt className="text-sm font-semibold leading-6 text-gray-300">Opportunities</dt>
                <dd className="order-first text-3xl font-semibold tracking-tight text-white">500+</dd>
              </div>
              <div className="flex flex-col bg-white/5 backdrop-blur-sm p-8">
                <dt className="text-sm font-semibold leading-6 text-gray-300">Success Stories</dt>
                <dd className="order-first text-3xl font-semibold tracking-tight text-white">1,200+</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* CTA Section with accent color */}
      <div className="bg-theme-sand">
        <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-theme-navy sm:text-4xl">
              Ready to discover opportunities?
            </h2>
            <p className="mt-4 text-lg text-theme-slate">
              Sign up for CamboConnect today and take the next step in your journey.
            </p>
          </div>
          <div className="mt-10 flex flex-col sm:flex-row items-center gap-y-4 gap-x-6 lg:mt-0 lg:flex-shrink-0">
            <Link href="/register" className="btn bg-theme-navy text-white hover:bg-theme-navy/90 btn-lg w-full sm:w-auto">
              Get started
            </Link>
            <Link href="/opportunities" className="text-sm font-semibold leading-6 text-theme-navy group flex items-center">
              Browse opportunities
              <span aria-hidden="true" className="inline-block transition-transform duration-300 ease-in-out group-hover:translate-x-1 ml-1">→</span>
            </Link>
          </div>
        </div>
      </div>
    </MainLayout >
  );
}