"use client";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import React, { useRef, useEffect, useState } from "react";

export const BackgroundBeams = ({
  className,
  beamClassName,
}: {
  className?: string;
  beamClassName?: string;
}) => {
  const parentRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  // Update container width on mount and resize
  useEffect(() => {
    const updateWidth = () => {
      if (parentRef.current) {
        setContainerWidth(parentRef.current.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // Calculate beam positions based on container width
  const getBeams = () => {
    // Use a safe default width for server-side rendering
    const width = containerWidth || (typeof window !== 'undefined' ? window.innerWidth : 1000);
    
    return [
      {
        initialX: width * 0.01, // 1% of width
        translateX: width * 0.01,
        duration: 10,
        repeatDelay: 3,
        delay: 2,
      },
      {
        initialX: width * 0.3, // 30% of width
        translateX: width * 0.3,
        duration: 3,
        repeatDelay: 3,
        delay: 4,
      },
      {
        initialX: width * 0.15, // 15% of width
        translateX: width * 0.15,
        duration: 7,
        repeatDelay: 7,
        className: "h-6",
      },
      {
        initialX: width * 0.45, // 45% of width
        translateX: width * 0.45,
        duration: 5,
        repeatDelay: 14,
        delay: 4,
      },
      {
        initialX: width * 0.6, // 60% of width
        translateX: width * 0.6,
        duration: 11,
        repeatDelay: 2,
        className: "h-20",
      },
      {
        initialX: width * 0.75, // 75% of width
        translateX: width * 0.75,
        duration: 4,
        repeatDelay: 2,
        className: "h-12",
      },
      {
        initialX: width * 0.9, // 90% of width
        translateX: width * 0.9,
        duration: 6,
        repeatDelay: 4,
        delay: 2,
        className: "h-6",
      },
    ];
  };

  return (
    <div
      ref={parentRef}
      className={cn(
        "w-full h-full relative overflow-hidden",
        className
      )}
    >
      {getBeams().map((beam, index) => (
        <BeamElement
          key={`beam-${index}`}
          beamOptions={beam}
          beamClassName={beamClassName}
        />
      ))}
    </div>
  );
};

const BeamElement = ({
  beamOptions = {},
  beamClassName,
}: {
  beamOptions?: {
    initialX?: number;
    translateX?: number;
    initialY?: number;
    translateY?: number;
    rotate?: number;
    className?: string;
    duration?: number;
    delay?: number;
    repeatDelay?: number;
  };
  beamClassName?: string;
}) => {
  return (
    <motion.div
      animate="animate"
      initial={{
        translateY: beamOptions.initialY || "-200px",
        translateX: beamOptions.initialX || "0px",
        rotate: beamOptions.rotate || 0,
      }}
      variants={{
        animate: {
          translateY: beamOptions.translateY || "1800px",
          translateX: beamOptions.translateX || "0px",
          rotate: beamOptions.rotate || 0,
        },
      }}
      transition={{
        duration: beamOptions.duration || 8,
        repeat: Infinity,
        repeatType: "loop",
        ease: "linear",
        delay: beamOptions.delay || 0,
        repeatDelay: beamOptions.repeatDelay || 0,
      }}
      className={cn(
        "absolute left-0 top-20 m-auto h-14 w-px rounded-full bg-gradient-to-t from-white via-cyan-800 to-transparent",
        beamOptions.className,
        beamClassName
      )}
    />
  );
};