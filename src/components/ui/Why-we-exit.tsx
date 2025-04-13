"use client";

// Keep motion import if you plan to use it for other things like hover effects,
// but we're removing the whileInView reveal from the main row.
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import Image from "next/image";
// Assuming this path is correct
import {
  ImageComparison,
  ImageComparisonImage,
  ImageComparisonSlider,
} from "./image-comparison";

// --- Updated painPoints array (remains the same) ---
const painPoints = [
  {
    title: "Scattered & Hard-to-Find Opportunities",
    subtitle: "Opportunity Access",
    description:
      "Opportunities are hidden across Facebook groups, Telegram channels, Messenger chats, and random websites. Staying updated is chaotic, and great chances slip through the cracks.",
    points: [
      "One platform for scholarships, jobs, internships, and events",
      "Smart filters and search to find what matters fast",
      "Real-time tags like \"Closing Soon\" or \"New\"",
      "Visual labels for trending or recommended picks",
    ],
    beforeImageUrl: "https://media.camboconnect.com/Ui/1.png",
    afterImageUrl: "https://media.camboconnect.com/Ui/2.png",
    imageWidth: 1024,
    imageHeight: 1226,
  },
  {
    title: "No Way to Track or Stay Organized",
    subtitle: "Application Management",
    description:
      "People apply, then forget. Deadlines are missed. There’s no simple way to see what’s next or what’s been done.",
    points: [
      "Dashboard to track applications and statuses",
      "Email and in-app reminders for deadlines and updates",
      "Bookmarking to save and organize key opportunities",
      "Follow-up prompts to stay on top of everything",
    ],
    imageUrl: "https://media.camboconnect.com/Ui/3.png",
    imageWidth: 1024,
    imageHeight: 1024,
  },
  {
    title: "Feeling Lost or Alone in the Process",
    subtitle: "User Empowerment",
    description:
      "Many feel stuck or unsure, especially first-timers. Without guidance or community, it’s hard to know what to do or who to ask.",
    points: [
      "Step-by-step onboarding and guides",
      "Community Q&A with past participants",
      "Success stories to inspire and motivate",
      "Connect with friends on similar paths",
    ],
    imageUrl: "https://media.camboconnect.com/Ui/4.png",
    imageWidth: 739,
    imageHeight: 739,
  },
];

// Removed the Framer Motion 'fadeIn' variant definition as we'll use AOS for the main reveal

export default function WhyWeExist() {
  return (
    <section className="bg-gradient-to-t from-theme-cream-light to-white py-24 px-6">
      {/* --- Add AOS to the main heading section --- */}
      <div
        className="max-w-5xl mx-auto text-center mb-20"
        data-aos="fade-up" // Add AOS animation
        data-aos-duration="800" // Optional: control speed
      >
        <h2 className="text-4xl lg:text-5xl font-bold text-theme-navy mb-4">
          Why We Exist
        </h2>
        <p className="text-lg lg:text-xl text-gray-700 max-w-3xl mx-auto">
          We address Cambodia’s biggest opportunity gaps — building a future
          where young people thrive.
        </p>
      </div>

      <div className="space-y-24 max-w-6xl mx-auto">
        {painPoints.map((item, index) => {
          const isEven = index % 2 === 0;

          const imageAspectRatio =
            item.imageWidth && item.imageHeight
              ? `${item.imageWidth} / ${item.imageHeight}`
              : "16 / 9";

          return (
            // Use a regular div instead of motion.div if only using AOS for reveal
            <div
              key={index}
              className={`flex flex-col md:flex-row ${
                !isEven ? "md:flex-row-reverse" : ""
              } items-center gap-10 md:gap-16`}
              // --- Add AOS attributes to each row ---
              data-aos="fade-up" // Use 'fade-up' for a consistent reveal
              // Optionally use alternating animations: data-aos={isEven ? "fade-right" : "fade-left"}
              data-aos-duration="800" // Control animation speed
              data-aos-offset="100" // Trigger animation slightly earlier/later
              data-aos-once="true" // Animate only once
              // Removed Framer Motion reveal props: initial, whileInView, viewport, custom, variants
            >
              {/* Text Section */}
              <div className="md:w-1/2">
                <div className="uppercase text-theme-gold font-semibold text-sm lg:text-base mb-2">
                  {item.subtitle}
                </div>
                <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-theme-navy mb-4">
                  {item.title}
                </h3>
                <p className="text-base lg:text-lg text-gray-700 mb-6">
                  {item.description}
                </p>
                <ul className="space-y-3">
                  {item.points.map((point, i) => (
                    // You *could* add inner animations here (AOS or Framer Motion)
                    // but animating the whole row is often enough.
                    <li key={i} className="flex items-start gap-2">
                      <Check className="w-5 h-5 mt-0.5 flex-shrink-0 text-theme-navy" />
                      <span className="text-base lg:text-lg text-gray-800">
                        {point}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Image Section */}
              <div className="w-full md:w-1/2">
                <div
                  className="rounded-xl overflow-hidden shadow-lg w-full relative bg-gray-100"
                  style={{ aspectRatio: imageAspectRatio }}
                >
                  {index === 0 ? (
                    item.beforeImageUrl &&
                    item.afterImageUrl && (
                      <ImageComparison
                        className="absolute inset-0 w-full h-full rounded-lg"
                        enableHover
                        springOptions={{ bounce: 0.2 }}
                      >
                        <ImageComparisonImage
                          src={item.beforeImageUrl}
                          alt="Before - Disconnected Opportunities"
                          position="right"
                          className="object-cover"
                        />
                        <ImageComparisonImage
                          src={item.afterImageUrl}
                          alt="After - Centralized Platform"
                          position="left"
                          className="object-cover"
                        />
                        <ImageComparisonSlider className="w-1 bg-white/50 backdrop-blur-sm" />
                      </ImageComparison>
                    )
                  ) : item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.title}
                      layout="fill"
                      objectFit="cover"
                      className="rounded-xl"
                      // Consider adding unoptimized prop if using external URLs without Next.js Image optimization configured for them
                      // unoptimized
                    />
                  ) : null}
                  {/* Placeholder logic */}
                  {(!item.imageUrl && index !== 0 && index !== 0) ||
                    (!item.beforeImageUrl && !item.afterImageUrl && index === 0 && (
                      <div className="absolute inset-0 w-full h-full bg-gray-200 flex items-center justify-center rounded-xl">
                        <span className="text-gray-500">Image loading...</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}