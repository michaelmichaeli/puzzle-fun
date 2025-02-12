'use client';

import { createContext, useContext, useState, useEffect } from 'react';

type SoundContextType = {
  isSoundEnabled: boolean;
  toggleSound: () => void;
  playClick: () => void;
  playSuccess: () => void;
  playComplete: () => void;
};

const SoundContext = createContext<SoundContextType | undefined>(undefined);

// Utility function to create sounds using Web Audio API
const createSound = (frequency: number, duration: number, type: OscillatorType = 'sine') => {
  if (typeof window === 'undefined') return () => {};
  
  return () => {
  const AudioContextClass = window.AudioContext || ((window as any).webkitAudioContext as typeof AudioContext);
  const audioContext = new AudioContextClass();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.type = type;
    oscillator.frequency.value = frequency;
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Quick fade out to avoid clicks
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
  };
};

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);

  // Create different sound effects
  const clickSound = createSound(800, 0.1, 'sine');
  const successSound = createSound(600, 0.15, 'triangle');
  const completeSound = () => {
    if (typeof window === 'undefined') return;
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
    notes.forEach((freq, i) => {
      setTimeout(() => {
        createSound(freq, 0.2, 'triangle')();
      }, i * 150);
    });
  };

  useEffect(() => {
    const stored = localStorage.getItem('soundEnabled');
    if (stored !== null) {
      setIsSoundEnabled(stored === 'true');
    }
  }, []);

  const toggleSound = () => {
    setIsSoundEnabled(!isSoundEnabled);
    localStorage.setItem('soundEnabled', (!isSoundEnabled).toString());
  };

  const playSoundIfEnabled = (sound: () => void) => {
    if (isSoundEnabled) {
      sound();
    }
  };

  return (
    <SoundContext.Provider 
      value={{
        isSoundEnabled,
        toggleSound,
        playClick: () => playSoundIfEnabled(clickSound),
        playSuccess: () => playSoundIfEnabled(successSound),
        playComplete: () => playSoundIfEnabled(completeSound),
      }}
    >
      {children}
    </SoundContext.Provider>
  );
}

export const useSoundContext = () => {
  const context = useContext(SoundContext);
  if (context === undefined) {
    throw new Error('useSound must be used within a SoundProvider');
  }
  return context;
};
