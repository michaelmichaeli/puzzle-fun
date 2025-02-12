"use client";

import React from "react";
import { Star, RotateCcw, Trophy } from 'lucide-react';
import { useSoundContext } from "../contexts/SoundContext";

interface PuzzleGameStatusProps {
  isSolved: boolean;
  progress: number;
  onRestart: () => void;
}

export const PuzzleGameStatus: React.FC<PuzzleGameStatusProps> = ({ isSolved, progress, onRestart }) => {
  const { playClick } = useSoundContext();
  
  const getProgressColor = () => {
    if (progress <= 33) {
      return 'from-accent-pink via-secondary to-accent-green';
    } else if (progress <= 66) {
      return 'from-secondary via-primary to-accent-green';
    }
    return 'from-primary via-accent-green to-secondary';
  };

  const getMotivationalMessage = () => {
    if (progress < 25) return "You've got this! Let's start solving! 🚀";
    if (progress < 50) return "Great progress! Keep going! ⭐";
    if (progress < 75) return "You're really getting there! 🌟";
    if (progress < 100) return "Almost done! You're amazing! 🎯";
    return "Incredible job! You did it! 🏆";
  };

  return (
    <div className="space-y-4 select-none" role="status" aria-live="polite">
      <div className="text-center p-4">
        <div className="relative h-12">
          <div 
            className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${
              isSolved ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}
          >
            <p className="text-accent-green font-bold text-xl flex items-center gap-2">
              <Trophy className="w-6 h-6 animate-bounce-slow" />
              Puzzle Solved!
              <Star className="w-6 h-6 text-secondary animate-spin-slow" />
            </p>
          </div>
          <div 
            className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${
              !isSolved ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
            }`}
          >
            <p className="text-white font-comic text-lg">{getMotivationalMessage()}</p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div 
        className="w-full h-6 bg-gray-800/50 rounded-full overflow-hidden relative backdrop-blur-sm shadow-inner"
        role="progressbar"
        aria-valuenow={Math.round(progress * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={`h-full bg-gradient-to-r ${getProgressColor()} transition-all duration-500 ease-out relative`}
          style={{ width: `${progress * 100}%` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
          <span className="absolute inset-0 flex items-center justify-center text-white text-sm font-bold shadow-sm">
            {Math.round(progress * 100)}%
          </span>
        </div>
      </div>

      {/* Restart Button */}
      <button
        onClick={() => {
          playClick();
          onRestart();
        }}
        className="group w-full py-3 px-6 bg-primary hover:bg-blue-500 active:bg-blue-600 text-white rounded-full transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2 font-bold"
        aria-label="Restart puzzle game"
      >
        <RotateCcw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
        Restart Puzzle
      </button>
    </div>
  );
};
