"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import DynamicLottie from "../DynamicLottie";
interface AnimatedFeatureCardProps {
  icon: string;
  title: string;
  description: string;
  linkText: string;
  linkHref: string;
  accentColor: string;
  iconBackground: string;
  linkColor: string;
  dotLottieWorker?: any;
  index?: number;
  hoveredIndex?: number | null;
  width?: number;
  height?: number;
  onHover?: (index: number | null) => void;
}

export function AnimatedFeatureCard({
  icon,
  title,
  description,
  linkText,
  linkHref,
  accentColor,
  iconBackground,
  linkColor,
  index,
  hoveredIndex,
  width,
  height,
  onHover,
}: AnimatedFeatureCardProps) {
  const isHovered = hoveredIndex === index;

  return (
    <Link
      href={linkHref}
      className="relative group block p-2 h-full w-full"
      onMouseEnter={() => onHover && onHover(index!)}
      onMouseLeave={() => onHover && onHover(null)}
    >
      <AnimatePresence>
        {isHovered && (
          <motion.span
            className="absolute inset-0 h-full w-full bg-theme-gold-light/10 block rounded-3xl"
            layoutId="hoverBackground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.15 } }}
            exit={{ opacity: 0, transition: { duration: 0.15, delay: 0.2 } }}
          />
        )}
      </AnimatePresence>
      <motion.div
        className={cn(
          "relative flex flex-col bg-white p-6 rounded-2xl overflow-hidden h-[320px]",
          "border border-gray-200",
          "shadow-lg",
          "shadow-gray-800/20",
          "transition-all duration-500",
          isHovered ? "shadow-lg shadow-gray-200/50 scale-[1.01]" : "shadow-sm"
        )}
        style={{
          borderColor: isHovered ? accentColor : undefined,
        }}
        initial={{ y: 50, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        viewport={{ once: true, margin: "-50px" }}
      >
        <div className="flex flex-col items-center justify-center text-center h-full relative z-10 ">
          <motion.div
            className="flex flex-col items-center justify-center space-y-4 absolute w-full"
            animate={{
              y: isHovered ? -100 : 0,
              opacity: isHovered ? 0 : 1,
              scale: isHovered ? 0.9 : 1,
            }}
            transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
          >
            <div
              className={cn(
                "flex items-center justify-center h-20 w-20 rounded-lg shadow-md",
                iconBackground
              )}
            >
              <DynamicLottie
                animationUrl={icon}
                width={width}
                height={height}
                loop={true}
                
              />

            </div>
            <h3 className="text-xl leading-7 text-theme-navy-light font-semibold font-heading pt-2">
              {title}
            </h3>
          </motion.div>

          <motion.div
            className="flex flex-col items-center justify-center w-full h-full"
            initial={{ opacity: 0, y: 30 }}
            animate={{
              opacity: isHovered ? 1 : 0,
              y: isHovered ? 0 : 30,
            }}
            transition={{
              duration: 0.5,
              delay: isHovered ? 0.1 : 0,
              ease: [0.19, 1, 0.22, 1],
            }}
          >
            <p className="text-base leading-7 text-zinc-600 mb-6">
              {description}
            </p>
            <span
              className={cn(
                "group flex items-center text-sm font-semibold transition-all duration-300",
                linkColor
              )}
            >
              {linkText}
              <motion.span
                aria-hidden="true"
                className="ml-1"
                initial={{ x: 0 }}
                animate={{ x: 3 }}
                transition={{
                  repeat: Infinity,
                  repeatType: "reverse",
                  duration: 0.6,
                  ease: "easeInOut",
                }}
              >
                <ArrowRight className="inline-block h-4 w-4" />
              </motion.span>
            </span>
          </motion.div>
        </div>
      </motion.div>
    </Link>
  );
}

export function AnimatedFeatureCardGrid({
  cards,
  className,
}: {
  cards: Omit<AnimatedFeatureCardProps, "index" | "hoveredIndex" | "onHover">[];
  className?: string;
}) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-10 relative isolate",
        className
      )}
    >
      {cards.map((card, idx) => (
        <AnimatedFeatureCard
          key={idx}
          {...card}
          index={idx}
          hoveredIndex={hoveredIndex}
          onHover={setHoveredIndex}
        />
      ))}
    </div>
  );
}