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
  private musicOscillators: OscillatorNode[] = [];
  private musicGainNodes: GainNode[] = [];
  private isMusicPlaying: boolean = false;
  private currentMusicTimeout: NodeJS.Timeout | null = null;
  
  initialize() {
    if (typeof window === 'undefined') return;
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    return this.audioContext;
  }

  setVolume(value: number) {
    this.volume = Math.max(0, Math.min(1, value));
    this.musicGainNodes.forEach(gainNode => {
      gainNode.gain.setValueAtTime(this.volume * 0.2, this.audioContext?.currentTime || 0);
    });
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

  stopBackgroundMusic() {
    if (this.currentMusicTimeout) {
      clearTimeout(this.currentMusicTimeout);
      this.currentMusicTimeout = null;
    }
    
    this.musicOscillators.forEach(osc => {
      try {
        osc.stop();
        osc.disconnect();
    } catch (error: unknown) {
        // Ignore already stopped oscillators
        if (error instanceof DOMException && error.name === 'InvalidStateError') {
          // Normal case when oscillator is already stopped
          return;
        }
        console.error('Error stopping oscillator:', error);
      }
    });
    
    this.musicGainNodes.forEach(gain => {
      try {
        gain.disconnect();
    } catch (error: unknown) {
        // Ignore disconnected nodes
        if (error instanceof DOMException && error.name === 'InvalidStateError') {
          // Normal case when node is already disconnected
          return;
        }
        console.error('Error disconnecting node:', error);
      }
    });
    
    this.musicOscillators = [];
    this.musicGainNodes = [];
    this.isMusicPlaying = false;
  }

  playBackgroundMusic() {
    if (this.isMusicPlaying) return;
    
    const ctx = this.initialize();
    if (!ctx) return;

    this.stopBackgroundMusic();
    this.isMusicPlaying = true;

    const notes = [
      { freq: 329.63, duration: 0.6 }, // E4 - Gentle start
      { freq: 392.00, duration: 0.6 }, // G4
      { freq: 440.00, duration: 0.6 }, // A4
      { freq: 493.88, duration: 0.8 }, // B4 - Longer note
      { freq: 440.00, duration: 0.6 }, // A4
      { freq: 392.00, duration: 0.8 }, // G4 - End phrase
    ];

    let time = ctx.currentTime;
    notes.forEach(note => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.value = note.freq;
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      gainNode.gain.setValueAtTime(this.volume * 0.15, time); // Reduced volume
      gainNode.gain.exponentialRampToValueAtTime(0.001, time + note.duration);
      
      oscillator.start(time);
      oscillator.stop(time + note.duration);
      
      this.musicOscillators.push(oscillator);
      this.musicGainNodes.push(gainNode);
      
      time += note.duration;
    });

    // Schedule next loop before current one ends
    const totalDuration = notes.reduce((sum, note) => sum + note.duration, 0);
    this.currentMusicTimeout = setTimeout(() => {
      this.isMusicPlaying = false;
      this.playBackgroundMusic();
    }, (totalDuration * 1000) - 50); // Start slightly before the end to avoid gaps
  }
}

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [volume, setVolume] = useState(0.5);
  const soundManager = useRef(new SoundManager());
  const musicInterval = useRef<NodeJS.Timeout>();

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

    return () => {
      if (musicInterval.current) {
        clearInterval(musicInterval.current);
        soundManager.current.stopBackgroundMusic();
      }
    };
  }, []); // Run only once on mount

  // Separate effect for handling music state changes
  useEffect(() => {
    if (musicInterval.current) {
      clearInterval(musicInterval.current);
      soundManager.current.stopBackgroundMusic();
    }

    if (isSoundEnabled) {
      soundManager.current.playBackgroundMusic();
      musicInterval.current = setInterval(() => {
        soundManager.current.playBackgroundMusic();
      }, 12000); // Longer interval between loops
    }

    return () => {
      if (musicInterval.current) {
        clearInterval(musicInterval.current);
        soundManager.current.stopBackgroundMusic();
      }
    };
  }, [isSoundEnabled]);

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
