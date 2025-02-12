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
        '#2196f3', // primary
        '#ffd700', // secondary
        '#ff69b4', // accent-pink
        '#32cd32', // accent-green
      ]}
      confettiSource={{
        x: dimensions.width / 2,
        y: dimensions.height / 2,
        w: 0,
        h: 0,
      }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 1000,
        pointerEvents: 'none',
      }}
    />
  );
}
