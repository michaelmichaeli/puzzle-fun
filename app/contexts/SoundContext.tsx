'use client';

import { createContext, useContext, useState, useEffect, useRef } from 'react';

type SoundContextType = {
  isSoundEnabled: boolean;
  volume: number;
  setVolume: (volume: number) => void;
  toggleSound: () => void;
  playClick: () => void;
  playSuccess: () => void;
  playComplete: () => void;
  playDrawLine: () => void;
};

const SoundContext = createContext<SoundContextType | undefined>(undefined);

class SoundManager {
  private audioContext: AudioContext | null = null;
  private volume: number = 0.5;
  
  initialize() {
    if (typeof window === 'undefined') return;
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    return this.audioContext;
  }

  setVolume(value: number) {
    this.volume = Math.max(0, Math.min(1, value));
  }

  createOscillator(frequency: number, duration: number, type: OscillatorType = 'sine') {
    const ctx = this.initialize();
    if (!ctx) return;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.type = type;
    oscillator.frequency.value = frequency;
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    gainNode.gain.setValueAtTime(this.volume * 0.5, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  }

}

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [volume, setVolume] = useState(0.5);
  const soundManager = useRef(new SoundManager());
  useEffect(() => {
    const stored = localStorage.getItem('soundEnabled');
    const storedVolume = localStorage.getItem('soundVolume');
    
    if (stored !== null) {
      setIsSoundEnabled(stored === 'true');
    }
    if (storedVolume !== null) {
      const vol = parseFloat(storedVolume);
      setVolume(vol);
      soundManager.current.setVolume(vol);
    }
  }, []);

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    soundManager.current.setVolume(newVolume);
    localStorage.setItem('soundVolume', newVolume.toString());
  };

  const toggleSound = () => {
    setIsSoundEnabled(prev => {
      const newState = !prev;
      localStorage.setItem('soundEnabled', newState.toString());
      
      return newState;
    });
  };

  const playIfEnabled = (callback: () => void) => {
    if (isSoundEnabled) callback();
  };

  const effects = {
    playClick: () => soundManager.current.createOscillator(800, 0.1, 'sine'),
    playSuccess: () => soundManager.current.createOscillator(600, 0.15, 'triangle'),
    playComplete: () => {
      const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
      notes.forEach((freq, i) => {
        setTimeout(() => {
          soundManager.current.createOscillator(freq, 0.2, 'triangle');
        }, i * 150);
      });
    },
    playDrawLine: () => soundManager.current.createOscillator(440, 0.1, 'square'),
  };

  return (
    <SoundContext.Provider 
      value={{
        isSoundEnabled,
        volume,
        setVolume: handleVolumeChange,
        toggleSound,
        playClick: () => playIfEnabled(effects.playClick),
        playSuccess: () => playIfEnabled(effects.playSuccess),
        playComplete: () => playIfEnabled(effects.playComplete),
        playDrawLine: () => playIfEnabled(effects.playDrawLine),
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
