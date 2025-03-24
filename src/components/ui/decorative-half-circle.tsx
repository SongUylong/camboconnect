"use client";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import dynamic from 'next/dynamic';

// Dynamically import Lottie to avoid SSR issues
const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

// Load animation data at component level to avoid reloading
const LottieIcon = ({ animationPath, size }: { animationPath: string, size: number }) => {
  const [animationData, setAnimationData] = useState<any>(null);
  
  useEffect(() => {
    // Fetch the animation JSON only on client side
    fetch(animationPath)
      .then(response => response.json())
      .then(data => setAnimationData(data))
      .catch(error => console.error('Error loading animation:', error));
  }, [animationPath]);
  
  if (!animationData) return <div className="w-full h-full animate-pulse bg-gray-200 rounded-full"></div>;
  
  return (
    <Lottie
      animationData={animationData}
      loop={true}
      style={{ width: size * 4, height: size * 4 }}
    />
  );
};

interface DecorativeHalfCircleProps {
  width?: number;
  height?: number;
  borderColor?: string;
  className?: string;
  hideOnMobile?: boolean;
  showBottomBorder?: boolean;
  iconColor?: string;
  iconSize?: number;
  flowColor?: string;
}

/**
 * A decorative half-circle component that can be used to add visual interest to pages.
 * By default, it creates a dashed half-circle with a teal border and no bottom line.
 * Features animated border, icons (Discover, Connect, Grow), and a flowing effect along the circle.
 */
export function DecorativeHalfCircle({
  width = 900,
  height = 410,
  borderColor = "border-theme-teal/30",
  className = "",
  hideOnMobile = true,
  showBottomBorder = false,
  iconColor = "text-theme-teal",
  iconSize = 24,
  flowColor = "text-theme-teal/25",
}: DecorativeHalfCircleProps) {
  // Store dimensions for responsive calculations
  const [dimensions, setDimensions] = useState({ width, height });

  // Animation variants for the half-circle
  const circleVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        duration: 0.8, 
        ease: "easeOut" 
      }
    },
    rotate: {
      rotate: [0, 1, 0, -1, 0],
      transition: {
        duration: 8,
        ease: "easeInOut",
        repeat: Infinity,
        repeatType: "mirror" as const
      }
    }
  };
  
  // Animation variants for the icons
  const iconVariants = {
    hidden: { opacity: 0 },
    visible: (custom: number) => ({
      opacity: 0.6, // Start with lower opacity
      scale: 1,
      transition: {
        delay: 0.3 + (custom * 0.2),
        duration: 0.5,
        ease: "easeOut"
      }
    }),
    highlight: { 
      opacity: 1,
      scale: 1.15,
      filter: "drop-shadow(0 0 8px rgba(255, 255, 255, 0.5))",
      transition: {
        duration: 0.5,
        ease: [0.34, 1.56, 0.64, 1] // Spring-like effect
      }
    },
    normal: { 
      opacity: 0.6,
      scale: 1,
      filter: "drop-shadow(0 0 0px transparent)",
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };
  
  // Animation variants for the text labels
  const textVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 10 },
    visible: { 
      opacity: 0,  // Start hidden
      scale: 0.9,
      y: 10,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    },
    show: { 
      opacity: 1, 
      scale: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.34, 1.56, 0.64, 1], // Spring-like effect
      }
    },
    hide: { 
      opacity: 0, 
      scale: 0.9,
      y: 10,
      transition: {
        duration: 0.3,
        ease: "easeIn"
      }
    }
  };
  
  // Flow particle animation variants with exactly three stops at the icons
  const flowParticleVariants = {
    hidden: { opacity: 0, pathLength: 0, pathOffset: 0.166 }, // Start at first icon
    visible: {
      opacity: [0, 1, 1, 1, 1, 1, 0], // Full opacity for the entire journey, fade out only at the end
      pathLength: 0.05, // Very short segment to look like a dot
      pathOffset: [
        0.166,    // Start exactly at first icon (Discover)
        0.166,    // Hold at first icon
        0.44,     // Move to second icon (Connect)
        0.44,     // Hold at second icon
        0.775,    // Move to third icon (Grow)
        0.775,    // Hold at third icon
        0.78,     // Slight movement at end before fading out
      ],
      transition: {
        pathOffset: {
          duration: 6, // Slightly longer for better timing
          times: [0, 0.2, 0.45, 0.6, 0.85, 0.95, 1], // Adjusted timing
          ease: "linear", // Linear movement between icons
          repeat: Infinity,
          repeatDelay: 1, // Pause before restarting
        },
        opacity: {
          duration: 6, // Match duration with pathOffset
          times: [0, 0.05, 0.45, 0.6, 0.85, 0.95, 1], // Fade in quickly, stay visible, fade out at end
          ease: "linear",
          repeat: Infinity,
          repeatDelay: 1, // Match repeatDelay with pathOffset
        },
        pathLength: {
          duration: 0.01,
        }
      }
    }
  };
  
  useEffect(() => {
    // Update dimensions when props change
    setDimensions({ width, height });
  }, [width, height]);
  
  // Important constants for positioning with precise calculations
  const borderWidth = 2;
  const adjustedWidth = dimensions.width;
  const adjustedHeight = dimensions.height;
  
  // Half-circle calculations
  const centerX = adjustedWidth / 2;
  const centerY = adjustedHeight;
  
  // We want exact pixels for accurate border alignment
  const radius = {
    x: (adjustedWidth / 2) - 1, // Adjust by 1px to account for the border width
    y: adjustedHeight - 1       // Adjust by 1px to account for the border width
  };
  
  // Icons and their text labels
  const icons = [
    {
      name: "Discover",
      icon: (
        <div className="relative flex items-center justify-center" style={{ width: iconSize * 4, height: iconSize * 4 }}>
          <LottieIcon animationPath="/animations/light.json" size={iconSize * 4} />
        </div>
      )
    },
    {
      name: "Connect",
      icon: (
        <div className="relative flex items-center justify-center" style={{ width: iconSize * 4, height: iconSize * 4 }}>
          <LottieIcon animationPath="/animations/hand.json" size={iconSize * 4} />
        </div>
      )
    },
    {
      name: "Grow",
      icon: (
        <div className="relative flex items-center justify-center" style={{ width: iconSize * 4, height: iconSize * 4 }}>
          <LottieIcon animationPath="/animations/win.json" size={iconSize * 4} />
        </div>
      )
    }
  ];
  
  // Generate the SVG path for the half-circle
  const generateHalfCirclePath = () => {
    return `M 0,${centerY} A ${radius.x},${radius.y} 0 0 1 ${adjustedWidth},${centerY}`;
  };
  
  // Calculation function for points along the path
  const getPointOnPath = (percent: number) => {
    // Convert percent to angle (in radians)
    // 0% = 180 degrees (π radians), 100% = 0 degrees (0 radians)
    const angle = Math.PI * (1 - percent);
    
    // Calculate point on the half-circle
    const x = centerX + radius.x * Math.cos(angle);
    const y = centerY - radius.y * Math.sin(angle);
    
    return { x, y, angle: (1 - percent) * 180 }; // angle in degrees for text positioning
  };
  
  // Calculate positions for the icons (at 16.6%, 50%, and 83.3%)
  const iconPoints = [
    getPointOnPath(0.166), // Left - 30 degrees
    getPointOnPath(0.5),   // Center - 90 degrees
    getPointOnPath(0.833)  // Right - 150 degrees
  ];
  
  // Track the current animation position for icon highlights  
  const [currentIconHighlight, setCurrentIconHighlight] = useState<number | null>(null);
  
  // Use refs to store animation timing info
  const animationRef = useRef({
    startTime: Date.now(),
    isRunning: false
  });
  
  // Set up animation listeners to detect when the animation reaches each icon
  useEffect(() => {
    // Initialize animation reference with current time
    animationRef.current = {
      startTime: Date.now(),
      isRunning: true
    };
    
    const animationDuration = 6000; // 6s duration
    const pauseDuration = 1000; // 1s pause
    const totalCycleDuration = animationDuration + pauseDuration;
    
    // Exact timing based on the animation keyframes
    const iconTimings = [
      { start: 0, end: 1200 },           // First icon: 0-20% of animation (0-1.2s)
      { start: 2700, end: 3600 },        // Second icon: 45-60% of animation (2.7-3.6s)
      { start: 5100, end: 5700 }         // Third icon: 85-95% of animation (5.1-5.7s)
    ];
    
    // Set up interval to check animation position
    const interval = setInterval(() => {
      // Calculate time in current animation cycle
      const elapsed = Date.now() - animationRef.current.startTime;
      const currentTime = elapsed % totalCycleDuration;
      
      // Check if we're at any icon
      let foundHighlight = null;
      for (let i = 0; i < iconTimings.length; i++) {
        if (currentTime >= iconTimings[i].start && currentTime <= iconTimings[i].end) {
          foundHighlight = i;
          break;
        }
      }
      
      // Only update state if needed to avoid unnecessary re-renders
      if (foundHighlight !== currentIconHighlight) {
        setCurrentIconHighlight(foundHighlight);
      }
      
      // Detect the start of a new cycle to reset timing reference
      if (currentTime < 50 && elapsed > totalCycleDuration) {
        animationRef.current.startTime = Date.now();
      }
    }, 16); // 60fps check for smoother transitions
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative" style={{ 
      width: `${adjustedWidth}px`, 
      height: `${adjustedHeight}px`,
      position: "absolute",
      left: "50%",
      transform: "translateX(-50%)",
      top: `-${adjustedHeight / 10}px`
    }}>
      {/* Half-circle border - Now removed */}
      {/* We're removing this element to keep only the flowing animation
      <motion.div
        initial="hidden"
        animate={["visible", "rotate"]}
        variants={circleVariants}
        className={cn(
          hideOnMobile ? "hidden md:block" : "",
          "absolute inset-0 border-2 border-dashed",
          borderColor,
          "rounded-t-full",
          !showBottomBorder && "border-b-0",
          className
        )}
      />
      */}
      
      {/* SVG for the flow animation and icons */}
      <svg 
        className={cn(hideOnMobile ? "hidden md:block" : "")}
        width={adjustedWidth} 
        height={adjustedHeight} 
        style={{ position: "absolute", top: 0, left: 0, overflow: "visible" }}
      >
        {/* Flow animation path */}
        <motion.path 
          d={generateHalfCirclePath()} 
          fill="none" 
          stroke="currentColor"
          strokeWidth={iconSize / 1.5} // Thicker dot
          strokeLinecap="round"
          initial="hidden"
          animate="visible"
          variants={flowParticleVariants}
          className={flowColor}
        />
        
        {/* Icons placed directly in SVG for perfect alignment */}
        {iconPoints.map((point, index) => (
          <g key={`icon-group-${index}`} className="group">
            {/* Icon circle marker */}
            <motion.g
              initial="hidden"
              animate={currentIconHighlight === index ? "highlight" : "normal"}
              custom={index}
              variants={iconVariants}
              style={{ 
                transformOrigin: `${point.x}px ${point.y}px`,
                cursor: "pointer"
              }}
            >
              {/* The actual icon using a foreign object for proper HTML/SVG integration */}
              <foreignObject
                x={point.x - (iconSize / 2)}
                y={point.y - (iconSize / 2)}
                width={iconSize}
                height={iconSize}
                className={cn(
                  "overflow-visible",
                  iconColor,
                  "transition-all duration-300" 
                )}
              >
                <div className="w-full h-full flex items-center justify-center">
                  {icons[index].icon}
                </div>
              </foreignObject>
              
              {/* Text label that appears on animation stops */}
              <foreignObject
                width={120}
                height={40}
                style={{
                  overflow: "visible",
                  ...getPositionForLabel(point, iconSize)
                }}
              >
                <motion.div 
                  initial="hidden"
                  animate={currentIconHighlight === index ? "show" : "hide"}
                  variants={textVariants}
                  className="bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-lg font-medium inline-block whitespace-nowrap border-l-4 border-theme-teal"
                >
                  {icons[index].name}
                </motion.div>
              </foreignObject>
            </motion.g>
          </g>
        ))}
      </svg>
    </div>
  );
}

// Helper function to position text labels correctly based on icon position
function getPositionForLabel(point: { x: number, y: number, angle: number }, iconSize: number) {
  // Left side
  if (point.angle < 60) {
    return {
      x: point.x - 110 - (iconSize / 2),
      y: point.y - 20
    };
  }
  // Top
  else if (point.angle >= 60 && point.angle <= 120) {
    return {
      x: point.x - 60,
      y: point.y - 50
    };
  }
  // Right side
  else {
    return {
      x: point.x + (iconSize / 2),
      y: point.y - 20
    };
  }
}