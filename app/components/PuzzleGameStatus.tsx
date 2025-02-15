"use client";

import React from "react";
import { Star, RotateCcw, Trophy } from "lucide-react";
import { useSoundContext } from "../contexts/SoundContext";
import { ButtonWithTooltip } from "./ButtonWithTooltip";

interface PuzzleGameStatusProps {
  isSolved: boolean;
  progress: number;
  onRestart: () => void;
}

export const PuzzleGameStatus: React.FC<PuzzleGameStatusProps> = ({
  isSolved,
  progress,
  onRestart,
}) => {
  const { playClick } = useSoundContext();

  const getMotivationalMessage = () => {
    if (progress < 0.25) return "Let's solve this puzzle together! 🚀";
    if (progress < 0.5) return "You're doing great! Keep going! ⭐";
    if (progress < 0.75) return "Look how far you've come! 🌟";
    if (progress < 1) return "Almost there! You're amazing! 🎯";
    return "Wonderful job! You did it! 🏆";
  };

  return (
    <div
      className="space-y-6 select-none p-6 bg-white rounded-2xl shadow-lg border-2 border-blue-400/10"
      role="status"
      aria-live="polite"
    >
      <div className="text-center">
        <div className="relative h-14">
          <div
            className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${
              isSolved ? "opacity-100 scale-100" : "opacity-0 scale-95"
            }`}
          >
            <p className="text-blue-400 font-bold text-2xl font-comic flex items-center gap-3">
              <Trophy className="w-8 h-8 text-yellow-400 animate-bounce-slow" />
              Amazing Job!
              <Star className="w-8 h-8 text-yellow-400 animate-spin-slow" />
            </p>
          </div>
          <div
            className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${
              !isSolved ? "opacity-100 scale-100" : "opacity-0 scale-105"
            }`}
          >
            <p className="text-blue-400 font-comic text-xl">
              {getMotivationalMessage()}
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-4 items-center">
        <div
          className="flex-1 h-14 bg-blue-400/10 rounded-full overflow-hidden relative shadow-inner"
          role="progressbar"
          aria-valuenow={Math.round(progress * 100)}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className={`h-full transition-all duration-500 ease-out relative ${
              progress <= 0.33
                ? "bg-pink-500"
                : progress <= 0.66
                  ? "bg-yellow-500"
                  : "bg-green-500"
            }`}
            style={{ width: `${progress * 100}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent" />
          </div>
          <span className="absolute inset-0 flex items-center justify-center text-white font-comic font-bold text-xl">
            {Math.round(progress * 100)}%
          </span>
        </div>

        <ButtonWithTooltip
          onClick={() => {
            playClick();
            onRestart();
          }}
          className="group py-4 px-8 text-white rounded-full w-48
            transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 
            disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed 
            disabled:transform-none disabled:shadow-none
            flex items-center justify-center gap-3 font-comic font-bold text-lg relative overflow-hidden
            bg-gradient-to-br from-yellow-400 to-pink-500"
          tooltipContent="Reset puzzle to starting position"
        >
          <RotateCcw className="w-6 h-6 group-hover:rotate-180 transition-transform duration-500" />
          Start Over
        </ButtonWithTooltip>
      </div>
    </div>
  );
};
