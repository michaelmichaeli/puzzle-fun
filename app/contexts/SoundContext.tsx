"use client";

import { createContext, useContext, useState, useEffect, useRef } from "react";

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
  volume: number = 0.5;

  initialize() {
    if (typeof window === "undefined") return;
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
    }
    return this.audioContext;
  }

  setVolume(value: number) {
    this.volume = Math.max(0, Math.min(1, value));
  }

  createOscillator(
    frequency: number,
    duration: number,
    type: OscillatorType = "sine",
  ) {
    const ctx = this.initialize();
    if (!ctx) return;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = type;
    oscillator.frequency.value = frequency;
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    gainNode.gain.setValueAtTime(this.volume * 0.5, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.001,
      ctx.currentTime + duration,
    );

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  }
}

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [volume, setVolume] = useState(0.5);
  const soundManager = useRef(new SoundManager());
  useEffect(() => {
    const stored = localStorage.getItem("soundEnabled");
    const storedVolume = localStorage.getItem("soundVolume");

    if (stored !== null) {
      setIsSoundEnabled(stored === "true");
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
    localStorage.setItem("soundVolume", newVolume.toString());
  };

  const toggleSound = () => {
    setIsSoundEnabled((prev) => {
      const newState = !prev;
      localStorage.setItem("soundEnabled", newState.toString());

      return newState;
    });
  };

  const playIfEnabled = (callback: () => void) => {
    if (isSoundEnabled) callback();
  };

  const effects = {
    playClick: () => soundManager.current.createOscillator(800, 0.1, "sine"),
    playSuccess: () =>
      soundManager.current.createOscillator(800, 0.08, "triangle"),
    playComplete: () => {
      const notes = [
        { freq: 523.25, duration: 0.1 }, // C5
        { freq: 659.25, duration: 0.1 }, // E5
        { freq: 783.99, duration: 0.1 }, // G5
        { freq: 1046.5, duration: 0.2 }, // C6
        { freq: 987.77, duration: 0.08 }, // B5
        { freq: 783.99, duration: 0.08 }, // G5
        { freq: 659.25, duration: 0.08 }, // E5
        { freq: 523.25, duration: 0.3 }, // C5
      ];

      notes.forEach(({ freq, duration }, i) => {
        setTimeout(() => {
          soundManager.current.createOscillator(
            freq,
            duration,
            i < 4 ? "triangle" : "square",
          );
        }, i * 120);
      });
    },
    playDrawLine: () => {
      const ctx = soundManager.current.initialize();
      if (!ctx) return;

      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(800, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(
        200,
        ctx.currentTime + 0.3,
      );

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      gainNode.gain.setValueAtTime(
        soundManager.current.volume * 0.3,
        ctx.currentTime,
      );
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.3);
    },
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
    throw new Error("useSound must be used within a SoundProvider");
  }
  return context;
};
