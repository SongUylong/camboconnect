"use client";

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface ReactiveBackgroundProps {
  className?: string;
  dotColor?: string;
  dotSize?: number;
  dotSpacing?: number;
  sensitivity?: number;
}

export function ReactiveBackground({
  className,
  dotColor = 'bg-theme-teal/30',
  dotSize = 1.5,
  dotSpacing = 24,
  sensitivity = 2,
}: ReactiveBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [dots, setDots] = useState<Array<{ x: number, y: number }>>([]);

  // Initialize dots grid
  useEffect(() => {
    if (containerRef.current) {
      const { width, height } = containerRef.current.getBoundingClientRect();
      setDimensions({ width, height });
      
      // Calculate number of dots based on container size and spacing
      const rows = Math.floor(height / dotSpacing);
      const cols = Math.floor(width / dotSpacing);
      
      // Generate uniform grid of dots
      const newDots = [];
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          newDots.push({
            x: j * dotSpacing + dotSpacing/2,
            y: i * dotSpacing + dotSpacing/2
          });
        }
      }
      
      setDots(newDots);
    }
    
    // Handle resize
    const handleResize = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width, height });
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [dotSpacing]);
  
  // Track mouse movement
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
      }
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);
  
  // Calculate distance between two points
  const getDistance = (x1: number, y1: number, x2: number, y2: number) => {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  };
  
  return (
    <div 
      ref={containerRef}
      className={cn('absolute inset-0 overflow-hidden pointer-events-none z-0', className)}
    >
      <div className="relative w-full h-full">
        {dots.map((dot, i) => {
          // Calculate distance from mouse
          const distance = getDistance(dot.x, dot.y, mousePosition.x, mousePosition.y);
          const maxDistance = 200; // Max distance for effect
          
          // Calculate scale based on distance
          let scale = 1;
          if (distance < maxDistance) {
            // Scale increases as distance decreases
            scale = 1 + (sensitivity * (1 - distance / maxDistance));
          }
          
          return (
            <div
              key={i}
              className={cn('absolute rounded-full transition-transform duration-200', dotColor)}
              style={{
                width: `${dotSize}px`,
                height: `${dotSize}px`,
                transform: `translate(${dot.x}px, ${dot.y}px) scale(${scale})`,
                left: -dotSize / 2,
                top: -dotSize / 2,
              }}
            />
          );
        })}
      </div>
    </div>
  );
} 