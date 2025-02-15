'use client';

import { useEffect, useState } from 'react';
import ReactConfetti from 'react-confetti';
import { useSoundContext } from '../contexts/SoundContext';

interface ConfettiProps {
  isActive: boolean;
}

export default function Confetti({ isActive }: ConfettiProps) {
  const [dimensions, setDimensions] = useState({
    width: 0,
    height: 0,
  });
  const { playComplete } = useSoundContext();

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    if (isActive) {
      updateDimensions();
      playComplete();
    }

    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [isActive, playComplete]);

  if (!isActive) return null;

  return (
    <ReactConfetti
      width={dimensions.width}
      height={dimensions.height}
      numberOfPieces={200}
      recycle={false}
      colors={[
        'rgb(59 130 246)', // blue-500 for primary
        'rgb(250 204 21)', // yellow-400 for secondary
        'rgb(236 72 153)', // pink-500 for accent-pink
        'rgb(34 197 94)', // green-500 for accent-green
      ]}
      confettiSource={{
        x: dimensions.width / 2,
        y: dimensions.height / 2,
        w: 0,
        h: 0,
      }}
      className="fixed top-0 left-0 z-[1000] pointer-events-none"
    />
  );
}
