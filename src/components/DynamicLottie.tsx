"use client"
import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import Lottie to avoid SSR issues
const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

interface DynamicLottieProps {
  animationUrl: string;
  width?: number;
  height?: number;
  loop?: boolean;
}

export default function DynamicLottie({ 
  animationUrl, 
  width = 400, 
  height = 400, 
  loop = true ,
}: DynamicLottieProps) {
  const [animationData, setAnimationData] = useState<any>(null);

  useEffect(() => {
    // Fetch the animation JSON only on client side
    fetch(animationUrl)
      .then(response => response.json())
      .then(data => setAnimationData(data))
      .catch(error => console.error('Error loading animation:', error));
  }, [animationUrl]);
  return (
    <Lottie
      animationData={animationData}
      loop={loop}
      style={{ width, height }}
    />
  );
} 