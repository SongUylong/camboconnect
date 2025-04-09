'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import Image from 'next/image';
import { ImageComparison, ImageComparisonImage, ImageComparisonSlider } from './image-comparison'; // Import ImageComparison components

const painPoints = [
    {
        title: 'Limited Access to Quality Education',
        subtitle: 'Education Gap',
        description:
            'Many young Cambodians lack access to high-quality, affordable education that prepares them for modern job markets.',
        points: [
            'Affordable, flexible learning programs',
            'Industry-aligned curriculums',
            'Support for underserved communities',
        ],
        imageUrl: '/images/education.webp', // Not used for the first item, as we'll use ImageComparison
    },
    {
        title: 'Underdeveloped Job Opportunities',
        subtitle: 'Career Readiness',
        description:
            'Skilled graduates often struggle to find meaningful employment due to a mismatch between training and industry needs.',
        points: [
            'Bridge training to job placement',
            'Partnered with local employers',
            'Soft skills & mentorship support',
        ],
        imageUrl: '/images/jobs.webp',
    },
    {
        title: 'Disconnected Ecosystem',
        subtitle: 'Opportunity Network',
        description:
            'There’s a gap between learners, educators, and employers, making it hard to build a cohesive opportunity pipeline.',
        points: [
            'Centralized opportunity platform',
            'Events & workshops for connection',
            'Data-driven ecosystem mapping',
        ],
        imageUrl: '/images/ecosystem.webp',
    },
];

const fadeIn = {
    hidden: { opacity: 0, y: 40 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: {
            delay: i * 0.2,
            duration: 0.7,
            ease: 'easeOut',
        },
    }),
};

export default function WhyWeExist() {
    return (
        <section className="bg-gradient-to-t from-theme-cream-light to-white py-24 px-6">
            <div className="max-w-5xl mx-auto text-center mb-20">
                <h2 className="text-4xl font-bold text-theme-navy mb-4">Why We Exist</h2>
                <p className="text-lg text-gray-700 max-w-3xl mx-auto">
                    We address Cambodia’s biggest opportunity gaps — building a future where young people thrive.
                </p>
            </div>

            <div className="space-y-24 max-w-6xl mx-auto">
                {painPoints.map((item, index) => {
                    const isEven = index % 2 === 0;

                    return (
                        <motion.div
                            key={index}
                            className={`flex flex-col-reverse md:flex-row ${!isEven ? 'md:flex-row-reverse' : ''
                                } items-center gap-10 md:gap-16`}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.4 }}
                            custom={index}
                            variants={fadeIn}
                        >
                            {/* Text Section */}
                            <div className="md:w-1/2">
                                <div className="uppercase text-theme-gold font-semibold text-sm mb-2">
                                    {item.subtitle}
                                </div>
                                <h3 className="text-2xl md:text-3xl font-bold text-theme-navy mb-4">
                                    {item.title}
                                </h3>
                                <p className="text-gray-700 mb-6">{item.description}</p>
                                <ul className="space-y-3">
                                    {item.points.map((point, i) => (
                                        <li key={i} className="flex items-start gap-2">
                                            <Check />
                                            <span className="text-gray-800">{point}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Image Section */}
                            <div className="md:w-1/2">
                                <div className="rounded-xl overflow-hidden shadow-lg w-full h-[300px] md:h-[400px] relative">
                                    {index === 0 ? (
                                        // Image comparison for the first item
                                        <ImageComparison className='h-full w-full rounded-lg '
                                            enableHover
                                            springOptions={{
                                                bounce: 0.3,
                                            }}>
                                            <ImageComparisonImage
                                                src="./images/noti2.jpg" // Update this source
                                                alt="Before"
                                                position="left"
                                            />
                                            <ImageComparisonImage
                                                src="./images/noti.jpg" // Update this source
                                                alt="After"
                                                position="right"
                                            />
                                            <ImageComparisonSlider className='w-0.5 bg-white/30 backdrop-blur-xs' />
                                        </ImageComparison>
                                    ) : (
                                        // Regular image for other items
                                        <Image
                                            src={item.imageUrl}
                                            alt={item.title}
                                            width={600}
                                            height={400}
                                            className="w-full h-auto object-cover"
                                        />
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </section>
    );
}
