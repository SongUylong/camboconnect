// pages/index.js
import { useState } from 'react';
import { motion } from 'framer-motion';
import Head from 'next/head';
import Image from 'next/image';

export default function Home() {
  const [isConnected, setIsConnected] = useState(false);
  
  return (
    <div className="min-h-screen bg-gray-100">
      <Head>
        <title>Earnwave - Connect. Learn. Earn</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Navigation */}
      <nav className="bg-white py-4 px-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <div className="font-bold text-xl text-gray-800 flex items-center">
              <span className="text-green-600 mr-1">✓</span> earnwave
            </div>
          </div>
          
          <div className="flex space-x-8">
            <a href="#" className="text-gray-700 hover:text-gray-900">About</a>
            <a href="#" className="text-gray-700 hover:text-gray-900">For business</a>
            <a href="#" className="text-gray-700 hover:text-gray-900">Media</a>
            <a href="#" className="text-gray-700 hover:text-gray-900">Blog</a>
          </div>
          
          <button className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 font-semibold py-2 px-4 rounded">
            Sign up
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="max-w-5xl mx-auto text-center px-4">
          <motion.h1 
            className="text-6xl font-bold text-gray-800 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Connect. Learn. Earn
          </motion.h1>
          
          <motion.p 
            className="text-xl text-gray-600 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Your data is a profitable asset. With Earnwave you control what data to share anonymously and earn from it.
          </motion.p>
          
          {/* Progress Dots */}
          <div className="flex justify-center space-x-4 mt-12">
            {[1, 2, 3, 4, 5].map((step, index) => (
              <div key={index} className="relative">
                {index === 2 ? (
                  <div className="w-6 h-6 bg-white rounded-full border-2 border-gray-300 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                ) : (
                  <div className={`w-3 h-3 rounded-full ${index < 2 ? 'bg-gray-400' : 'bg-gray-300'}`}></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Three Column Section */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Earnings Card */}
          <motion.div 
            className="bg-white p-8 rounded-3xl shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-6">
              <p className="text-gray-600 text-sm">Your earnings</p>
              <h2 className="text-5xl font-bold text-gray-700">$30.00</h2>
            </div>
            
            <div className="mb-4">
              <p className="text-gray-600 text-sm">Next payout in:</p>
              <p className="font-semibold text-gray-700">10,550 pts</p>
            </div>
            
            <motion.div 
              className="h-24 w-full"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.5, delay: 0.5 }}
            >
              <svg viewBox="0 0 200 80" className="w-full h-full">
                <motion.path
                  d="M0,60 C20,40 40,80 60,60 C80,40 100,60 120,40 C140,20 160,40 180,20 C200,0"
                  fill="transparent"
                  stroke="#e0e0e0"
                  strokeWidth="2"
                />
                <motion.path
                  d="M0,60 C20,40 40,80 60,60 C80,40 100,60 120,40 C140,20 160,40 180,20 C200,0"
                  fill="transparent"
                  stroke="#475569"
                  strokeWidth="2"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 2 }}
                />
              </svg>
            </motion.div>
          </motion.div>
          
          {/* Connect Sources Card */}
          <motion.div 
            className="bg-white p-8 rounded-3xl shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className="text-xl font-semibold text-gray-700 mb-6">Connect sources</h3>
            
            <div className="mb-8">
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" value="" className="sr-only peer" checked={isConnected} onChange={() => setIsConnected(!isConnected)} />
                <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-600"></div>
              </label>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center">
                <div className="bg-black rounded-full w-12 h-12 flex items-center justify-center text-white text-xs">
                  Uber
                </div>
              </div>
              
              <div className="bg-yellow-100 rounded-full w-16 h-16 flex items-center justify-center">
                <div className="bg-yellow-400 rounded-full w-12 h-12 flex items-center justify-center text-white text-xs">
                  A
                </div>
              </div>
              
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center">
                <div className="bg-green-500 rounded-full w-12 h-12 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="white" viewBox="0 0 496 512">
                    <path d="M248 8C111.1 8 0 119.1 0 256s111.1 248 248 248 248-111.1 248-248S384.9 8 248 8zm100.7 364.9c-4.2 0-6.8-1.3-10.7-3.6-62.4-37.6-135-39.2-206.7-24.5-3.9 1-9 2.6-11.9 2.6-9.7 0-15.8-7.7-15.8-15.8 0-10.3 6.1-15.2 13.6-16.8 81.9-18.1 165.6-16.5 237 26.2 6.1 3.9 9.7 7.4 9.7 16.5s-7.1 15.4-15.2 15.4zm26.9-65.6c-5.2 0-8.7-2.3-12.3-4.2-62.5-37-155.7-51.9-238.6-29.4-4.8 1.3-7.4 2.6-11.9 2.6-10.7 0-19.4-8.7-19.4-19.4s5.2-17.8 15.5-20.7c27.8-7.8 56.2-13.6 97.8-13.6 64.9 0 127.6 16.1 177 45.5 8.1 4.8 11.3 11 11.3 19.7-.1 10.8-8.5 19.5-19.4 19.5zm31-76.2c-5.2 0-8.4-1.3-12.9-3.9-71.2-42.5-198.5-52.7-280.9-29.7-3.6 1-8.1 2.6-12.9 2.6-13.2 0-23.3-10.3-23.3-23.6 0-13.6 8.4-21.3 17.4-23.9 35.2-10.3 74.6-15.2 117.5-15.2 73 0 149.5 15.2 205.4 47.8 7.8 4.5 12.9 10.7 12.9 22.6 0 13.6-11 23.3-23.2 23.3z"/>
                  </svg>
                </div>
              </div>
              
              <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center">
                <div className="bg-red-600 rounded-full w-12 h-12 flex items-center justify-center text-white text-xs">
                  N
                </div>
              </div>
            </div>
            
            <div className="mt-12 flex justify-center">
              <button className="bg-gray-700 hover:bg-gray-800 text-white py-3 px-6 rounded-full flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                </svg>
                Download on the
                <span className="ml-1 font-semibold">App Store</span>
              </button>
            </div>
          </motion.div>
          
          {/* Learn More Card */}
          <motion.div 
            className="bg-white p-8 rounded-3xl shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="mb-8">
              <div className="bg-gray-100 p-4 rounded-lg mb-4">
                <p className="text-gray-600 text-sm">Any products I should be interested in?</p>
              </div>
              
              <div className="bg-gray-100 p-4 rounded-lg mb-4">
                <p className="text-gray-600 text-sm">Where do I mostly shop during winter season?</p>
              </div>
              
              <div className="bg-gray-100 p-4 rounded-lg">
                <p className="text-gray-600 text-sm">How much money I saved on discounts?</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-14">
              <div>
                <h3 className="text-base font-semibold text-gray-700">Learn more from your data and make better decisions</h3>
              </div>
              
              <div className="bg-gray-100 rounded-full p-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}