"use client";

import { useCallback, useEffect, useState } from "react";

interface CloudPosition {
  id: number;
  top: string;
  speed: number;
  size: number;
  delay: number;
}

export const CloudsBackground = () => {
  const [clouds, setClouds] = useState<CloudPosition[]>([]);

  const generateClouds = useCallback(() => {
    const newClouds: CloudPosition[] = Array.from({ length: 6 }, (_, i) => ({
      id: i,
      top: `${20 + Math.random() * 70}%`,
      speed: 50 + Math.random() * 200,
      size: 50 + Math.random() * 300,
      delay: Math.random() * -30
    }));
    setClouds(newClouds);
  }, []);

  useEffect(() => {
    generateClouds();
  }, [generateClouds]);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-[-1]">
      {clouds.map((cloud) => (
        <div
          key={cloud.id}
          className="absolute bg-white rounded-full opacity-40"
          style={{
            width: `${cloud.size}px`,
            height: `${cloud.size / 2}px`,
            top: cloud.top,
            left: "-100px",
            animation: `moveCloud ${cloud.speed}s linear infinite`,
            animationDelay: `${cloud.delay}s`
          }}
        />
      ))}
    </div>
  );
};
